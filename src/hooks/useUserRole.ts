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

      // First try to get from profiles table directly
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('useUserRole: Profile query error:', profileError);
        // Fallback to default role instead of RPC to avoid auth loops
        console.log('useUserRole: Defaulting to customer role due to profile error');
        return 'customer';
      }

      console.log('useUserRole: Got role from profiles table:', profile.role);
      return profile.role || 'customer';
    },
    enabled: !!user,
    staleTime: 1000, // Very short cache to force refresh
    retry: 1,
  });
}
