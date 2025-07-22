import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppSettings {
  id?: number;
  whatsapp_number: string;
}

export function useWhatsAppSettings() {
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings if none exist
        const { data: newData, error: insertError } = await supabase
          .from('settings')
          .insert({ whatsapp_number: '5500000000000' })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newData);
      }
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações do WhatsApp.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Update WhatsApp number
  const updateWhatsAppNumber = async (newNumber: string) => {
    try {
      // Clean the number (remove any non-digit characters)
      const cleanNumber = newNumber.replace(/\D/g, '');
      
      if (!cleanNumber) {
        toast({
          title: 'Erro',
          description: 'Por favor, insira um número válido.',
          variant: 'destructive',
        });
        return false;
      }

      if (settings?.id) {
        // Update existing record
        const { error } = await supabase
          .from('settings')
          .update({ whatsapp_number: cleanNumber })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('settings')
          .insert({ whatsapp_number: cleanNumber })
          .select()
          .single();

        if (error) throw error;
        setSettings(data);
        return true;
      }

      setSettings(prev => prev ? { ...prev, whatsapp_number: cleanNumber } : null);
      
      toast({
        title: 'Sucesso',
        description: 'Número do WhatsApp atualizado com sucesso!',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating WhatsApp number:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o número do WhatsApp.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Get formatted WhatsApp number for display
  const getFormattedNumber = () => {
    if (!settings?.whatsapp_number) return '';
    const number = settings.whatsapp_number;
    
    // Format as +55 (11) 99999-9999
    if (number.length >= 13) {
      return `+${number.slice(0, 2)} (${number.slice(2, 4)}) ${number.slice(4, 9)}-${number.slice(9)}`;
    } else if (number.length >= 11) {
      return `+55 (${number.slice(-11, -9)}) ${number.slice(-9, -4)}-${number.slice(-4)}`;
    }
    return number;
  };

  // Create WhatsApp URL with custom message
  const createWhatsAppUrl = (message: string = 'Olá! Gostaria de mais informações.') => {
    if (!settings?.whatsapp_number) return '#';
    return `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateWhatsAppNumber,
    getFormattedNumber,
    createWhatsAppUrl,
    refetch: fetchSettings,
  };
}