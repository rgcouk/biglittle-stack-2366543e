import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/ui/hero-section"
import { Building, Users, UserCheck, ArrowRight, BarChart3, Shield, Zap, LogIn, LogOut, Settings } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useUserRole } from "@/hooks/useUserRole"

const Index = () => {
  const { user, signOut } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    if (user) {
      // If logged in, redirect based on role
      if (userRole === 'provider') {
        navigate("/provider/dashboard");
      } else {
        navigate("/storefront");
      }
    } else {
      // If not logged in, go to auth page
      navigate("/auth");
    }
  }
  
  const handleProviderAccess = () => {
    if (user && userRole === 'provider') {
      navigate("/provider/dashboard");
    } else {
      navigate("/auth");
    }
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
            Complete SaaS platform for storage unit businesses. Manage units, customers, billing, and documents with enterprise-grade security.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={handleGetStarted}
              disabled={roleLoading}
            >
              {roleLoading ? "Loading..." : user && userRole === 'provider' ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            {/* Provider Dashboard Button */}
            {!user || userRole !== 'provider' ? (
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
                onClick={handleProviderAccess}
              >
                <Settings className="mr-2 h-4 w-4" />
                Provider Dashboard
              </Button>
            ) : null}
            
            {user ? (
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
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

      {/* How It Works */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How BigLittleBox Works</h2>
            <p className="text-muted-foreground text-lg">
              Simple, secure, and efficient storage management for providers and customers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">For Storage Providers</h3>
              <p className="text-muted-foreground">
                Manage your storage facility with powerful tools for unit management, customer relations, and billing automation.
              </p>
              <Button variant="outline" onClick={handleProviderAccess}>
                Get Started as Provider
              </Button>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">For Customers</h3>
              <p className="text-muted-foreground">
                Find, book, and manage your storage unit with our intuitive customer portal and mobile-friendly interface.
              </p>
              <Button variant="outline" asChild>
                <Link to="/storefront">Browse Storage Units</Link>
              </Button>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Seamless Integration</h3>
              <p className="text-muted-foreground">
                Built-in payment processing, automated billing, and comprehensive reporting keep your business running smoothly.
              </p>
              <Button variant="outline" asChild>
                <Link to="/auth">Learn More</Link>
              </Button>
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
                Enterprise storage management platform
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