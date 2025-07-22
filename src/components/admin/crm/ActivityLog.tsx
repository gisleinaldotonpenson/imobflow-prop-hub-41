import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Clock, MessageSquare, Phone, Edit, Calendar, User } from 'lucide-react';
import type { Activity } from '@/types/crm';

interface ActivityLogProps {
  activities: Activity[];
  onAddActivity: (description: string) => void;
}

export function ActivityLog({ activities, onAddActivity }: ActivityLogProps) {
  const [newActivity, setNewActivity] = useState('');

  const handleAddActivity = () => {
    if (!newActivity.trim()) return;
    onAddActivity(newActivity);
    setNewActivity('');
  };

  const getActivityIcon = (activity: Activity) => {
    const desc = activity.description.toLowerCase();
    if (desc.includes('mensagem') || desc.includes('whatsapp')) {
      return <MessageSquare className="h-4 w-4 text-green-600" />;
    }
    if (desc.includes('ligação') || desc.includes('telefone')) {
      return <Phone className="h-4 w-4 text-blue-600" />;
    }
    if (desc.includes('agendamento') || desc.includes('visita')) {
      return <Calendar className="h-4 w-4 text-purple-600" />;
    }
    if (desc.includes('editou') || desc.includes('atualizou')) {
      return <Edit className="h-4 w-4 text-orange-600" />;
    }
    return <User className="h-4 w-4 text-primary" />;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Nova Atividade</h3>
        <div className="space-y-2">
          <Textarea 
            placeholder="Descreva a atividade realizada..."
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button 
              size="sm" 
              onClick={handleAddActivity}
              disabled={!newActivity.trim()}
            >
              Adicionar Atividade
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Histórico de Atividades</h3>
        <ScrollArea className="h-[400px]">
          {activities && activities.length > 0 ? (
            <div className="space-y-4 pr-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {getActivityIcon(activity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.description}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma atividade registrada ainda</p>
              <p className="text-sm mt-1">As atividades aparecerão aqui conforme você interage com o lead</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}