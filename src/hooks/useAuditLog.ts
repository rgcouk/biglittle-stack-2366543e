import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  user_name?: string;
}

export function useAuditLog(limit: number = 50) {
  return useQuery({
    queryKey: ['audit-log', limit],
    queryFn: async () => {
      try {
        const { data: auditLogs, error } = await supabase
          .from('security_audit_log')
          .select(`
            id,
            user_id,
            action,
            table_name,
            record_id,
            details,
            ip_address,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Failed to fetch audit logs:', error);
          return [];
        }

        // Transform data to match expected interface
        return (auditLogs || []).map(log => ({
          id: log.id,
          user_id: log.user_id || 'unknown',
          action: log.action || 'unknown_action',
          resource_type: log.table_name || 'unknown',
          resource_id: log.record_id || 'unknown',
          details: log.details || {},
          ip_address: log.ip_address?.toString() || 'unknown',
          user_agent: 'N/A',
          timestamp: log.created_at || new Date().toISOString(),
          user_name: 'Provider User'
        }));
      } catch (error) {
        console.error('Audit log query failed:', error);
        return [];
      }
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useRecentActivity(limit: number = 10) {
  const { data: auditLog, isLoading } = useAuditLog(limit);
  
  return {
    activities: auditLog || [],
    isLoading
  };
}