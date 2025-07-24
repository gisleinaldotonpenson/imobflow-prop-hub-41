import { useState, useEffect } from 'react';

// Mock AI settings hook since we don't have a settings table
export interface AISettings {
  id: number;
  ai_model: string;
  ai_api_key: string;
  response_template: string;
  auto_response: boolean;
  max_tokens: number;
  temperature: number;
}

const DEFAULT_SETTINGS: AISettings = {
  id: 1,
  ai_model: 'gpt-3.5-turbo',
  ai_api_key: '',
  response_template: 'Olá {nome}, obrigado pelo interesse no imóvel {imovel}. Entraremos em contato em breve!',
  auto_response: false,
  max_tokens: 150,
  temperature: 0.7,
};

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Use localStorage to persist settings
      const stored = localStorage.getItem('aiSettings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AISettings>) => {
    try {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      localStorage.setItem('aiSettings', JSON.stringify(newSettings));
      return { error: null };
    } catch (error) {
      console.error('Error updating AI settings:', error);
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
    isAIEnabled: settings.auto_response && !!settings.ai_api_key,
  };
}