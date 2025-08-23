import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useMultiFacilityDashboard() {
  return useQuery({
    queryKey: ['multi-facility-dashboard'],
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

      // Get all facilities for this provider with statistics
      const { data: facilities } = await supabase
        .from('facilities')
        .select(`
          *,
          units:units(count),
          occupied_units:units!inner(count),
          bookings:units(bookings!inner(count, monthly_rate_pence))
        `)
        .eq('provider_id', profile.id)
        .eq('occupied_units.status', 'occupied');

      if (!facilities) return [];

      // Calculate enhanced statistics for each facility
      const facilitiesWithStats = await Promise.all(
        facilities.map(async (facility) => {
          // Get detailed unit and booking data
          const { data: units } = await supabase
            .from('units')
            .select(`
              id,
              status,
              monthly_price_pence,
              bookings!inner(
                id,
                status,
                monthly_rate_pence,
                customer_id
              )
            `)
            .eq('facility_id', facility.id);

          const totalUnits = units?.length || 0;
          const occupiedUnits = units?.filter(u => u.status === 'occupied').length || 0;
          const availableUnits = units?.filter(u => u.status === 'available').length || 0;
          const maintenanceUnits = units?.filter(u => u.status === 'maintenance').length || 0;

          // Calculate revenue from active bookings
          const activeBookings = units?.flatMap(u => 
            u.bookings?.filter(b => b.status === 'active') || []
          ) || [];
          
          const monthlyRevenue = activeBookings.reduce((sum, booking) => 
            sum + (booking.monthly_rate_pence || 0), 0) / 100;

          const uniqueCustomers = new Set(activeBookings.map(b => b.customer_id)).size;
          const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

          return {
            ...facility,
            stats: {
              totalUnits,
              occupiedUnits,
              availableUnits,
              maintenanceUnits,
              monthlyRevenue,
              activeCustomers: uniqueCustomers,
              occupancyRate,
            }
          };
        })
      );

      return facilitiesWithStats;
    },
  });
}

export function useFacilityPerformance(facilityId?: string) {
  return useQuery({
    queryKey: ['facility-performance', facilityId],
    queryFn: async () => {
      if (!facilityId) return null;

      // Get monthly performance data for the last 12 months
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id,
          created_at,
          monthly_rate_pence,
          status,
          units!inner(facility_id)
        `)
        .eq('units.facility_id', facilityId)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      // Get payments data
      const bookingIds = bookings?.map(b => b.id) || [];
      if (bookingIds.length === 0) return [];
      
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .in('booking_id', bookingIds);

          // Process data into monthly performance metrics
          const monthlyData: { [key: string]: any } = {};
          
          bookings?.forEach(booking => {
            const month = new Date(booking.created_at).toISOString().slice(0, 7); // YYYY-MM
            if (!monthlyData[month]) {
              monthlyData[month] = {
                month,
                newBookings: 0,
                revenue: 0,
                occupancyGrowth: 0,
              };
            }
            monthlyData[month].newBookings += 1;
            monthlyData[month].revenue += (booking.monthly_rate_pence || 0) / 100;
          });

      return Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month));
    },
    enabled: !!facilityId,
  });
}