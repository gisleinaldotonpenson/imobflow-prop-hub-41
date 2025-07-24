import { useState, useEffect } from 'react';

export interface WhatsAppSettings {
  whatsapp_number: string;
  default_message: string;
  auto_reply: boolean;
}

const DEFAULT_SETTINGS: WhatsAppSettings = {
  whatsapp_number: '5562981067855',
  default_message: 'Olá! Vi seu interesse no imóvel e gostaria de mais informações.',
  auto_reply: false,
};

export function useWhatsAppSettings() {
  const [settings, setSettings] = useState<WhatsAppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Use localStorage to persist settings since we don't have a settings table
      const stored = localStorage.getItem('whatsappSettings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading WhatsApp settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWhatsAppNumber = async (newNumber: string) => {
    try {
      const cleanNumber = newNumber.replace(/\D/g, '');
      
      if (!cleanNumber) {
        return false;
      }

      const newSettings = { ...settings, whatsapp_number: cleanNumber };
      setSettings(newSettings);
      localStorage.setItem('whatsappSettings', JSON.stringify(newSettings));
      
      return true;
    } catch (error) {
      console.error('Error updating WhatsApp number:', error);
      return false;
    }
  };

  const getFormattedNumber = () => {
    if (!settings?.whatsapp_number) return '';
    const number = settings.whatsapp_number;
    
    if (number.length >= 13) {
      return `+${number.slice(0, 2)} (${number.slice(2, 4)}) ${number.slice(4, 9)}-${number.slice(9)}`;
    } else if (number.length >= 11) {
      return `+55 (${number.slice(-11, -9)}) ${number.slice(-9, -4)}-${number.slice(-4)}`;
    }
    return number;
  };

  const createWhatsAppUrl = (message: string = 'Olá! Gostaria de mais informações.') => {
    const number = settings?.whatsapp_number || '5562981067855';
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
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