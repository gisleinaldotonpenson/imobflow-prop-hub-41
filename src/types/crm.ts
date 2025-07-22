import type { LeadData } from '@/hooks/useLeads';
import type { LeadStatus } from '@/hooks/useLeadStatuses';

export interface Property {
  id: string;
  title: string;
  reference: string;
  location?: string;
  price?: number;
  bedrooms?: number;
}

export interface Activity {
  id: string;
  type: 'status_change' | 'note_added' | 'property_linked' | 'property_unlinked' | 'lead_created';
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

export interface EnrichedLead extends Omit<LeadData, 'status'> {
  status: LeadStatus;
  properties?: Property[];
}
