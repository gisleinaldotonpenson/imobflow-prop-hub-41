import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MarketingSettings {
  id?: string;
  facebook_pixel_id?: string;
  google_analytics_id?: string;
  google_tag_manager_id?: string;
}

export function useMarketingSettings() {
  const [settings, setSettings] = useState<MarketingSettings>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('marketing_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setSettings(data || {});
    } catch (error) {
      console.error('Error fetching marketing settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar configurações de marketing",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<MarketingSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const settingsData = {
        ...newSettings,
        user_id: user.id,
      };

      let result;
      if (settings.id) {
        // Update existing settings
        result = await supabase
          .from('marketing_settings')
          .update(settingsData)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        // Insert new settings
        result = await supabase
          .from('marketing_settings')
          .insert(settingsData)
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      setSettings(result.data);
      toast({
        title: "Sucesso",
        description: "Configurações de marketing atualizadas com sucesso",
      });

      return { error: null };
    } catch (error) {
      console.error('Error updating marketing settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configurações de marketing",
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings,
  };
}