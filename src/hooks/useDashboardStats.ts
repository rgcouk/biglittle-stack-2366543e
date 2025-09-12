import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error('User not authenticated');
        }

        // Get provider profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('user_id', user.id)
          .eq('role', 'provider')
          .single();

        if (profileError || !profile) {
          throw new Error('Provider profile not found');
        }

        // Get facilities for this provider
        const { data: facilities, error: facilitiesError } = await supabase
          .from('facilities')
          .select('id')
          .eq('provider_id', profile.id);

        if (facilitiesError) {
          throw new Error('Failed to fetch facilities');
        }

        if (!facilities?.length) {
          return {
            totalUnits: 0,
            availableUnits: 0,
            occupiedUnits: 0,
            activeCustomers: 0,
            monthlyRevenue: 0,
            occupancyRate: 0,
          };
        }
      } catch (error) {
        console.error('Dashboard stats error:', error);
        return {
          totalUnits: 0,
          availableUnits: 0,
          occupiedUnits: 0,
          activeCustomers: 0,
          monthlyRevenue: 0,
          occupancyRate: 0,
        };
      }

      const facilityIds = facilities.map(f => f.id);

      // Get units data
      const { data: units } = await supabase
        .from('units')
        .select('id, status, monthly_price_pence')
        .in('facility_id', facilityIds);

      // Get bookings data for active customers
      const { data: bookings } = await supabase
        .from('bookings')
        .select('customer_id, monthly_rate_pence, unit_id')
        .eq('status', 'active')
        .in('unit_id', units?.map(u => u.id) || []);

      const totalUnits = units?.length || 0;
      const availableUnits = units?.filter(u => u.status === 'available').length || 0;
      const occupiedUnits = units?.filter(u => u.status === 'occupied').length || 0;
      const activeCustomers = new Set(bookings?.map(b => b.customer_id)).size || 0;
      const monthlyRevenue = bookings?.reduce((sum, booking) => sum + (booking.monthly_rate_pence || 0), 0) || 0;
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

      return {
        totalUnits,
        availableUnits,
        occupiedUnits,
        activeCustomers,
        monthlyRevenue: monthlyRevenue / 100, // Convert to pounds
        occupancyRate,
      };
    },
  });
}