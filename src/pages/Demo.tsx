import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HeroSection } from "@/components/ui/hero-section"
import { StatCard } from "@/components/ui/stat-card"
import { 
  Building2, 
  Users, 
  DollarSign, 
  BarChart3, 
  ArrowRight, 
  Home,
  Store,
  UserCheck,
  Settings,
  Calendar,
  CreditCard,
  Package
} from "lucide-react"
import { Link } from "react-router-dom"
import { formatCurrency, formatCurrencyMonthly } from "@/lib/currency"

export default function Demo() {
  const providerStats = [
    { title: "Total Units", value: "48", icon: Building2, change: "+2 this month", changeType: "positive" as const },
    { title: "Active Customers", value: "36", icon: Users, change: "+5 this week", changeType: "positive" as const },
    { title: "Monthly Revenue", value: formatCurrency(8950), icon: DollarSign, change: "+15% from last month", changeType: "positive" as const },
    { title: "Occupancy Rate", value: "75%", icon: BarChart3, change: "+3% this month", changeType: "positive" as const },
  ]

  const unitTypes = [
    { size: "5x5", price: 32, description: "Perfect for seasonal items and small furniture", available: 8 },
    { size: "5x10", price: 48, description: "Ideal for studio flat or office contents", available: 12 },
    { size: "10x10", price: 68, description: "Great for 1-2 bedroom home contents", available: 6 },
    { size: "10x15", price: 85, description: "Suitable for 2-3 bedroom home contents", available: 4 },
    { size: "10x20", price: 125, description: "Perfect for 3-4 bedroom home or vehicle storage", available: 3 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-80 transition-opacity">
                <Home className="h-5 w-5" />
                <span className="text-sm text-muted-foreground">Back to Home</span>
              </Link>
              <div className="w-px h-6 bg-border" />
              <h1 className="text-2xl font-bold">BigLittleBox Demo</h1>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Demo Mode
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection>
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-5xl font-bold tracking-tight">
            Explore BigLittleBox
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Experience our complete storage management platform through interactive demos showcasing both provider and customer interfaces.
          </p>
        </div>
      </HeroSection>

      {/* Demo Options */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Demo Experience</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore different perspectives of the BigLittleBox platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Storage Provider Demo */}
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 ring-2 ring-primary shadow-glow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                  <Store className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Storage Provider Dashboard</CardTitle>
                <CardDescription className="text-base">
                  See how storage facility owners manage their business with comprehensive tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mock Provider Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {providerStats.map((stat, index) => (
                    <StatCard
                      key={index}
                      title={stat.title}
                      value={stat.value}
                      change={stat.change}
                      changeType={stat.changeType}
                      icon={stat.icon}
                    />
                  ))}
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Demo Features:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                      Comprehensive unit management
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                      Customer relationship tools
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                      Billing & payment processing
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                      Analytics & reporting
                    </li>
                  </ul>
                </div>

                <Button asChild className="w-full bg-gradient-primary hover:opacity-90 transition-opacity" size="lg">
                  <Link to="/provider">
                    Explore Provider Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Customer Experience Demo */}
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                  <UserCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Customer Experience</CardTitle>
                <CardDescription className="text-base">
                  Experience the customer journey from browsing to booking storage units
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sample Units */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Available Units:</h4>
                  <div className="space-y-2">
                    {unitTypes.slice(0, 3).map((unit, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="font-medium">{unit.size}</span>
                        <div className="text-right">
                          <div className="font-bold text-primary">{formatCurrencyMonthly(unit.price)}</div>
                          <div className="text-xs text-muted-foreground">{unit.available} available</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Demo Features:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                      Browse available storage units
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                      Interactive booking flow
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                      Customer account portal
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                      Mobile-responsive design
                    </li>
                  </ul>
                </div>

                <Button asChild className="w-full" variant="outline" size="lg">
                  <Link to="/storefront">
                    Explore Customer Experience
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Demo Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer">
              <CardContent className="p-4 text-center">
                <Settings className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Unit Management</p>
                <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
                  <Link to="/provider/units">View Demo</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer">
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Booking Flow</p>
                <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
                  <Link to="/storefront/demo-storage/units">View Demo</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer">
              <CardContent className="p-4 text-center">
                <CreditCard className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Billing System</p>
                <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
                  <Link to="/provider/billing">View Demo</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer">
              <CardContent className="p-4 text-center">
                <Package className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Customer Portal</p>
                <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
                  <Link to="/account">View Demo</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">UK Storage Market Ready</h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Designed specifically for the UK self-storage market with local pricing, regulations, and customer expectations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold">GBP Pricing</h4>
              <p className="text-muted-foreground">
                All pricing in British Pounds with competitive UK market rates from £32-£125/month
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold">UK Regulations</h4>
              <p className="text-muted-foreground">
                Compliant with UK consumer protection laws and self-storage industry standards
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold">Local Experience</h4>
              <p className="text-muted-foreground">
                UK addresses, phone formats, and business practices built into every feature
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}