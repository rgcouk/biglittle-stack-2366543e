import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePublicFacility(facilityId: string) {
  return useQuery({
    queryKey: ['public-facility', facilityId],
    queryFn: async () => {
      console.log('Fetching public facility data for:', facilityId);
      
      // Get facility from public marketing table
      const { data: facility, error: facilityError } = await supabase
        .from('facilities_public_marketing')
        .select('*')
        .eq('id', facilityId)
        .single();

      if (facilityError) {
        console.error('Error fetching facility:', facilityError);
        throw facilityError;
      }

      // Get secure unit discovery data (no exact pricing for anonymous users)
      const { data: units, error: unitsError } = await supabase
        .from('units_secure_discovery')
        .select('*')
        .eq('facility_id', facilityId);

      if (unitsError) {
        console.error('Error fetching secure unit data:', unitsError);
        throw unitsError;
      }

      // For anonymous users, only show general availability without detailed pricing
      // Detailed units are only available to authenticated users with bookings
      const { data: detailedUnits, error: detailedError } = await supabase
        .from('units')
        .select('id, unit_number, size_category, status, features')
        .eq('facility_id', facilityId)
        .eq('status', 'available');

      if (detailedError) {
        console.error('Error fetching basic unit info:', detailedError);
        // Don't throw here, use secure aggregated data only
      }

      return {
        facility,
        unitCategories: units || [],
        availableUnits: detailedUnits || []
      };
    },
    enabled: !!facilityId,
  });
}

export function usePublicUnits(facilityId: string) {
  return useQuery({
    queryKey: ['public-units-secure', facilityId],
    queryFn: async () => {
      console.log('Fetching secure public units for facility:', facilityId);
      
      // Use secure discovery view that doesn't expose exact pricing to anonymous users
      const { data: units, error } = await supabase
        .from('units_secure_discovery')
        .select('*')
        .eq('facility_id', facilityId);

      if (error) {
        console.error('Error fetching secure unit data:', error);
        throw error;
      }

      return units || [];
    },
    enabled: !!facilityId,
  });
}