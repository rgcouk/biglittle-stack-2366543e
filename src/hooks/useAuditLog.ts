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
      // Mock audit log data since we don't have an audit_logs table yet
      const mockAuditLog: AuditLogEntry[] = [
        {
          id: '1',
          user_id: 'user-1',
          action: 'create_unit',
          resource_type: 'unit',
          resource_id: 'unit-123',
          details: { unit_number: 'A-101', size: 'small' },
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user_name: 'John Provider'
        },
        {
          id: '2',
          user_id: 'user-1',
          action: 'update_facility',
          resource_type: 'facility',
          resource_id: 'facility-456',
          details: { name: 'Updated Facility Name' },
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          user_name: 'John Provider'
        },
        {
          id: '3',
          user_id: 'user-1',
          action: 'delete_unit',
          resource_type: 'unit',
          resource_id: 'unit-789',
          details: { unit_number: 'B-202', reason: 'Out of service' },
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          user_name: 'John Provider'
        }
      ];
      
      return mockAuditLog.slice(0, limit);
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