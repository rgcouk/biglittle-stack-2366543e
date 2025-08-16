import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePublicFacilities() {
  return useQuery({
    queryKey: ['public-facilities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facilities_public_marketing')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}

export function usePublicFacility(facilityId: string) {
  return useQuery({
    queryKey: ['public-facility', facilityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facilities_public_marketing')
        .select('*')
        .eq('id', facilityId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!facilityId,
  });
}

// Hook for getting full facility data (with contact info) for authenticated users
export function useAuthenticatedFacility(facilityId: string) {
  return useQuery({
    queryKey: ['auth-facility', facilityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', facilityId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!facilityId,
  });
}