import { useParams, Link, useNavigate } from "react-router-dom"
import { usePublicFacility, useAuthenticatedFacility } from "@/hooks/usePublicFacilities"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building, MapPin, Phone, Mail, ArrowLeft, Ruler, DollarSign, Package, CheckCircle } from "lucide-react"
import { Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { useAuth } from "@/hooks/useAuth"
import { useUserRole } from "@/hooks/useUserRole"

const FacilityStorefront = () => {
  const { facilityId } = useParams()
  const { user } = useAuth()
  const { data: userRole } = useUserRole()
  const navigate = useNavigate()
  
  // Use public facility data by default, authenticated data if user is logged in and needs contact info
  const { data: publicFacility, isLoading: publicLoading, error: publicError } = usePublicFacility(facilityId!)
  const { data: authFacility, isLoading: authLoading } = useAuthenticatedFacility(facilityId!)
  
  // Use authenticated facility data if available (has contact info), otherwise use public data
  const facility = authFacility || publicFacility
  const facilityLoading = user ? authLoading : publicLoading
  const facilityError = publicError
  
  const { data: units, isLoading: unitsLoading } = useQuery({
    queryKey: ['facility-units', facilityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('status', 'available')
        .order('monthly_price_pence', { ascending: true })
      
      if (error) throw error
      return data
    },
    enabled: !!facilityId,
  })

  const handleBookUnit = (unitId: string) => {
    if (!user) {
      // Redirect to auth with context to come back to this unit
      navigate(`/auth?type=customer&redirect=/facility/${facilityId}/unit/${unitId}`)
    } else if (userRole === 'customer') {
      // Customer can book directly
      navigate(`/customer/book/${unitId}`)
    } else {
      // Provider or other role - redirect to customer signup
      navigate(`/auth?type=customer&redirect=/facility/${facilityId}/unit/${unitId}`)
    }
  }

  if (facilityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (facilityError || !facility) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Facility Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The facility you're looking for doesn't exist or is no longer available.
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Search
              </Link>
            </Button>
            
            <div className="flex items-center gap-4">
              {user ? (
                <Button variant="outline" asChild>
                  <Link to={userRole === 'customer' ? '/customer' : userRole === 'provider' ? '/provider' : '/'}>
                    My Account
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Facility Header */}
      <section className="py-12 px-6 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Building className="h-8 w-8" />
                <h1 className="text-4xl font-bold">{facility.name}</h1>
              </div>
              
              <div className="space-y-2 text-primary-foreground/90">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{facility.address}, {facility.postcode}</span>
                </div>
                
                {authFacility?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{authFacility.phone}</span>
                  </div>
                )}
                
                {authFacility?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{authFacility.email}</span>
                  </div>
                )}
                
                {!authFacility && (
                  <div className="text-primary-foreground/70 text-sm">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                      className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      <Link to="/auth">Sign in to view contact details</Link>
                    </Button>
                  </div>
                )}
              </div>
              
              {facility.description && (
                <p className="mt-4 text-primary-foreground/90 max-w-2xl">
                  {facility.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Available Units */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Available Storage Units</h2>
            <p className="text-muted-foreground text-lg">
              Choose from a variety of unit sizes to meet your storage needs
            </p>
          </div>

          {unitsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                    <div className="h-8 bg-muted rounded w-full mb-4"></div>
                    <div className="h-10 bg-muted rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : units && units.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {units.map((unit) => (
                <Card key={unit.id} className="hover:shadow-elevated transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Unit {unit.unit_number}
                      </CardTitle>
                      <Badge variant="outline" className="text-accent">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Available
                      </Badge>
                    </div>
                    <CardDescription>{unit.size_category}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Dimensions */}
                    {(unit.length_metres || unit.width_metres || unit.height_metres) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Ruler className="h-4 w-4" />
                        <span>
                          {unit.length_metres && `${unit.length_metres}m`}
                          {unit.width_metres && ` × ${unit.width_metres}m`}
                          {unit.height_metres && ` × ${unit.height_metres}m`}
                        </span>
                      </div>
                    )}
                    
                    {/* Features */}
                    {unit.features && unit.features.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {unit.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {unit.floor_level !== null && (
                      <div className="text-sm text-muted-foreground">
                        Floor Level: {unit.floor_level === 0 ? 'Ground' : `Level ${unit.floor_level}`}
                      </div>
                    )}
                    
                    <Separator />
                    
                    {/* Pricing */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Monthly Rate:</span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="text-xl font-bold text-primary">
                            {formatCurrency(unit.monthly_price_pence)}
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handleBookUnit(unit.id)} 
                        className="w-full"
                        size="lg"
                      >
                        Book This Unit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No units available</h3>
              <p className="text-muted-foreground">
                This facility doesn't have any available units at the moment.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default FacilityStorefront