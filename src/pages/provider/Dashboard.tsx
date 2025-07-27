import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Users, DollarSign, BarChart3, Settings, Home } from "lucide-react"
import { Link } from "react-router-dom"

export default function ProviderDashboard() {
  const stats = [
    { title: "Total Units", value: "48", icon: Building2, change: "+2 this month" },
    { title: "Active Customers", value: "36", icon: Users, change: "+5 this week" },
    { title: "Monthly Revenue", value: "£8,950", icon: DollarSign, change: "+15% from last month" },
    { title: "Occupancy Rate", value: "75%", icon: BarChart3, change: "+3% this month" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-primary">
                <Home className="h-5 w-5" />
                <span className="text-sm text-muted-foreground">Back to Home</span>
              </Link>
              <div className="w-px h-6 bg-border" />
              <h1 className="text-2xl font-bold">Storage Provider Dashboard</h1>
            </div>
            <Button asChild>
              <Link to="/storefront">View My Storefront</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-card hover:shadow-elevated transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span>Units Management</span>
              </CardTitle>
              <CardDescription>
                Manage your storage units, pricing, and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/provider/units">Manage Units</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Customer Management</span>
              </CardTitle>
              <CardDescription>
                View and manage your customers and their accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/provider/customers">Manage Customers</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span>Billing & Payments</span>
              </CardTitle>
              <CardDescription>
                Handle invoicing, payments, and financial reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/provider/billing">Manage Billing</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Analytics & Reports</span>
              </CardTitle>
              <CardDescription>
                View detailed analytics and generate reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/provider/analytics">View Analytics</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <span>Site Customization</span>
              </CardTitle>
              <CardDescription>
                Customize your customer-facing storefront
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/provider/customize">Customize Site</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}