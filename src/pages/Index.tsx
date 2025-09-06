import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/enhanced-card"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { 
  Building, 
  Users, 
  UserCheck, 
  ArrowRight, 
  BarChart3, 
  Shield, 
  Zap, 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle, 
  Settings 
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useUserRole } from "@/hooks/useUserRole"
import { usePublicFacilities } from "@/hooks/usePublicFacilities"
import { Navigation } from "@/components/layout/Navigation"

const Index = () => {
  const { user, signOut } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const { data: facilities, isLoading: facilitiesLoading } = usePublicFacilities();
  const navigate = useNavigate();
  
  const clearCache = () => {
    // Clear browser cache
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Force reload without cache
    window.location.reload();
  };

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
    <div className="min-h-screen bg-gradient-mesh">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-32 px-6">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="relative container mx-auto max-w-6xl text-center">
          <div className="space-y-10 animate-fade-in">
            <div className="space-y-6">
              <h1 className="text-7xl font-bold tracking-tight text-white leading-tight">
                Storage Made <span className="text-orange-200 animate-pulse">Simple</span>
              </h1>
              <p className="text-2xl text-orange-100 max-w-4xl mx-auto leading-relaxed font-light">
                The modern marketplace connecting storage seekers with trusted facilities. Find your perfect storage space or grow your storage business.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              <Button 
                size="xl" 
                variant="modern"
                onClick={handleGetStarted}
                disabled={roleLoading}
                loading={roleLoading}
                loadingText="Loading..."
                className="bg-white text-primary hover:bg-orange-50 shadow-intense hover:shadow-glow"
              >
                {user ? "Go to Dashboard" : "Get Started"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              {!user && (
                <Button 
                  size="xl" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm shadow-modern"
                  onClick={handleCustomerSignup}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Find Storage
                </Button>
              )}
              
              <Button 
                size="lg" 
                variant="ghost" 
                onClick={clearCache}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                Clear Cache
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 pt-12 text-orange-200">
              <div className="flex items-center gap-3 text-lg">
                <CheckCircle className="h-6 w-6" />
                <span className="font-medium">Instant Booking</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <CheckCircle className="h-6 w-6" />
                <span className="font-medium">Secure & Trusted</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <CheckCircle className="h-6 w-6" />
                <span className="font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Facilities */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary-light px-4 py-2 rounded-full text-primary font-medium text-sm mb-6">
              <Star className="h-4 w-4" />
              Featured Storage Facilities
            </div>
            <h2 className="text-4xl font-bold mb-6">Find Storage Near You</h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Discover secure, affordable storage units from verified facilities in your area
            </p>
          </div>
          
          {facilitiesLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} variant="elevated" className="animate-pulse">
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
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {facilities.slice(0, 3).map((facility) => (
                <Card key={facility.id} variant="interactive" className="group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Building className="h-6 w-6 text-primary" />
                      {facility.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-base">
                      <MapPin className="h-4 w-4" />
                      {facility.address}, {facility.postcode}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 line-clamp-2 text-base leading-relaxed">
                      {facility.description || "Secure storage facility with various unit sizes available."}
                    </p>
                    <Button asChild className="w-full" variant="modern" size="lg">
                      <Link to={`/facility/${facility.id}`}>
                        View Units
                        <ArrowRight className="ml-2 h-4 w-4" />
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
              <Button onClick={handleProviderAccess} variant="modern" size="lg">
                <Settings className="mr-2 h-5 w-5" />
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
      <section className="py-20 px-6 bg-gradient-subtle">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary-light px-4 py-2 rounded-full text-primary font-medium text-sm mb-6">
              <Users className="h-4 w-4" />
              Built for Everyone
            </div>
            <h2 className="text-4xl font-bold mb-6">Whether You Need Storage or Provide It</h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              BigLittleBox serves both sides of the storage market with tailored solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card variant="glow" className="group p-12 text-center space-y-10 hover:scale-[1.02] transition-all duration-300">
              <div className="mx-auto p-8 bg-primary/10 rounded-3xl w-fit group-hover:bg-primary/20 transition-colors shadow-modern">
                <Users className="h-20 w-20 text-primary" />
              </div>
              <div className="space-y-8">
                <h3 className="text-4xl font-bold">For Customers</h3>
                <p className="text-muted-foreground text-xl leading-relaxed">
                  Find and book secure storage units in your area. Manage your bookings, payments, and access everything from your personal dashboard.
                </p>
                <div className="grid gap-6 text-left">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-semibold text-lg">Browse available units instantly</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-semibold text-lg">24/7 online booking system</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-semibold text-lg">Secure payment processing</span>
                  </div>
                </div>
              </div>
              <Button onClick={handleCustomerSignup} size="xl" className="w-full" variant="gradient">
                Find Storage
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Card>

            {/* For Providers */}
            <Card variant="modern" className="group p-12 text-center space-y-10 hover:scale-[1.02] transition-all duration-300">
              <div className="mx-auto p-8 bg-primary/10 rounded-3xl w-fit group-hover:bg-primary/20 transition-colors shadow-modern">
                <Building className="h-20 w-20 text-primary" />
              </div>
              <div className="space-y-8">
                <h3 className="text-4xl font-bold">For Storage Providers</h3>
                <p className="text-muted-foreground text-xl leading-relaxed">
                  Grow your storage business with powerful management tools. Handle units, customers, billing, and analytics from one platform.
                </p>
                <div className="grid gap-6 text-left">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <UserCheck className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-semibold text-lg">Complete unit management</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-semibold text-lg">Automated billing & payments</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-semibold text-lg">Advanced business analytics</span>
                  </div>
                </div>
              </div>
              <Button onClick={handleProviderAccess} size="xl" className="w-full" variant="outline">
                <Settings className="mr-2 h-6 w-6" />
                Become a Provider
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary-light px-4 py-2 rounded-full text-primary font-medium text-sm mb-6">
              <BarChart3 className="h-4 w-4" />
              Enterprise Features
            </div>
            <h2 className="text-4xl font-bold mb-6">Built for Scale</h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Enterprise-grade features designed for storage businesses of all sizes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-6 group">
              <div className="mx-auto p-6 bg-primary/10 rounded-2xl w-fit group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Analytics & Reporting</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Real-time insights into occupancy, revenue, and business performance with detailed reporting
              </p>
            </div>
            <div className="text-center space-y-6 group">
              <div className="mx-auto p-6 bg-primary/10 rounded-2xl w-fit group-hover:bg-primary/20 transition-colors">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Secure & Compliant</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Enterprise security with document management, audit trails, and compliance features
              </p>
            </div>
            <div className="text-center space-y-6 group">
              <div className="mx-auto p-6 bg-primary/10 rounded-2xl w-fit group-hover:bg-primary/20 transition-colors">
                <Zap className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Automated Billing</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Integrated Stripe payments with automated invoicing, late fees, and financial management
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">BigLittleBox</span>
              </div>
              <p className="text-background/70 leading-relaxed">
                The modern storage marketplace connecting customers with trusted storage providers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Customers</h4>
              <ul className="space-y-2 text-background/70">
                <li><a href="#" className="hover:text-primary transition-colors">Find Storage</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Providers</h4>
              <ul className="space-y-2 text-background/70">
                <li><a href="#" className="hover:text-primary transition-colors">List Your Facility</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing Plans</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-background/70">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-background/60 text-sm mb-4 md:mb-0">
              © 2024 BigLittleBox. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <span className="text-background/60 text-sm">Made with ❤️ for storage businesses</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Index