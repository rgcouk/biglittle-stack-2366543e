import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user) return null;

      console.log('useUserRole: Fetching role for user:', user.id);

      // Try API schema first, then fallback to public
      const apiClient = (supabase as any).schema('api');
      const { data, error } = await (apiClient as any).rpc('get_current_user_role');

      // Fallback: try public schema if API not found
      if (error && (error?.message?.includes('Not Found') || (error as any)?.code === '404')) {
        console.log('useUserRole: API schema failed, trying public schema');
        const res = await (supabase as any).rpc('get_current_user_role');
        if (res.error) {
          console.error('useUserRole: Public schema error:', res.error);
          throw res.error;
        }
        console.log('useUserRole: Got role from public schema:', res.data);
        return res.data || null;
      }

      if (error) {
        console.error('useUserRole: API schema error:', error);
        throw error;
      }

      console.log('useUserRole: Got role from API schema:', data);
      return data || null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
