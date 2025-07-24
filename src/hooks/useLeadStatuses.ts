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

// Always use mock data for now since authentication isn't implemented
const useMock = true;

export function useLeadStatuses() {
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatuses = useCallback(async () => {
    setLoading(true);
    try {
      // Load from localStorage or use mock data
      const stored = localStorage.getItem('leadStatuses');
      let data = stored ? JSON.parse(stored) : [];
      
      // If no data exists, initialize with mock data
      if (data.length === 0) {
        data = MOCK_STATUSES;
        localStorage.setItem('leadStatuses', JSON.stringify(data));
      }
      
      setStatuses(data);
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
    const newStatus = { 
      ...newStatusData, 
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updatedStatuses = [...statuses, newStatus];
    setStatuses(updatedStatuses);
    localStorage.setItem('leadStatuses', JSON.stringify(updatedStatuses));
  }, [statuses]);

  const updateStatus = useCallback(async (id: string, updatedData: Partial<LeadStatus>) => {
    const updatedStatuses = statuses.map(s => 
      s.id === id ? { ...s, ...updatedData, updated_at: new Date().toISOString() } : s
    );
    setStatuses(updatedStatuses);
    localStorage.setItem('leadStatuses', JSON.stringify(updatedStatuses));
  }, [statuses]);

  const deleteStatus = useCallback(async (id: string) => {
    const updatedStatuses = statuses.filter(s => s.id !== id);
    setStatuses(updatedStatuses);
    localStorage.setItem('leadStatuses', JSON.stringify(updatedStatuses));
  }, [statuses]);

  return { statuses, loading, refetch: fetchStatuses, createStatus, updateStatus, deleteStatus };
}
