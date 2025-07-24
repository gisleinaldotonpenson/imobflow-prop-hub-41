import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
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
    <div ref={setNodeRef} className="h-full min-w-[320px] md:min-w-[350px]">
      <div className="relative h-full flex flex-col rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300">
        {/* Modern glass effect container */}
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-xl rounded-xl overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-gray-100/20 dark:from-gray-700/20 dark:to-gray-900/20"></div>
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-x-full group-hover:translate-x-full"></div>
        </div>
        
        {/* Content */}
        <div className="relative h-full flex flex-col">
          <CardHeader className="p-4 flex items-center justify-between border-b border-white/30 dark:border-gray-700/30 bg-gradient-to-r from-white/10 to-gray-50/10 dark:from-gray-700/10 dark:to-gray-800/10">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-white/50 dark:ring-gray-600/50" 
                style={{ 
                  backgroundColor: status.color,
                  boxShadow: `0 0 12px ${status.color}60, 0 0 24px ${status.color}30`
                }}
              />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate text-base">
                {status.name}
              </h3>
              <Badge 
                variant="secondary" 
                className="ml-auto text-xs font-medium bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-white/40 dark:border-gray-600/40 text-gray-800 dark:text-gray-200 shadow-sm"
              >
                {leads.length}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onAddLead(status.id)}
              className="h-8 w-8 p-0 rounded-full bg-white/60 hover:bg-white/90 dark:bg-gray-700/60 dark:hover:bg-gray-600/80 backdrop-blur-sm border border-white/40 dark:border-gray-600/40 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {leads.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 flex items-center justify-center mb-3">
                  <PlusCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Nenhum lead
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Clique no + para adicionar
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
                  {leads.map(lead => (
                    <LeadCard 
                      key={lead.id} 
                      lead={lead} 
                      onSelectLead={onSelectLead} 
                      onEdit={onEditLead} 
                      onDelete={onDeleteLead} 
                    />
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
