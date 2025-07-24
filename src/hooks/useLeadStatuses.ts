import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { type Tables } from '@/integrations/supabase/types';

export type LeadStatus = Tables<'lead_statuses'>;

const MOCK_STATUSES: LeadStatus[] = [
  { id: '1', name: 'Novo', color: '#3b82f6', order_num: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Em Atendimento', color: '#f97316', order_num: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', name: 'Proposta Enviada', color: '#8b5cf6', order_num: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', name: 'Negociação', color: '#eab308', order_num: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', name: 'Vendido', color: '#22c55e', order_num: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '6', name: 'Perdido', color: '#ef4444', order_num: 6, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const useMock = !SUPABASE_URL || !SUPABASE_ANON_KEY;

export function useLeadStatuses() {
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatuses = useCallback(async () => {
    if (useMock) {
      setStatuses(MOCK_STATUSES);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lead_statuses')
        .select('*')
        .order('order_num', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setStatuses(data);
      } else {
        // If no statuses are found in the DB, fallback to mock data.
        setStatuses(MOCK_STATUSES);
      }
    } catch (error) {
      console.error('Error fetching lead statuses:', error);
      setStatuses(MOCK_STATUSES); // Fallback to mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const createStatus = useCallback(async (newStatusData: Omit<LeadStatus, 'id'>) => {
    if (useMock) {
      const newStatus = { ...newStatusData, id: Math.random().toString(36).substr(2, 9) };
      setStatuses(prev => [...prev, newStatus]);
      return;
    }
    const { error } = await supabase.from('lead_statuses').insert(newStatusData);
    if (error) throw error;
    await fetchStatuses();
  }, [fetchStatuses]);

  const updateStatus = useCallback(async (id: string, updatedData: Partial<LeadStatus>) => {
    if (useMock) {
      setStatuses(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s));
      return;
    }
    const { error } = await supabase.from('lead_statuses').update(updatedData).eq('id', id);
    if (error) throw error;
    await fetchStatuses();
  }, [fetchStatuses]);

  const deleteStatus = useCallback(async (id: string) => {
    if (useMock) {
      setStatuses(prev => prev.filter(s => s.id !== id));
      return;
    }
    const { error } = await supabase.from('lead_statuses').delete().eq('id', id);
    if (error) throw error;
    await fetchStatuses();
  }, [fetchStatuses]);

  return { statuses, loading, refetch: fetchStatuses, createStatus, updateStatus, deleteStatus };
}
