import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeadCard } from './LeadCard';
import { type EnrichedLead } from '@/types/crm';
import { type LeadStatus } from '@/hooks/useLeadStatuses';

interface KanbanColumnProps {
  status: LeadStatus;
  leads: EnrichedLead[];
  onAddLead: (statusId: string) => void;
  onSelectLead: (lead: EnrichedLead) => void;
  onEditLead?: (lead: EnrichedLead) => void;
  onDeleteLead?: (leadId: string) => void;
}

export function KanbanColumn({ status, leads, onAddLead, onSelectLead, onEditLead, onDeleteLead }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: status.id, data: { type: 'Column' } });

  return (
    <div ref={setNodeRef} className="h-full">
      <div className="relative h-full flex flex-col rounded-xl overflow-hidden">
        {/* Liquid glass effect container */}
        <div className="absolute inset-0 bg-white/60 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-md rounded-xl overflow-hidden">
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full"></div>
        </div>
        
        {/* Content */}
        <div className="relative h-full flex flex-col">
          <CardHeader className="p-4 flex items-center justify-between border-b border-white/20 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ 
                  backgroundColor: status.color,
                  boxShadow: `0 0 8px ${status.color}80`
                }}
              />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{status.name}</h3>
              <Badge 
                variant="secondary" 
                className="ml-2 text-xs font-medium bg-white/40 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/10 text-gray-800 dark:text-gray-200"
              >
                {leads.length}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onAddLead(status.id)}
              className="h-8 w-8 p-0 rounded-full bg-white/50 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/30 backdrop-blur-sm border border-white/30 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-3 flex-1 overflow-y-auto">
            {leads.length === 0 ? (
              <div className="h-20 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                Nenhum lead nesta coluna
              </div>
            ) : (
              <div className="space-y-3">
                <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
                  {leads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onSelectLead={onSelectLead} onEdit={onEditLead} onDelete={onDeleteLead} />
                  ))}
                </SortableContext>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </div>
  );
}
