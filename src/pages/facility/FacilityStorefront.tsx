import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/currency';
import { useFacilityContext } from '@/hooks/useFacilityContext';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, MapPin, Phone } from 'lucide-react';

export default function FacilityStorefront() {
  const { facilityId: paramFacilityId } = useParams();
  const { facilityId: contextFacilityId, isSubdomain } = useFacilityContext();
  const { user } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  
  // Use facility ID from context (subdomain) or URL params (fallback)
  const facilityId = contextFacilityId || paramFacilityId;

  const { data: facility, isLoading: facilityLoading } = useQuery({
    queryKey: ['facility', facilityId],
    queryFn: async () => {
      if (!facilityId) throw new Error('No facility ID provided');
      
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', facilityId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!facilityId,
  });

  const { data: units, isLoading: unitsLoading } = useQuery({
    queryKey: ['units', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('status', 'available')
        .order('unit_number');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId,
  });

  const handleBooking = async (unitId: string) => {
    if (!user) {
      // Redirect to facility-specific signup
      window.location.href = `/auth?type=customer&facility=${facilityId}`;
      return;
    }

    // Handle booking logic here
    console.log('Booking unit:', unitId);
  };

  if (facilityLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <CardHeader>
            <CardTitle>Facility Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The storage facility you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{facility.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <MapPin className="h-4 w-4" />
                <span>{facility.address}, {facility.postcode}</span>
              </div>
            </div>
            {!user && (
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <a href={`/auth?type=customer&facility=${facilityId}`}>
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </a>
                </Button>
                <Button asChild>
                  <a href={`/auth?type=customer&facility=${facilityId}&signup=true`}>
                    Get Started
                  </a>
                </Button>
              </div>
            )}
          </div>
          
          {facility.description && (
            <p className="text-muted-foreground mt-4 max-w-2xl">{facility.description}</p>
          )}
          
          <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
            {facility.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{facility.phone}</span>
              </div>
            )}
            {facility.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{facility.email}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Units Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Available Storage Units</h2>
          <Badge variant="secondary">{units?.length || 0} units available</Badge>
        </div>

        {unitsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : units && units.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <Card 
                key={unit.id} 
                className={`transition-all duration-200 hover:shadow-card cursor-pointer ${
                  selectedUnit === unit.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedUnit(unit.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Unit {unit.unit_number}</CardTitle>
                    <Badge variant={unit.status === 'available' ? 'default' : 'secondary'}>
                      {unit.status}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(unit.monthly_price_pence)}/month
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Size Category:</span>
                      <span className="font-medium">{unit.size_category}</span>
                    </div>
                    {unit.width_metres && unit.length_metres && (
                      <div className="flex justify-between">
                        <span>Dimensions:</span>
                        <span className="font-medium">
                          {unit.width_metres}m × {unit.length_metres}m
                          {unit.height_metres && ` × ${unit.height_metres}m`}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Floor Level:</span>
                      <span className="font-medium">{unit.floor_level}</span>
                    </div>
                  </div>
                  
                  {unit.features && unit.features.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {unit.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBooking(unit.id);
                    }}
                    disabled={unit.status !== 'available'}
                  >
                    {unit.status === 'available' ? 'Book Now' : 'Not Available'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">No Units Available</h3>
              <p className="text-muted-foreground">
                There are currently no storage units available at this facility. 
                Please check back later or contact the facility directly.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}