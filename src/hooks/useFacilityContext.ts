import { createContext, useContext } from 'react';

interface FacilityContextType {
  facilityId: string | null;
  subdomain: string | null;
  isSubdomain: boolean;
}

export const FacilityContext = createContext<FacilityContextType>({
  facilityId: null,
  subdomain: null,
  isSubdomain: false,
});

export const useFacilityContext = () => {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error('useFacilityContext must be used within a FacilityProvider');
  }
  return context;
};

// Utility function to detect subdomain and facility routing
export const detectFacilityFromUrl = () => {
  const hostname = window.location.hostname;
  
  // Check if we're on a subdomain (not the main domain)
  // In development: allow testing with any subdomain
  // In production: look for .biglittlebox.io
  let isSubdomain = false;
  let subdomain = null;
  
  if (hostname.includes('lovable.app') || hostname === 'localhost' || hostname === '127.0.0.1') {
    // Development/testing environment - check for facility parameter in URL for testing
    const urlParams = new URLSearchParams(window.location.search);
    const facilityParam = urlParams.get('facility');
    if (facilityParam) {
      isSubdomain = true;
      subdomain = facilityParam;
    }
  } else if (hostname.includes('.biglittlebox.io')) {
    // Production environment - check for actual subdomain
    isSubdomain = true;
    subdomain = hostname.split('.')[0];
  }
  
  return { isSubdomain, subdomain };
};