import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user) {
        return null;
      }
      
      try {
        // Query from the api schema using the correct schema prefix
        const { data, error } = await supabase
          .rpc('get_current_user_role');
        
        if (error) {
          return null;
        }
        
        return data || null;
      } catch (err) {
        return null;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1
  });
}