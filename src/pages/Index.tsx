import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/ui/hero-section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Users, UserCheck, ArrowRight, BarChart3, Shield, Zap, LogIn, LogOut, Settings, Search, MapPin, Clock } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useUserRole } from "@/hooks/useUserRole"
import { useFacilities } from "@/hooks/useFacilities"

const Index = () => {
  const { user, signOut } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    if (user && userRole === 'provider') {
      navigate("/provider");
    } else if (user && userRole === 'customer') {
      navigate("/customer");
    } else {
      navigate("/auth");
    }
  }
  
  const handleProviderAccess = () => {
    if (user && userRole === 'provider') {
      navigate("/provider");
    } else {
      navigate("/auth?type=provider");
    }
  }

  const handleCustomerSignup = () => {
    navigate("/auth?type=customer");
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection>
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-5xl font-bold tracking-tight">
            BigLittleBox
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            The complete marketplace for storage. Find storage units near you or manage your storage business with enterprise-grade tools.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button 
              size="lg" 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={handleGetStarted}
              disabled={roleLoading}
            >
              {roleLoading ? "Loading..." : user ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            {!user && (
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={handleCustomerSignup}
              >
                <Search className="mr-2 h-4 w-4" />
                Find Storage
              </Button>
            )}
            
            {user ? (
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/auth">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </HeroSection>

      {/* Featured Facilities */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Find Storage Near You</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Browse available storage units from trusted facilities in your area
            </p>
          </div>
          
          {facilitiesLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : facilities && facilities.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {facilities.slice(0, 3).map((facility) => (
                <Card key={facility.id} className="hover:shadow-elevated transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      {facility.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {facility.address}, {facility.postcode}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {facility.description || "Secure storage facility with various unit sizes available."}
                    </p>
                    <Button asChild className="w-full">
                      <Link to={`/facility/${facility.id}`}>
                        View Units
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No facilities available yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to list your storage facility on our platform
              </p>
              <Button onClick={handleProviderAccess}>
                <Settings className="mr-2 h-4 w-4" />
                Become a Provider
              </Button>
            </div>
          )}
          
          {facilities && facilities.length > 3 && (
            <div className="text-center">
              <Button variant="outline" size="lg">
                View All Facilities
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Two-Sided Platform */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built for Everyone</h2>
            <p className="text-muted-foreground text-lg">
              Whether you need storage or provide it, BigLittleBox has you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Customers */}
            <Card className="p-8 text-center space-y-6 bg-gradient-card">
              <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">For Customers</h3>
                <p className="text-muted-foreground mb-6">
                  Find and book secure storage units in your area. Manage your bookings, payments, and access everything from your personal dashboard.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    Browse available units
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    24/7 online booking
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Secure payment processing
                  </li>
                </ul>
              </div>
              <Button onClick={handleCustomerSignup} size="lg" className="w-full">
                Find Storage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>

            {/* For Providers */}
            <Card className="p-8 text-center space-y-6 bg-gradient-card">
              <div className="mx-auto p-4 bg-accent/10 rounded-full w-fit">
                <Building className="h-12 w-12 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">For Storage Providers</h3>
                <p className="text-muted-foreground mb-6">
                  Grow your storage business with powerful management tools. Handle units, customers, billing, and analytics from one platform.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-accent" />
                    Complete unit management
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent" />
                    Automated billing
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-accent" />
                    Business analytics
                  </li>
                </ul>
              </div>
              <Button onClick={handleProviderAccess} size="lg" className="w-full" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Become a Provider
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Enterprise-Grade Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for storage businesses of all sizes, from single locations to enterprise chains
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Analytics & Reporting</h3>
              <p className="text-muted-foreground">
                Real-time insights into occupancy, revenue, and business performance
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure & Compliant</h3>
              <p className="text-muted-foreground">
                Enterprise security with document management and audit trails
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Automated Billing</h3>
              <p className="text-muted-foreground">
                Integrated Stripe payments with automated invoicing and late fees
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-8 px-6 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="font-bold text-lg">BigLittleBox</h3>
              <p className="text-sm text-muted-foreground">
                The complete storage marketplace
              </p>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Documentation</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Index