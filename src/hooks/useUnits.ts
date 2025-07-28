import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Unit = Database['public']['Tables']['units']['Row'];
type UnitInsert = Database['public']['Tables']['units']['Insert'];
type UnitUpdate = Database['public']['Tables']['units']['Update'];

export function useUnits(facilityId?: string) {
  return useQuery({
    queryKey: ['units', facilityId],
    queryFn: async () => {
      let query = supabase.from('units').select('*');
      
      if (facilityId) {
        query = query.eq('facility_id', facilityId);
      }
      
      const { data, error } = await query.order('unit_number');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useUnit(unitId: string) {
  return useQuery({
    queryKey: ['unit', unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('id', unitId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!unitId,
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (unit: UnitInsert) => {
      const { data, error } = await supabase
        .from('units')
        .insert(unit)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast({
        title: "Success",
        description: "Unit created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create unit.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UnitUpdate }) => {
      const { data, error } = await supabase
        .from('units')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast({
        title: "Success",
        description: "Unit updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update unit.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (unitId: string) => {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', unitId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast({
        title: "Success",
        description: "Unit deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete unit.",
        variant: "destructive",
      });
    },
  });
}