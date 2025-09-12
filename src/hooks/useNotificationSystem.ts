import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function useNotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for new bookings
    const bookingsChannel = supabase
      .channel('notifications-bookings')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings'
      }, (payload) => {
        const newNotification: Notification = {
          id: crypto.randomUUID(),
          type: 'success',
          title: 'New Booking',
          message: `New booking created for unit ${payload.new.unit_id}`,
          timestamp: new Date().toISOString(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        toast({
          title: newNotification.title,
          description: newNotification.message,
        });
      })
      .subscribe();

    // Listen for payment updates
    const paymentsChannel = supabase
      .channel('notifications-payments')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'payments'
      }, (payload) => {
        if (payload.new.status === 'paid' && payload.old.status !== 'paid') {
          const newNotification: Notification = {
            id: crypto.randomUUID(),
            type: 'success',
            title: 'Payment Received',
            message: `Payment of £${(payload.new.amount_pence / 100).toFixed(2)} received`,
            timestamp: new Date().toISOString(),
            read: false
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(paymentsChannel);
    };
  }, [toast]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    markAsRead,
    clearAll
  };
}