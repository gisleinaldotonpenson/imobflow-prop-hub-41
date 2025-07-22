import { useState, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos
export type InteractionType = 'note' | 'call' | 'meeting' | 'email' | 'other';

export interface Interaction {
  id: string;
  lead_id: string;
  type: InteractionType;
  content: string;
  created_at: string;
  created_by: string;
}

// Dados mockados para desenvolvimento
const MOCK_INTERACTIONS: Record<string, Interaction[]> = {};

// Função para obter interações de um lead
const getLeadInteractions = (leadId: string): Interaction[] => {
  return MOCK_INTERACTIONS[leadId] || [];
};

// Função para adicionar uma interação
const addInteraction = (leadId: string, interaction: Omit<Interaction, 'id' | 'created_at'>): Interaction => {
  const newInteraction: Interaction = {
    ...interaction,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  };
  
  if (!MOCK_INTERACTIONS[leadId]) {
    MOCK_INTERACTIONS[leadId] = [];
  }
  
  MOCK_INTERACTIONS[leadId].unshift(newInteraction);
  return newInteraction;
};

export const useLeadInteractions = (leadId: string) => {
  const [interactions, setInteractions] = useState<Interaction[]>(() => getLeadInteractions(leadId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar interações
  const fetchInteractions = useCallback(async () => {
    try {
      setLoading(true);
      // Em um cenário real, faria uma chamada para a API aqui
      const data = getLeadInteractions(leadId);
      setInteractions(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Erro ao carregar interações:', err);
      setError('Falha ao carregar o histórico de interações');
      return [];
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  // Adicionar uma nova interação
  const addNewInteraction = useCallback(async (type: InteractionType, content: string) => {
    try {
      setLoading(true);
      // Em um cenário real, faria uma chamada para a API aqui
      const newInteraction = addInteraction(leadId, {
        lead_id: leadId,
        type,
        content,
        created_by: 'Usuário Atual', // Em um cenário real, pegaria do contexto de autenticação
      });
      
      // Atualiza a lista local
      setInteractions(prev => [newInteraction, ...prev]);
      setError(null);
      return newInteraction;
    } catch (err) {
      console.error('Erro ao adicionar interação:', err);
      setError('Falha ao adicionar a interação');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  return {
    interactions,
    loading,
    error,
    fetchInteractions,
    addInteraction: addNewInteraction,
    // Função auxiliar para formatar a data de forma amigável
    formatDate: (dateString: string) => {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    },
    // Função para obter o ícone baseado no tipo de interação
    getInteractionIcon: (type: InteractionType) => {
      switch (type) {
        case 'call': return '📞';
        case 'email': return '✉️';
        case 'meeting': return '📅';
        case 'note': return '📝';
        default: return '🔹';
      }
    },
  };
};
