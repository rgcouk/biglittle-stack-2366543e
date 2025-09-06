import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useUserRole() {
  const { user, session } = useAuth();

  return useQuery({
    queryKey: ['userRole', user?.id, session?.access_token],
    queryFn: async () => {
      if (!user || !session) {
        console.log('useUserRole: No user or session available');
        return null;
      }

      console.log('useUserRole: Fetching role for user:', user.id);

      try {
        // Use the enhanced database function for better error handling
        const { data: roleData, error: rpcError } = await supabase.rpc('get_user_role_enhanced', {
          user_uuid: user.id
        });

        if (rpcError) {
          console.error('useUserRole: Enhanced RPC error:', rpcError);
          // Fallback to direct profile query
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();

          if (profileError) {
            console.error('useUserRole: Profile query error:', profileError);
            console.log('useUserRole: Defaulting to customer role due to errors');
            return 'customer';
          }

          console.log('useUserRole: Got role from fallback profiles query:', profile?.role);
          return profile?.role || 'customer';
        }

        console.log('useUserRole: Got role from enhanced function:', roleData);
        return roleData || 'customer';
      } catch (error) {
        console.error('useUserRole: Unexpected error:', error);
        return 'customer';
      }
    },
    enabled: !!user && !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes cache for better performance
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    retry: (failureCount, error) => {
      console.warn(`useUserRole: Retry attempt ${failureCount} due to:`, error);
      return failureCount < 2; // Retry up to 2 times
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
