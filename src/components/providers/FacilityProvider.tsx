import React, { ReactNode, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FacilityContext, detectFacilityFromUrl } from '@/hooks/useFacilityContext';
import { Loader2 } from 'lucide-react';

interface FacilityProviderProps {
  children: ReactNode;
}

export function FacilityProvider({ children }: FacilityProviderProps) {
  const [facilityContext, setFacilityContext] = useState<{
    facilityId: string | null;
    subdomain: string | null;
    isSubdomain: boolean;
  }>({
    facilityId: null,
    subdomain: null,
    isSubdomain: false,
  });

  // Detect facility from URL
  const { isSubdomain, subdomain } = detectFacilityFromUrl();

  // Fetch facility ID from subdomain if applicable
  const { data: facilityData, isLoading } = useQuery({
    queryKey: ['facility-by-subdomain', subdomain],
    queryFn: async () => {
      if (!subdomain) return null;
      
      const { data, error } = await supabase
        .from('facilities')
        .select('id')
        .eq('subdomain', subdomain)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!subdomain,
  });

  useEffect(() => {
    setFacilityContext({
      facilityId: facilityData?.id || null,
      subdomain,
      isSubdomain,
    });
  }, [facilityData, subdomain, isSubdomain]);

  // Show loading state while resolving facility
  if (isSubdomain && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <FacilityContext.Provider value={facilityContext}>
      {children}
    </FacilityContext.Provider>
  );
}