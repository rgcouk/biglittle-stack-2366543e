import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useBillingData() {
  return useQuery({
    queryKey: ['billing-data'],
    queryFn: async () => {
      // Get current user's profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'provider')
        .single();

      if (!profile) throw new Error('Provider profile not found');

      // Get facilities for this provider
      const { data: facilities } = await supabase
        .from('facilities')
        .select('id')
        .eq('provider_id', profile.id);

      if (!facilities?.length) {
        return {
          totalRevenue: 0,
          outstanding: 0,
          paidThisMonth: 0,
          paymentRate: 0,
          recentPayments: [],
        };
      }

      const facilityIds = facilities.map(f => f.id);

      // Get units for these facilities
      const { data: units } = await supabase
        .from('units')
        .select('id, unit_number')
        .in('facility_id', facilityIds);

      if (!units?.length) {
        return {
          totalRevenue: 0,
          outstanding: 0,
          paidThisMonth: 0,
          paymentRate: 0,
          recentPayments: [],
        };
      }

      const unitIds = units.map(u => u.id);

      // Get bookings for these units
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, customer_id, monthly_rate_pence')
        .in('unit_id', unitIds)
        .eq('status', 'active');

      if (!bookings?.length) {
        return {
          totalRevenue: 0,
          outstanding: 0,
          paidThisMonth: 0,
          paymentRate: 0,
          recentPayments: [],
        };
      }

      const bookingIds = bookings.map(b => b.id);

      // Get payments for these bookings
      const { data: payments } = await supabase
        .from('payments')
        .select(`
          *,
          bookings!inner (
            customer_id,
            units!inner (
              unit_number
            )
          )
        `)
        .in('booking_id', bookingIds)
        .order('created_at', { ascending: false })
        .limit(20);

      // Get customer profiles for recent payments
      const customerIds = [...new Set(payments?.map(p => p.bookings?.customer_id).filter(Boolean) || [])];
      const { data: customerProfiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', customerIds);

      // Calculate summary statistics
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const paidPayments = payments?.filter(p => p.status === 'paid') || [];
      const paidThisMonth = paidPayments
        .filter(p => new Date(p.payment_date) >= thisMonth)
        .reduce((sum, p) => sum + (p.amount_pence || 0), 0);

      const totalRevenue = bookings.reduce((sum, b) => sum + (b.monthly_rate_pence || 0), 0);
      const outstanding = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount_pence || 0), 0) || 0;
      const paymentRate = payments?.length ? Math.round((paidPayments.length / payments.length) * 100) : 0;

      // Enhance payments with customer names
      const enhancedPayments = payments?.map(payment => ({
        ...payment,
        customerName: customerProfiles?.find(cp => cp.user_id === payment.bookings?.customer_id)?.display_name,
        unitNumber: payment.bookings?.units?.unit_number,
      })) || [];

      return {
        totalRevenue: totalRevenue / 100,
        outstanding: outstanding / 100,
        paidThisMonth: paidThisMonth / 100,
        paymentRate,
        recentPayments: enhancedPayments,
      };
    },
  });
}