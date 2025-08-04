import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('useUserRole: No user found');
        return null;
      }
      
      console.log('useUserRole: Fetching role for user:', user.id);
      
      try {
        // Direct table query - more reliable than function calls
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user role:', error);
          return null;
        }
        
        console.log('useUserRole: User role fetched:', data?.role);
        return data?.role || null;
      } catch (err) {
        console.error('Unexpected error in useUserRole:', err);
        return null;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1
  });
}