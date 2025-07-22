import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fakeProperties } from '@/data/fakeProperties';

export interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  address?: string;
  bedrooms: number;
  bathrooms: number;
  parking_spots?: number; // Adicionado para corrigir o erro de tipo
  area: number;
  type: string;
  purpose: string;
  image_url?: string;
  images?: string[];
  features?: string[];
  condo_fee?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Using fake properties for demo');
        setProperties(fakeProperties);
      } else {
        // Combine real data with fake data for demo
        const allProperties = [...(data || []), ...fakeProperties];
        setProperties(allProperties);
      }
    } catch (err) {
      console.log('Using fake properties for demo');
      setProperties(fakeProperties);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePropertyStatus = useCallback(async (propertyId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('properties')
      .update({ is_active: isActive })
      .eq('id', propertyId);
    if (error) {
      console.error('Error updating property status:', error);
      setError('Falha ao atualizar o status do imóvel.');
    } else {
      // Refetch to get the latest data, or rely on the realtime subscription
      fetchProperties();
    }
  }, [fetchProperties]);

  const deleteProperty = useCallback(async (propertyId: string) => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
    if (error) {
      console.error('Error deleting property:', error);
      setError('Falha ao excluir o imóvel.');
    } else {
      // Refetch to get the latest data, or rely on the realtime subscription
      fetchProperties();
    }
  }, [fetchProperties]);

  useEffect(() => {
    fetchProperties();
    
    const channel = supabase
      .channel('properties-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'properties' },
        () => fetchProperties()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetchProperties]);

  return { properties, loading, error, refetch: fetchProperties, updatePropertyStatus, deleteProperty };
}

export const useWhatsAppNumber = () => {
  const [number, setNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNumber = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('settings').select('whatsapp_number').single();
    if (error) {
      setError(error.message);
      setNumber(null);
    } else {
      setNumber(data?.whatsapp_number || null);
      setError(null);
    }
    setLoading(false);
  }, []);

  const updateNumber = useCallback(async (newNumber: string) => {
    setLoading(true);
    const { error } = await supabase.from('settings').update({ whatsapp_number: newNumber }).eq('id', 1);
    if (error) {
      setError(error.message);
    } else {
      setNumber(newNumber);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNumber();
  }, [fetchNumber]);

  return { number, loading, error, updateNumber };
};