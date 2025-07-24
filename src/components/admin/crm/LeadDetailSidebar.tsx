import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Home, Mail, Phone, User, MessageSquare, Save, X, Edit, History as HistoryIcon, Wand2, MessageCircle } from 'lucide-react';
import { ActivityLog } from './ActivityLog';
import { MessageGenerator } from './MessageGenerator';
import type { LeadUpdate } from '@/hooks/useLeads';
import type { LeadStatus } from '@/hooks/useLeadStatuses';
import type { EnrichedLead, Property, Activity } from '@/types/crm';



interface LeadDetailSidebarProps {
  lead: EnrichedLead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: LeadUpdate) => Promise<void>;
  statuses: LeadStatus[];
  properties: Property[];
  onLinkProperty: (leadId: string, propertyId: string) => Promise<boolean>;
  onUnlinkProperty: (leadId: string, propertyId: string) => Promise<boolean>;
  onAddNote: (leadId: string, note: string) => Promise<boolean>;
  onAddActivity: (description: string) => void;
  activities: Activity[];
  onDelete: (lead: EnrichedLead) => void;
}

export function LeadDetailSidebar({ 
  lead, 
  isOpen, 
  onClose, 
  onUpdate, 
  statuses, 
  properties,
  onLinkProperty,
  onUnlinkProperty,
  onAddNote,
  onAddActivity,
  activities,
  onDelete
}: LeadDetailSidebarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableLead, setEditableLead] = useState<Partial<LeadUpdate>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'messages'>('details');
  const { toast } = useToast();

  // Initialize form with lead data
  useEffect(() => {
    if (lead) {
      setEditableLead({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message: lead.message,
        status_id: lead.status.id,
      });
      setIsEditing(false);
      setNewNote('');
    } else {
      setEditableLead({});
    }
  }, [lead]);

  // Filter out already linked properties
  const availableProperties = useMemo(() => {
    if (!lead?.properties) return properties;
    return properties.filter(p => !lead.properties?.some(lp => lp.id === p.id));
  }, [properties, lead?.properties]);

  if (!lead) return null;

  const handleSave = async () => {
    if (!editableLead.name?.trim()) {
      toast({ title: 'Erro', description: 'O nome é obrigatório', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(lead.id, editableLead);
      toast({ title: 'Sucesso', description: 'Lead atualizado com sucesso.' });
      setIsEditing(false);
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: 'Não foi possível atualizar o lead. Tente novamente.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof LeadUpdate, value: string | null) => {
    setEditableLead(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await onAddNote(lead.id, newNote);
      setNewNote('');
      toast({ title: 'Nota adicionada', description: 'Sua nota foi salva com sucesso.' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: 'Não foi possível adicionar a nota. Tente novamente.', 
        variant: 'destructive' 
      });
    }
  };

  const handleLinkProperty = async () => {
    if (!selectedProperty) return;
    
    try {
      await onLinkProperty(lead.id, selectedProperty);
      setSelectedProperty('');
      toast({ title: 'Imóvel vinculado', description: 'O imóvel foi vinculado ao lead com sucesso.' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: 'Não foi possível vincular o imóvel. Tente novamente.', 
        variant: 'destructive' 
      });
    }
  };

  const handleUnlinkProperty = async (propertyId: string) => {
    try {
      await onUnlinkProperty(lead.id, propertyId);
      toast({ title: 'Imóvel desvinculado', description: 'O imóvel foi desvinculado do lead.' });
    } catch (error) {
      toast({ 
        title: 'Erro', 
        description: 'Não foi possível desvincular o imóvel. Tente novamente.', 
        variant: 'destructive' 
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl glass-effect flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {isEditing ? 'Editando Lead' : lead.name || 'Detalhes do Lead'}
              </SheetTitle>
              <SheetDescription className="mt-1">
                Criado em {formatDate(lead.created_at)}
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={() => onDelete(lead)} className="mr-auto">
                    Excluir
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Salvando...' : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-44 border-r bg-muted/50">
            <nav className="flex flex-col p-2 space-y-1">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
                  activeTab === 'details' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <User className="h-4 w-4 mr-2" />
                Detalhes
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
                  activeTab === 'messages' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Mensagens
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
                  activeTab === 'history' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <HistoryIcon className="h-4 w-4 mr-2" />
                Atividades
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <ScrollArea className="flex-1 p-6">
            {activeTab === 'details' ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações do Lead</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input 
                        id="name" 
                        value={editableLead.name || ''} 
                        onChange={e => handleChange('name', e.target.value)} 
                        readOnly={!isEditing}
                        className={!isEditing ? 'bg-muted/50' : ''}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email"
                          value={editableLead.email || ''} 
                          onChange={e => handleChange('email', e.target.value)} 
                          readOnly={!isEditing}
                          className={!isEditing ? 'bg-muted/50' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input 
                          id="phone" 
                          value={editableLead.phone || ''} 
                          onChange={e => handleChange('phone', e.target.value)} 
                          readOnly={!isEditing}
                          className={!isEditing ? 'bg-muted/50' : ''}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      {isEditing ? (
                        <Select 
                          value={editableLead.status_id || ''} 
                          onValueChange={value => handleChange('status_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map(status => (
                              <SelectItem key={status.id} value={status.id}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: status.color }}
                                  />
                                  {status.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2 h-9 px-3 py-2 rounded-md border bg-muted/50 text-sm">
                          <div 
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: lead.status.color }}
                          />
                          {lead.status.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Imóveis de Interesse</h3>
                    {isEditing && availableProperties.length > 0 && (
                      <div className="flex gap-2">
                        <Select 
                          value={selectedProperty} 
                          onValueChange={setSelectedProperty}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Vincular imóvel" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProperties.map(property => (
                              <SelectItem key={property.id} value={property.id}>
                                {property.title} ({property.reference})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          size="sm" 
                          onClick={handleLinkProperty}
                          disabled={!selectedProperty}
                        >
                          Vincular
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {lead.properties && lead.properties.length > 0 ? (
                    <div className="space-y-2">
                      {lead.properties.map(property => (
                        <div 
                          key={property.id} 
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50"
                        >
                          <div>
                            <div className="font-medium">{property.title}</div>
                            <div className="text-sm text-muted-foreground">Ref: {property.reference}</div>
                          </div>
                          {isEditing && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUnlinkProperty(property.id)}
                            >
                              Remover
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border rounded-md bg-muted/30">
                      <p className="text-muted-foreground text-sm">Nenhum imóvel vinculado</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Anotações</h3>
                  <Textarea 
                    placeholder={isEditing ? "Adicione uma anotação sobre esse lead..." : ""}
                    value={editableLead.message || ''} 
                    onChange={e => handleChange('message', e.target.value)} 
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-muted/50 min-h-[100px]' : 'min-h-[100px]'}
                  />
                  
                  {isEditing && (
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        onClick={() => handleChange('message', '')}
                        variant="ghost"
                        disabled={!editableLead.message}
                      >
                        Limpar
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Adicionar Nota</h3>
                  <div className="space-y-2">
                    <Textarea 
                      placeholder="Digite uma nova nota..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        onClick={() => { onAddActivity(newNote); setNewNote(''); }}
                        disabled={!newNote.trim()}
                      >
                        Adicionar Nota
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'messages' ? (
              <MessageGenerator 
                lead={lead}
                linkedProperty={lead.properties?.[0]}
                onActivityAdd={onAddActivity}
              />
            ) : (
              <ActivityLog 
                activities={activities}
                onAddActivity={onAddActivity}
              />
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
