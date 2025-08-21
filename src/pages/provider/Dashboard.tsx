import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Users, DollarSign, BarChart3, Settings, Home } from "lucide-react"
import { Link } from "react-router-dom"

export default function ProviderDashboard() {
  const stats = [
    { title: "Total Units", value: "48", icon: Building2, change: "+2 this month", changeType: "positive" },
    { title: "Active Customers", value: "36", icon: Users, change: "+5 this week", changeType: "positive" },
    { title: "Monthly Revenue", value: "£8,950", icon: DollarSign, change: "+15% from last month", changeType: "positive" },
    { title: "Occupancy Rate", value: "75%", icon: BarChart3, change: "+3% this month", changeType: "positive" },
  ]

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Clean Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                <Home className="h-5 w-5" />
                <span className="text-sm font-medium">← Back to Home</span>
              </Link>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold">Provider Dashboard</h1>
                <p className="text-muted-foreground">Manage your storage business</p>
              </div>
            </div>
            <Button variant="gradient" size="lg" asChild>
              <Link to="/storefront">View Storefront</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Stats Overview */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300 border-0">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <p className="text-sm text-primary font-medium">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 border-0 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Units Management</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Manage your storage units, pricing, and availability
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full" size="lg">
                  <Link to="/provider/units">Manage Units</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 border-0 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Customers</CardTitle>
                </div>
                <CardDescription className="text-base">
                  View and manage your customers and their accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full" size="lg">
                  <Link to="/provider/customers">Manage Customers</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 border-0 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Billing & Payments</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Handle invoicing, payments, and financial reports
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full" size="lg">
                  <Link to="/provider/billing">Manage Billing</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 border-0 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Analytics</CardTitle>
                </div>
                <CardDescription className="text-base">
                  View detailed analytics and generate reports
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full" size="lg">
                  <Link to="/provider/analytics">View Analytics</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 border-0 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Site Customization</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Customize your customer-facing storefront
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full" size="lg">
                  <Link to="/provider/customize">Customize Site</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}