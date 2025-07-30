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
        // Use the database function instead of direct table access
        const { data, error } = await supabase.rpc('get_current_user_role');
        
        if (error) {
          console.error('Error fetching user role:', error);
          return null;
        }
        
        console.log('useUserRole: User role fetched:', data);
        return data || null;
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