import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import ProviderDashboard from '@/pages/provider/Dashboard';

export default function ProviderRouter() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasFacility, setHasFacility] = useState(false);

  useEffect(() => {
    const checkFacility = async () => {
      if (!user) return;

      try {
        // Get user's role first
        const { data: userRole, error: roleError } = await supabase
          .rpc('get_current_user_role');

        if (roleError) throw roleError;

        if (userRole !== 'provider') {
          setHasFacility(false);
          return;
        }

        // Check if they have a facility using a simple query
        const { data: facilities, error: facilityError } = await supabase
          .from('facilities')
          .select('id')
          .limit(1);

        if (facilityError) throw facilityError;

        setHasFacility(facilities && facilities.length > 0);
      } catch (error) {
        console.error('Error checking facility:', error);
        setHasFacility(false);
      } finally {
        setLoading(false);
      }
    };

    checkFacility();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasFacility) {
    return <Navigate to="/provider/onboarding" replace />;
  }

  return <ProviderDashboard />;
}