import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          unit:units(*),
          customer:profiles(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCustomerBookings() {
  return useQuery({
    queryKey: ['customer-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          unit:units(*),
          facility:units(facility:facilities(*))
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useProviderBookings() {
  return useQuery({
    queryKey: ['provider-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          unit:units(*),
          customer:profiles(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (booking: BookingInsert) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
      toast({
        title: "Success",
        description: "Booking created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to create booking.",
        variant: "destructive",
      });
    },
  });
}