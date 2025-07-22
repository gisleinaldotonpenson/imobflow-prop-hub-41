import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Tables, type TablesInsert, type TablesUpdate } from "@/integrations/supabase/types";

// Exportando os tipos brutos do Supabase para serem usados na UI
export type LeadData = Tables<'leads'>;

export type LeadInsert = TablesInsert<"leads">;
export type LeadUpdate = TablesUpdate<'leads'>;

// Mocks para desenvolvimento offline
const MOCK_LEADS: LeadData[] = [
  { id: '1', name: 'Lead de Teste 1', email: 'teste1@example.com', phone: '(11) 99999-0001', status: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), property_id: null, message: 'Mensagem de teste para o lead 1' },
  { id: '2', name: 'Lead de Teste 2', email: 'teste2@example.com', phone: '(11) 99999-0002', status: '2', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), property_id: null, message: 'Mensagem de teste para o lead 2' },
  { id: '3', name: 'Lead de Teste 3', email: 'teste3@example.com', phone: '(11) 99999-0003', status: '3', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), property_id: null, message: 'Mensagem de teste para o lead 3' },
  { id: '4', name: 'Lead de Teste 4', email: 'teste4@example.com', phone: '(11) 99999-0004', status: '4', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), property_id: null, message: 'Mensagem de teste para o lead 4' },
  { id: '5', name: 'Lead de Teste 5', email: 'teste5@example.com', phone: '(11) 99999-0005', status: '5', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), property_id: null, message: 'Mensagem de teste para o lead 5' },
];

// Hook para gerenciar os leads (refatorado para não fazer joins)
export const useLeads = () => {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your_');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isMockMode) {
        console.log('Using mock leads data');
        setLeads(MOCK_LEADS);
        return;
      }

      const { data, error } = await supabase.from('leads').select('*');

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred');
      setError(error.message);
      console.error('Erro ao buscar leads:', err);
    } finally {
      setLoading(false);
    }
  }, [isMockMode]);

  const createLead = useCallback(async (leadData: LeadInsert) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select('*')
        .single();

      if (error) throw error;

      // Create notification
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'Novo Lead Criado',
          description: `Um novo lead "${leadData.name}" foi adicionado.`,
          related_type: 'lead',
          related_id: data?.id,
        });
      }

      fetchLeads();
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred');
      console.error('Exception creating lead:', err);
      return { data: null, error };
    }
  }, [fetchLeads]);

    const updateLead = useCallback(async (leadId: string, updates: LeadUpdate) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .select('*')
        .single();

      if (error) throw error;
      fetchLeads(); // Refetch para consistência
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred');
      console.error('Exception updating lead:', err);
      return { data: null, error };
    }
  }, [fetchLeads]);

  const deleteLead = useCallback(async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
      fetchLeads(); // Refetch para consistência
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred');
      console.error('Exception deleting lead:', err);
      return { error };
    }
  }, [fetchLeads]);

  useEffect(() => {
    fetchLeads();

    if (isMockMode) {
      console.log('Real-time updates for leads disabled in development mode');
      return;
    }

    const channel = supabase
      .channel('leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetchLeads, isMockMode]);

  return { leads, loading, error, createLead, updateLead, deleteLead, refetch: fetchLeads };
};