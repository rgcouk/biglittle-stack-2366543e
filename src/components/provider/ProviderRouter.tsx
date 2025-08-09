import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import ProviderDashboard from '@/pages/provider/Dashboard';

export default function ProviderRouter() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasFacility, setHasFacility] = useState(false);
  const [isProvider, setIsProvider] = useState<boolean | null>(null);
  const { data: userRole, isLoading: roleLoading, error: roleError } = useUserRole();

useEffect(() => {
  const checkFacility = async () => {
    if (!user) {
      setIsProvider(null);
      setHasFacility(false);
      setLoading(false);
      return;
    }

    if (roleLoading) return;

    try {
      if (roleError || userRole !== 'provider') {
        setIsProvider(false);
        setHasFacility(false);
        return;
      }

      setIsProvider(true);

      const { data: facilities, error: facilityError } = await supabase
        .from('facilities')
        .select('id')
        .limit(1);

      if (facilityError) throw facilityError;

      setHasFacility(!!facilities && facilities.length > 0);
    } catch {
      setHasFacility(false);
    } finally {
      setLoading(false);
    }
  };

  checkFacility();
}, [user, userRole, roleLoading, roleError]);

if (loading || roleLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

  if (!loading && isProvider === false) {
    return <Navigate to="/" replace />;
  }

  if (isProvider && !hasFacility) {
    return <Navigate to="/provider/onboarding" replace />;
  }

  return <ProviderDashboard />;
}