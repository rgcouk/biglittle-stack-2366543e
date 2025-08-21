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
  const isSubdomain = hostname !== 'localhost' && 
                      hostname !== '127.0.0.1' && 
                      !hostname.includes('lovable.app') &&
                      hostname.includes('.biglittlebox.io');
  
  const subdomain = isSubdomain ? hostname.split('.')[0] : null;
  
  return { isSubdomain, subdomain };
};