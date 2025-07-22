import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeads, type LeadData } from '@/hooks/useLeads';
import { useLeadStatuses, type LeadStatus } from '@/hooks/useLeadStatuses';
import { Search, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Define an enriched lead type that includes the full status object
type EnrichedLead = Omit<LeadData, 'status'> & { status: LeadStatus };

const AdminContacts = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { leads, loading: loadingLeads } = useLeads();
  const { statuses, loading: loadingStatuses } = useLeadStatuses();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const enrichedLeads: EnrichedLead[] = useMemo(() => {
    if (loadingLeads || loadingStatuses) return [];
    // Join leads with statuses on the client-side
    return leads.map(lead => {
      const status = statuses.find(s => s.id === lead.status);
      return {
        ...lead,
        // Fallback to a default status object if not found
        status: status || { id: 'unknown', name: 'Desconhecido', color: '#808080', order_num: 999 },
      };
    });
  }, [leads, statuses, loadingLeads, loadingStatuses]);

  const filteredLeads = useMemo(() => {
    return enrichedLeads
      .filter(lead => {
        const searchMatch =
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (lead.phone && lead.phone.includes(searchTerm));
        return searchMatch;
      })
      .filter(lead => {
        if (statusFilter === 'all') return true;
        return lead.status.id === statusFilter;
      });
  }, [enrichedLeads, searchTerm, statusFilter]);

  return (
    <div className="flex flex-col h-screen bg-muted/40">
      
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary flex items-center">
            <Users className="w-8 h-8 mr-2 text-primary" /> Lista de Contatos
          </h1>
        </div>

        <div className="mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select onValueChange={setStatusFilter} value={statusFilter} disabled={loadingStatuses}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-primary/10">
              <TableRow>
                <TableHead className="text-primary">Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(loadingLeads || loadingStatuses) ? (
                 <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    Carregando contatos...
                  </TableCell>
                </TableRow>
              ) : filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    onClick={() => navigate(`/admin/contacts/${lead.id}`)}
                    className="cursor-pointer hover:bg-primary/5"
                  >
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{lead.email || 'N/A'}</span>
                        {lead.phone && <span className="text-sm text-muted-foreground">{lead.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: `${lead.status.color}20`,
                          color: lead.status.color,
                          borderColor: `${lead.status.color}80`
                        }}
                        className="border"
                      >
                        {lead.status.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    Nenhum contato encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {isMobile && <AdminBottomNav />}
    </div>
  );
};

export default AdminContacts;
