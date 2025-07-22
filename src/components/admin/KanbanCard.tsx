import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { EnrichedLead } from '@/types/crm';
import { Phone, Mail, Clock, CircleUserRound } from 'lucide-react';

interface KanbanCardProps {
  lead: EnrichedLead;
  onSelectLead: (lead: EnrichedLead) => void;
}

export function KanbanCard({ lead, onSelectLead }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: {
      type: 'Lead',
      lead,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const timeAgo = (date: string | Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dias";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutos";
    return "há menos de um minuto";
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        onClick={() => onSelectLead(lead)}
        className="mb-4 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer rounded-xl"
      >
        <CardHeader className="p-4">
          <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200">{lead.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-gray-500" />
            <span>{lead.email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-gray-500" />
            <span>{lead.phone}</span>
          </div>
          <div className="flex items-center pt-2 mt-2 border-t border-white/20">
            <div
              className="w-4 h-4 mr-2 rounded-full"
              style={{ backgroundColor: lead.status.color }}
            ></div>
            <span className="text-xs">{lead.status.name} • {timeAgo(lead.updated_at)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
