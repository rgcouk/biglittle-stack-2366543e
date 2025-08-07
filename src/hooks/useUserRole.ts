import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Try API schema first, then fallback to public
      const apiClient = (supabase as any).schema('api');
      const { data, error } = await apiClient.rpc('get_current_user_role');

      // Fallback: try public schema if API not found
      if (error && (error?.message?.includes('Not Found') || (error as any)?.code === '404')) {
        const res = await supabase.rpc('get_current_user_role');
        if (res.error) throw res.error;
        return res.data || null;
      }

      if (error) throw error;

      return data || null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
