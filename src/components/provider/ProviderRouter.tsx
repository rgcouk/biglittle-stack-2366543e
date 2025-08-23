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

  useEffect(() => {
    const checkFacility = async () => {
      // Don't proceed if auth or role is still loading
      if (authLoading || roleLoading) return;

      try {
        if (!user || roleError || userRole !== 'provider') {
          setIsProvider(false);
          setHasFacility(false);
          return;
        }

        setIsProvider(true);

        console.log('Checking facilities for user:', user.id, 'role:', userRole);
        
        const { data: facilities, error: facilityError } = await supabase
          .from('facilities')
          .select('id, name, provider_id')
          .limit(10);

        console.log('Facilities query result:', { facilities, facilityError });

        if (facilityError) {
          console.error('Facility check error:', facilityError);
          throw facilityError;
        }

        const hasFacilities = !!facilities && facilities.length > 0;
        console.log('Setting hasFacility to:', hasFacilities);
        setHasFacility(hasFacilities);
      } catch {
        setHasFacility(false);
      }
    };

    checkFacility();
  }, [user, userRole, authLoading, roleLoading, roleError]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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