import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
  action_url?: string;
}

export function useNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // For now, return mock data since we don't have a notifications table
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      // Mock notifications data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Payment Received',
          message: 'Customer John Smith has made a payment of £150.00',
          type: 'success',
          read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          action_url: '/provider/billing'
        },
        {
          id: '2',
          title: 'Maintenance Due',
          message: 'Unit A-101 requires maintenance check',
          type: 'warning',
          read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          action_url: '/provider/units'
        },
        {
          id: '3',
          title: 'New Booking',
          message: 'Unit B-205 has been booked by Sarah Johnson',
          type: 'info',
          read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          action_url: '/provider/customers'
        }
      ];
      return mockNotifications;
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      // Mock implementation - in real app would update database
      console.log('Marking notification as read:', notificationId);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsRead.mutate,
    isMarkingAsRead: markAsRead.isPending,
  };
}