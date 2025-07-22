import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
// import { Tables } from '@/types/supabase';

type AppNotification = {
  id: string;
  title: string;
  description: string | null;
  is_read: boolean;
  created_at: string;
  related_type: string | null;
  related_id: string | null;
};

export function NotificationPopover({ userId }: { userId: string }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);
  const navigate = useNavigate();

  const handleNotificationClick = (notification: AppNotification) => {
    markAsRead(notification.id);
    if (notification.related_type === 'lead' && notification.related_id) {
      navigate(`/admin/contacts/${notification.related_id}`);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative p-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Notificações</h4>
          <Button variant="link" size="sm" onClick={markAllAsRead}>
            Marcar todos como lidos
          </Button>
        </div>
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">Nenhuma notificação</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 border-b cursor-pointer hover:bg-muted ${notif.is_read ? 'opacity-70' : ''}`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="font-medium">{notif.title}</div>
                <div className="text-sm text-muted-foreground">{notif.description}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: ptBR })}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 