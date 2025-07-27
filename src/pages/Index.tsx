import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/ui/hero-section"
import { RoleCard } from "@/components/layout/role-card"
import { Building, Users, UserCheck, ArrowRight, BarChart3, Shield, Zap } from "lucide-react"

const Index = () => {
  const handleRoleSelect = (role: string) => {
    switch (role) {
      case "Platform Admin":
        window.location.href = "/admin"
        break
      case "Storage Provider":
        window.location.href = "/provider"
        break
      case "Customer Portal":
        window.location.href = "/storefront"
        break
      default:
        console.log(`Selected role: ${role}`)
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
              variant="secondary" 
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              View Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent border-white/30 text-white hover:bg-white/10"
            >
              Learn More
            </Button>
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

      {/* Role Selection */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Role</h2>
            <p className="text-muted-foreground text-lg">
              Access the platform based on your role and permissions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <RoleCard
              title="Platform Admin"
              description="Super admin access to manage tenants, billing, and platform analytics"
              features={[
                "Manage all storage businesses",
                "Subscription billing & plans",
                "Platform-wide analytics",
                "Tenant impersonation",
                "System configuration"
              ]}
              icon={Building}
              buttonText="Admin Portal"
              onClick={() => handleRoleSelect("admin")}
            />

            <RoleCard
              title="Storage Provider"
              description="Manage your storage business with comprehensive tenant dashboard"
              features={[
                "Unit & customer management",
                "Lease tracking & billing",
                "Document management",
                "Revenue analytics",
                "Stripe Connect integration"
              ]}
              icon={Users}
              buttonText="Tenant Dashboard"
              onClick={() => handleRoleSelect("tenant")}
              variant="highlighted"
            />

            <RoleCard
              title="Customer Portal"
              description="Renters can view their unit details, billing, and documents"
              features={[
                "View unit details",
                "Access billing history",
                "Download lease documents",
                "Update payment methods",
                "Contact support"
              ]}
              icon={UserCheck}
              buttonText="Customer Login"
              onClick={() => handleRoleSelect("customer")}
            />
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