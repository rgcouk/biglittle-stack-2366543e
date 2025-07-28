import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Facility = Database['public']['Tables']['facilities']['Row'];
type FacilityInsert = Database['public']['Tables']['facilities']['Insert'];
type FacilityUpdate = Database['public']['Tables']['facilities']['Update'];

export function useFacilities() {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useFacility(facilityId: string) {
  return useQuery({
    queryKey: ['facility', facilityId],
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

export function useProviderFacilities() {
  return useQuery({
    queryKey: ['provider-facilities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateFacility() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: FacilityUpdate }) => {
      const { data, error } = await supabase
        .from('facilities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      queryClient.invalidateQueries({ queryKey: ['provider-facilities'] });
      toast({
        title: "Success",
        description: "Facility updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update facility.",
        variant: "destructive",
      });
    },
  });
}