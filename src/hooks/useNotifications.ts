import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Notification = Tables<'notifications'>;

export const useNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    // Temporarily disable notifications to avoid errors
    setNotifications([]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Temporarily disable real-time notifications
  // useEffect(() => {
  //   if (!userId) return;
  //   const channel = supabase
  //     .channel(`public:notifications:user_id=eq.${userId}`)
  //     .on<Notification>(
  //       'postgres_changes',
  //       { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
  //       () => {
  //         fetchNotifications();
  //       }
  //     )
  //     .subscribe();
  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [userId, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    // Temporarily disabled
    return;
  };

  const markAllAsRead = async () => {
    // Temporarily disabled
    return;
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch: fetchNotifications };
};