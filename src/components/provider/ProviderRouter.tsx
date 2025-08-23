import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import ProviderDashboard from '@/pages/provider/Dashboard';

export default function ProviderRouter() {
  const { user, loading: authLoading } = useAuth();
  const { data: userRole, isLoading: roleLoading, error: roleError } = useUserRole();
  const [hasFacility, setHasFacility] = useState(false);
  const [isProvider, setIsProvider] = useState<boolean | null>(null);
  const [checkingFacilities, setCheckingFacilities] = useState(false);

  useEffect(() => {
    const checkFacility = async () => {
      // Don't proceed if auth or role is still loading
      if (authLoading || roleLoading) return;

      console.log('ProviderRouter: Checking facilities. User:', user?.id, 'Role:', userRole, 'Role Error:', roleError);

      try {
        if (!user || roleError || userRole !== 'provider') {
          console.log('ProviderRouter: Not a provider or error detected');
          setIsProvider(false);
          setHasFacility(false);
          return;
        }

        setIsProvider(true);
        setCheckingFacilities(true);

        // First get the current user's provider profile ID
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .eq('role', 'provider')
          .single();

        console.log('ProviderRouter: Profile lookup result:', { profile, profileError });

        if (profileError) {
          throw profileError;
        }

        // Then check for facilities owned by this provider
        const { data: facilities, error: facilityError } = await supabase
          .from('facilities')
          .select('id, name, provider_id')
          .eq('provider_id', profile.id)
          .limit(10);

        console.log('ProviderRouter: Facilities lookup result:', { facilities, facilityError });

        if (facilityError) {
          throw facilityError;
        }

        const hasFacilities = !!facilities && facilities.length > 0;
        console.log('ProviderRouter: Setting hasFacility to:', hasFacilities);
        setHasFacility(hasFacilities);
      } catch (error) {
        console.error('ProviderRouter: Error checking facilities:', error);
        setHasFacility(false);
      } finally {
        setCheckingFacilities(false);
      }
    };

    checkFacility();
  }, [user, userRole, authLoading, roleLoading, roleError]);

  console.log('ProviderRouter render state:', { 
    authLoading, 
    roleLoading, 
    checkingFacilities, 
    isProvider, 
    hasFacility, 
    userRole 
  });

  if (authLoading || roleLoading || checkingFacilities) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">
            {authLoading && "Loading authentication..."}
            {roleLoading && "Checking user role..."}
            {checkingFacilities && "Looking for your facilities..."}
          </p>
        </div>
      </div>
    );
  }

  if (isProvider === false) {
    return <Navigate to="/" replace />;
  }

  if (isProvider && !hasFacility) {
    return <Navigate to="/provider/onboarding" replace />;
  }

  return <ProviderDashboard />;
}