import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      // Get all customers with their profiles and active bookings
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer_id,
          unit_id,
          units!inner (
            unit_number,
            facility_id,
            facilities!inner (
              provider_id,
              profiles!inner (
                user_id
              )
            )
          )
        `)
        .eq('status', 'active');

      if (error) throw error;

      // Get customer profiles for the bookings
      const customerIds = [...new Set(bookings?.map(b => b.customer_id) || [])];
      
      if (customerIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', customerIds);

      if (profilesError) throw profilesError;

      // Combine bookings with profile data
      const customers = profiles?.map(profile => {
        const customerBookings = bookings?.filter(b => b.customer_id === profile.user_id) || [];
        const totalMonthlyRevenue = customerBookings.reduce((sum, booking) => 
          sum + (booking.monthly_rate_pence || 0), 0);

        return {
          ...profile,
          bookings: customerBookings,
          totalMonthlyRevenue: totalMonthlyRevenue / 100, // Convert to pounds
          unitCount: customerBookings.length,
        };
      }) || [];

      return customers;
    },
  });
}

export function useCustomerDetails(customerId: string) {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      // Get customer profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', customerId)
        .single();

      if (profileError) throw profileError;

      // Get customer's bookings with unit details
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          units (
            unit_number,
            size_category,
            length_metres,
            width_metres,
            height_metres,
            facilities (
              name
            )
          )
        `)
        .eq('customer_id', customerId);

      if (bookingsError) throw bookingsError;

      // Get payment history
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .in('booking_id', bookings?.map(b => b.id) || [])
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      return {
        profile,
        bookings: bookings || [],
        payments: payments || [],
      };
    },
    enabled: !!customerId,
  });
}