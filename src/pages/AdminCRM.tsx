import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Filter, PlusCircle, Search, Users } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLeads, type LeadData, type LeadInsert, type LeadUpdate } from '@/hooks/useLeads';
import { useLeadStatuses, type LeadStatus } from '@/hooks/useLeadStatuses';
import { KanbanColumn } from '@/components/admin/crm/KanbanColumn';
import { LeadCard } from '@/components/admin/crm/LeadCard';
import { NewLeadModal } from '@/components/admin/crm/NewLeadModal';
import { LeadDetailSidebar } from '@/components/admin/crm/LeadDetailSidebar';
import { type Activity, type EnrichedLead, type Property } from '@/types/crm';
import { ConfirmationDialog } from '@/components/admin/crm/ConfirmationDialog';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { DateRange } from 'react-day-picker';

// Type definitions


export default function AdminCRM() {
  // Hooks
  const { toast } = useToast();
  const { statuses, loading: loadingStatuses } = useLeadStatuses();
  const { leads, loading: loadingLeads, error: errorLeads, createLead, updateLead, deleteLead } = useLeads();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const isMobile = useIsMobile();

  // Component State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLead, setActiveLead] = useState<EnrichedLead | null>(null);
  const [isNewLeadModalOpen, setNewLeadModalOpen] = useState(false);
  const [newLeadData, setNewLeadData] = useState<Partial<LeadInsert>>({});
  const [selectedLead, setSelectedLead] = useState<EnrichedLead | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<EnrichedLead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [properties, setProperties] = useState<Property[]>([
    { id: 'prop1', title: 'Casa na Praia', reference: 'CASA001' },
    { id: 'prop2', title: 'Apartamento no Centro', reference: 'APT002' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px to distinguish click from drag
      },
    })
  );

  // Memos
  const enrichedLeads: EnrichedLead[] = useMemo(() => {
    if (!leads || !statuses) return [];
    const defaultStatus = statuses.find(s => s.order_num === 1) || statuses[0];
    return leads.map(lead => ({
      ...lead,
      status: statuses.find(s => s.id === lead.status_id) || defaultStatus,
    }));
  }, [leads, statuses]);

  const sortedStatuses = useMemo(() => {
    if (!statuses) return [];
    return [...statuses].sort((a, b) => a.order_num - b.order_num);
  }, [statuses]);

  const filteredLeads = useMemo(() => {
    let result = enrichedLeads;

    if (searchTerm) {
      result = result.filter(lead =>
        (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.phone || '').includes(searchTerm)
      );
    }

    if (dateRange?.from && dateRange?.to) {
      result = result.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate >= dateRange.from! && leadDate <= dateRange.to!;
      });
    }

    return result;
  }, [enrichedLeads, searchTerm, dateRange]);

  const leadsByStatus = useMemo(() => {
    const grouped = new Map<string, EnrichedLead[]>();
    sortedStatuses.forEach(status => grouped.set(status.id, []));
    filteredLeads.forEach(lead => {
      const group = grouped.get(lead.status.id);
      if (group) {
        group.push(lead);
      }
    });
    return grouped;
  }, [filteredLeads, sortedStatuses]);

  // Handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const lead = enrichedLeads.find(l => l.id === active.id);
    if (lead) {
      setActiveLead(lead);
    }
  }, [enrichedLeads]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    const activeType = active.data.current?.type;
    if (activeType !== 'Lead') return;

    const overType = over.data.current?.type;
    if (overType !== 'Column') return;

    const lead = active.data.current?.lead as EnrichedLead;
    if (!lead) return;

    const newStatusId = over.id as string;

    if (lead.status.id === newStatusId) return;

    const newStatus = statuses.find(s => s.id === newStatusId);
    if (!newStatus) return;

    try {
      await updateLead(lead.id, { status_id: newStatusId });
      toast({
        title: 'Status Atualizado!',
        description: `O lead "${lead.name}" foi movido para "${newStatus.name}".`,
      });
    } catch (error) {
      console.error("Failed to update lead status:", error);
      toast({
        title: 'Erro ao Atualizar',
        description: 'Não foi possível alterar o status do lead. Tente novamente.',
        variant: 'destructive',
      });
    }
  }, [statuses, updateLead, toast]);

  const handleOpenNewLeadModal = (statusId?: string) => {
    setNewLeadData(statusId ? { status_id: statusId } : {});
    setNewLeadModalOpen(true);
  };

  const handleCreateLead = async (leadData: LeadInsert) => {
    try {
      await createLead(leadData);
      toast({ title: 'Lead criado com sucesso!' });
      setNewLeadModalOpen(false);
    } catch (error) {
      console.error('Failed to create lead:', error);
      toast({ title: 'Erro ao criar lead', variant: 'destructive' });
    }
  };

  const handleSelectLead = (lead: EnrichedLead) => {
    setSelectedLead(lead);
    setSidebarOpen(true);
    setActivities([
      { id: '1', type: 'note_added', description: 'Cliente demonstrou interesse inicial.', timestamp: '2023-10-26T10:00:00Z', user: { name: 'Corretor' } },
      { id: '2', type: 'note_added', description: 'Ligação realizada, agendada visita.', timestamp: '2023-10-27T14:30:00Z', user: { name: 'Corretor' } },
    ]);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedLead(null);
  };

  const handleUpdateLead = async (leadId: string, data: LeadUpdate) => {
    try {
      await updateLead(leadId, data);
      toast({ title: 'Lead atualizado com sucesso!' });
      if (selectedLead && selectedLead.id === leadId) {
        const updatedLead = leads.find(l => l.id === leadId);
        if (updatedLead) {
          // Re-enrich the updated lead to reflect changes in the sidebar
          const updatedRawLead = leads.find(l => l.id === leadId);
          if (updatedRawLead) {
            const status = statuses.find(s => s.id === updatedRawLead.status_id);
            if (status) {
              setSelectedLead({ ...updatedRawLead, status });
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to update lead:', error);
      toast({ title: 'Erro ao atualizar lead', variant: 'destructive' });
    }
  };

  const handleOpenDeleteConfirmation = (lead: EnrichedLead) => {
    setLeadToDelete(lead);
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      await deleteLead(leadToDelete.id);
      toast({ title: 'Lead excluído com sucesso!' });
      setDeleteConfirmationOpen(false);
      if (selectedLead && selectedLead.id === leadToDelete.id) {
        handleCloseSidebar();
      }
      setLeadToDelete(null);
    } catch (error) {
      console.error('Failed to delete lead:', error);
      toast({ title: 'Erro ao excluir lead', variant: 'destructive' });
    }
  };

  const handleAddActivity = (description: string) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type: 'note_added',
      description,
      timestamp: new Date().toISOString(),
      user: { name: 'Você' },
    };
    setActivities(prev => [newActivity, ...prev]);
    toast({ title: 'Atividade adicionada!' });
  };

  // Placeholder functions for sidebar
  const handleLinkProperty = async (leadId: string, propertyId: string) => {
    console.log(`Linking lead ${leadId} with property ${propertyId}`);
    toast({ title: 'Funcionalidade não implementada' });
    return false;
  };

  const handleUnlinkProperty = async (leadId: string, propertyId: string) => {
    console.log(`Unlinking lead ${leadId} from property ${propertyId}`);
    toast({ title: 'Funcionalidade não implementada' });
    return false;
  };

  const handleAddNote = async (leadId: string, note: string) => {
    console.log(`Adding note to lead ${leadId}: ${note}`);
    handleAddActivity(`Nota adicionada: ${note}`);
    return true;
  };

  const handleEditLead = (lead: EnrichedLead) => {
    handleSelectLead(lead);
  };

  const handleDeleteLead = (leadId: string) => {
    const lead = enrichedLeads.find(l => l.id === leadId);
    if (lead) {
      handleOpenDeleteConfirmation(lead);
    }
  };

  if (loadingStatuses || loadingLeads) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (errorLeads) {
    return <div className="flex items-center justify-center h-screen text-red-500">{errorLeads}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col flex-1">
        <main className="flex flex-col flex-1 p-4 md:p-6 lg:p-8 overflow-hidden">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-primary flex items-center">
              <Users className="w-8 h-8 mr-2 text-primary" /> CRM - Gestão de Leads
            </h1>
          </header>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-grow max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email, telefone..."
                className="pl-10 focus:border-primary focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>Filtrar</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4">
                <p className="text-sm">Filtros avançados aqui.</p>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="date" variant="outline" className="w-[300px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y", { locale: ptBR })} - {" "}
                        {format(dateRange.to, "LLL dd, y", { locale: ptBR })}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y", { locale: ptBR })
                    )
                  ) : (
                    <span>Selecione o período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={() => handleOpenNewLeadModal()} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              <span>Novo Lead</span>
            </Button>
          </div>

          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex-grow overflow-hidden">
              <div className="flex flex-col md:inline-flex md:flex-row gap-6 h-full md:overflow-x-auto md:min-w-full">
                {sortedStatuses.map(status => (
                  <KanbanColumn
                    key={status.id}
                    status={status}
                    leads={leadsByStatus.get(status.id) || []}
                    onAddLead={() => handleOpenNewLeadModal(status.id)}
                    onSelectLead={handleSelectLead}
                    onEditLead={handleEditLead}
                    onDeleteLead={handleDeleteLead}
                  />
                ))}
              </div>
            </div>
            <DragOverlay>
              {activeLead ? <LeadCard lead={activeLead} onSelectLead={() => {}} /> : null}
            </DragOverlay>
          </DndContext>
        </main>

        <NewLeadModal
          isOpen={isNewLeadModalOpen}
          onClose={() => setNewLeadModalOpen(false)}
          onSave={handleCreateLead}
          leadData={newLeadData}
          setLeadData={setNewLeadData}
          statuses={sortedStatuses}
        />

        {selectedLead && (
          <LeadDetailSidebar
            lead={selectedLead}
            isOpen={isSidebarOpen}
            onClose={handleCloseSidebar}
            onUpdate={handleUpdateLead}
            onDelete={handleOpenDeleteConfirmation}
            activities={activities}
            onAddActivity={handleAddActivity}
            statuses={sortedStatuses}
            properties={properties}
            onLinkProperty={handleLinkProperty}
            onUnlinkProperty={handleUnlinkProperty}
            onAddNote={handleAddNote}
          />
        )}

        <ConfirmationDialog
          isOpen={isDeleteConfirmationOpen}
          onClose={() => setDeleteConfirmationOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar Exclusão"
          description={`Tem certeza de que deseja excluir o lead "${leadToDelete?.name}"? Esta ação não pode ser desfeita.`}
        />

        <Toaster />
        {isMobile && <AdminBottomNav />}
      </div>
    </div>
  );

}