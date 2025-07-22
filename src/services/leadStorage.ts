import { v4 as uuidv4 } from 'uuid';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  property?: string;
  status_id: string;
  status_name?: string;
  status_color?: string;
  notes?: string;
  source?: string;
  interest?: string;
  budget?: string | number;
  created_at: string;
  updated_at: string;
  status_updated_at: string;
}

const STORAGE_KEY = 'imobflow_leads';

// Initialize with some sample data if none exists
const initializeLeads = (): Lead[] => {
  const defaultLeads: Lead[] = [
    {
      id: uuidv4(),
      name: 'João Silva',
      phone: '(11) 98765-4321',
      email: 'joao.silva@exemplo.com',
      property: 'Apartamento no Centro',
      status_id: 'novo',
      notes: 'Interessado em apartamentos de 2 quartos',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status_updated_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Maria Oliveira',
      phone: '(21) 91234-5678',
      email: 'maria.oliveira@exemplo.com',
      property: 'Casa com Piscina',
      status_id: 'contato',
      notes: 'Deseja marcar visita para o final de semana',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      status_updated_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Carlos Pereira',
      phone: '(31) 99876-5432',
      email: 'carlos@exemplo.com',
      property: 'Cobertura na Praia',
      status_id: 'proposta',
      notes: 'Enviar proposta até sexta-feira',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      status_updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      name: 'Ana Santos',
      phone: '(41) 98765-1234',
      email: 'ana.santos@exemplo.com',
      property: 'Sítio em Pirenópolis',
      status_id: 'fechado',
      notes: 'Fechado com sucesso!',
      created_at: new Date('2023-01-15').toISOString(),
      updated_at: new Date('2023-02-10').toISOString(),
      status_updated_at: new Date('2023-02-10').toISOString()
    },
    {
      id: uuidv4(),
      name: 'Pedro Costa',
      phone: '(51) 98765-8765',
      email: 'pedro@exemplo.com',
      property: 'Apartamento no Flamengo',
      status_id: 'perdido',
      notes: 'Cliente desistiu da compra',
      created_at: new Date('2023-03-01').toISOString(),
      updated_at: new Date('2023-03-20').toISOString(),
      status_updated_at: new Date('2023-03-20').toISOString()
    }
  ];

  const existingLeads = localStorage.getItem(STORAGE_KEY);
  if (!existingLeads) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLeads));
    return defaultLeads;
  }
  
  return JSON.parse(existingLeads);
};

export const getLeads = (): Lead[] => {
  try {
    const leads = localStorage.getItem(STORAGE_KEY);
    if (!leads) return initializeLeads();
    return JSON.parse(leads);
  } catch (error) {
    console.error('Error reading leads from localStorage:', error);
    return [];
  }
};

export const saveLead = (lead: Partial<Lead>): Lead => {
  const leads = getLeads();
  const now = new Date().toISOString();
  
  if (lead.id) {
    // Update existing lead
    const index = leads.findIndex(l => l.id === lead.id);
    if (index !== -1) {
      const existingLead = leads[index];
      const updatedLead = {
        ...existingLead,
        ...lead,
        updated_at: now,
        status_updated_at: existingLead.status_id !== lead.status_id ? now : existingLead.status_updated_at
      };
      
      leads[index] = updatedLead;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
      return updatedLead;
    }
  }
  
  // Create new lead
  const newLead: Lead = {
    id: uuidv4(),
    created_at: now,
    updated_at: now,
    status_updated_at: now,
    name: '',
    phone: '',
    status_id: 'novo',
    ...lead,
  };
  
  const updatedLeads = [...leads, newLead];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
  return newLead;
};

export const deleteLead = (id: string): boolean => {
  try {
    const leads = getLeads();
    const updatedLeads = leads.filter(lead => lead.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
    return true;
  } catch (error) {
    console.error('Error deleting lead:', error);
    return false;
  }
};

export const updateLeadStatus = (
  id: string, 
  statusId: string, 
  statuses: { id: string; name: string; color: string }[]
): Lead | null => {
  try {
    const leads = getLeads();
    const leadIndex = leads.findIndex(lead => lead.id === id);
    
    if (leadIndex === -1) return null;

    const status = statuses.find(s => s.id === statusId);
    
    const updatedLead = {
      ...leads[leadIndex],
      status_id: statusId,
      status_name: status?.name,
      status_color: status?.color,
      status_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    leads[leadIndex] = updatedLead;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    return updatedLead;
  } catch (error) {
    console.error('Error updating lead status:', error);
    return null;
  }
};
