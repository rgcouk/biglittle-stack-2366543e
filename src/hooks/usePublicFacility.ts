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

      // Get available units for this facility
      const { data: units, error: unitsError } = await supabase
        .from('units_public_discovery')
        .select('*')
        .eq('facility_id', facilityId);

      if (unitsError) {
        console.error('Error fetching units:', unitsError);
        throw unitsError;
      }

      // Get detailed units for display (we need actual unit data for the storefront)
      const { data: detailedUnits, error: detailedError } = await supabase
        .from('units')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('status', 'available');

      if (detailedError) {
        console.error('Error fetching detailed units:', detailedError);
        // Don't throw here, just use aggregated data
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
    queryKey: ['public-units', facilityId],
    queryFn: async () => {
      console.log('Fetching public units for facility:', facilityId);
      
      const { data: units, error } = await supabase
        .from('units')
        .select(`
          id,
          unit_number,
          size_category,
          monthly_price_pence,
          width_metres,
          length_metres,
          height_metres,
          features,
          status
        `)
        .eq('facility_id', facilityId)
        .eq('status', 'available')
        .order('monthly_price_pence', { ascending: true });

      if (error) {
        console.error('Error fetching units:', error);
        throw error;
      }

      return units || [];
    },
    enabled: !!facilityId,
  });
}