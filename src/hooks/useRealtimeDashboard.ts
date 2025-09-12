import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeDashboard() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up realtime subscriptions for dashboard data
    const facilitiesChannel = supabase
      .channel('dashboard-facilities')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'facilities'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .subscribe();

    const unitsChannel = supabase
      .channel('dashboard-units')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'units'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .subscribe();

    const bookingsChannel = supabase
      .channel('dashboard-bookings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['billing-data'] });
      })
      .subscribe();

    const auditChannel = supabase
      .channel('dashboard-audit')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'security_audit_log'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['audit-log'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(facilitiesChannel);
      supabase.removeChannel(unitsChannel);
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(auditChannel);
    };
  }, [queryClient]);
}