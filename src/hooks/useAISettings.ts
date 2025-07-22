import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AIProvider = 'none' | 'openai' | 'gemini';

export interface AISettings {
  openai_api_key?: string;
  gemini_api_key?: string;
  active_ai_provider: AIProvider;
}

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>({
    active_ai_provider: 'none'
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          openai_api_key: (data as any).openai_api_key || undefined,
          gemini_api_key: (data as any).gemini_api_key || undefined,
          active_ai_provider: ((data as any).active_ai_provider as AIProvider) || 'none'
        });
      }
    } catch (error) {
      console.error('Error fetching AI settings:', error);
      toast({
        title: 'Erro ao carregar configurações de IA',
        description: 'Não foi possível carregar as configurações.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAISettings = async (newSettings: Partial<AISettings>): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Validate provider has corresponding API key
      if (newSettings.active_ai_provider && newSettings.active_ai_provider !== 'none') {
        const currentKeys = { ...settings, ...newSettings };
        if (newSettings.active_ai_provider === 'openai' && !currentKeys.openai_api_key?.trim()) {
          toast({
            title: 'Erro de validação',
            description: 'Chave da OpenAI é obrigatória para ativar este provedor.',
            variant: 'destructive'
          });
          return false;
        }
        if (newSettings.active_ai_provider === 'gemini' && !currentKeys.gemini_api_key?.trim()) {
          toast({
            title: 'Erro de validação',
            description: 'Chave do Gemini é obrigatória para ativar este provedor.',
            variant: 'destructive'
          });
          return false;
        }
      }

      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 1,
          ...newSettings
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...newSettings }));
      toast({
        title: 'Sucesso',
        description: 'Configurações de IA atualizadas com sucesso!'
      });
      return true;
    } catch (error) {
      console.error('Error updating AI settings:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações de IA.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getActiveProvider = (): AIProvider => {
    return settings.active_ai_provider;
  };

  const hasValidKey = (provider: AIProvider): boolean => {
    switch (provider) {
      case 'openai':
        return !!settings.openai_api_key?.trim();
      case 'gemini':
        return !!settings.gemini_api_key?.trim();
      default:
        return false;
    }
  };

  const isAIEnabled = (): boolean => {
    const provider = getActiveProvider();
    return provider !== 'none' && hasValidKey(provider);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateAISettings,
    getActiveProvider,
    hasValidKey,
    isAIEnabled,
    fetchSettings
  };
}