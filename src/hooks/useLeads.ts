import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Tables, type TablesInsert, type TablesUpdate } from "@/integrations/supabase/types";

// Exportando os tipos brutos do Supabase para serem usados na UI
export type LeadData = Tables<'leads'>;

export type LeadInsert = TablesInsert<"leads">;
export type LeadUpdate = TablesUpdate<'leads'>;

// Mocks para desenvolvimento offline
const MOCK_LEADS: LeadData[] = [
  { id: '1', name: 'Lead de Teste 1', email: 'teste1@example.com', phone: '(11) 99999-0001', status_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), source: 'website', message: 'Mensagem de teste para o lead 1' },
  { id: '2', name: 'Lead de Teste 2', email: 'teste2@example.com', phone: '(11) 99999-0002', status_id: '2', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), source: 'facebook', message: 'Mensagem de teste para o lead 2' },
  { id: '3', name: 'Lead de Teste 3', email: 'teste3@example.com', phone: '(11) 99999-0003', status_id: '3', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), source: 'google', message: 'Mensagem de teste para o lead 3' },
  { id: '4', name: 'Lead de Teste 4', email: 'teste4@example.com', phone: '(11) 99999-0004', status_id: '4', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), source: 'referencia', message: 'Mensagem de teste para o lead 4' },
  { id: '5', name: 'Lead de Teste 5', email: 'teste5@example.com', phone: '(11) 99999-0005', status_id: '5', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), source: 'whatsapp', message: 'Mensagem de teste para o lead 5' },
];

// Hook para gerenciar os leads (refatorado para não fazer joins)
export const useLeads = () => {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load from localStorage or use mock data
      const stored = localStorage.getItem('leads');
      let data = stored ? JSON.parse(stored) : [];
      
      // If no data exists, initialize with mock data
      if (data.length === 0) {
        data = MOCK_LEADS;
        localStorage.setItem('leads', JSON.stringify(data));
      }
      
      setLeads(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred');
      setError(error.message);
      console.error('Erro ao buscar leads:', err);
      setLeads(MOCK_LEADS); // Fallback to mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  const createLead = useCallback(async (leadData: LeadInsert) => {
    try {
      const newLead: LeadData = {
        id: Math.random().toString(36).substr(2, 9),
        name: leadData.name || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
        message: leadData.message || '',
        source: leadData.source || '',
        status_id: leadData.status_id || '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedLeads = [...leads, newLead];
      setLeads(updatedLeads);
      localStorage.setItem('leads', JSON.stringify(updatedLeads));

      return { data: newLead, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred');
      console.error('Exception creating lead:', err);
      return { data: null, error };
    }
  }, [leads]);

  const updateLead = useCallback(async (leadId: string, updates: LeadUpdate) => {
    try {
      const updatedLeads = leads.map(lead => 
        lead.id === leadId 
          ? { ...lead, ...updates, updated_at: new Date().toISOString() }
          : lead
      );
      
      setLeads(updatedLeads);
      localStorage.setItem('leads', JSON.stringify(updatedLeads));
      
      const updatedLead = updatedLeads.find(lead => lead.id === leadId);
      return { data: updatedLead, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred');
      console.error('Exception updating lead:', err);
      return { data: null, error };
    }
  }, [leads]);

  const deleteLead = useCallback(async (leadId: string) => {
    try {
      const updatedLeads = leads.filter(lead => lead.id !== leadId);
      setLeads(updatedLeads);
      localStorage.setItem('leads', JSON.stringify(updatedLeads));
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred');
      console.error('Exception deleting lead:', err);
      return { error };
    }
  }, [leads]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return { leads, loading, error, createLead, updateLead, deleteLead, refetch: fetchLeads };
};