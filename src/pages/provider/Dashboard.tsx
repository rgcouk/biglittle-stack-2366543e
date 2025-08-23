import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Building2, Users, CreditCard, TrendingUp, Loader2, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { QuickStatsWidget, RecentActivityWidget, OccupancyProgressWidget, QuickActionsWidget } from '@/components/provider/DashboardWidgets';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export default function ProviderDashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-primary">
                <Home className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
              <Button variant="outline" asChild>
                <Link to="/facility">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Storefront
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
            <p className="text-muted-foreground">Manage your storage facility operations</p>
          </div>
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-primary">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <Button variant="outline" asChild>
              <Link to="/facility">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Storefront
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
          <p className="text-muted-foreground">Manage your storage facility operations</p>
        </div>

        <div className="space-y-8">
          {/* Enhanced Stats Cards */}
          <QuickStatsWidget />

          {/* Main Dashboard Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            {/* Occupancy Progress */}
            <div className="lg:col-span-2">
              <OccupancyProgressWidget />
            </div>
            
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <QuickActionsWidget />
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-3">
              <RecentActivityWidget />
            </div>
          </div>

          {/* Enhanced Quick Actions Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Management Areas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Units Management</CardTitle>
                  </div>
                  <CardDescription>
                    Manage storage units, pricing, and availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/provider/units">Manage Units</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Customer Management</CardTitle>
                  </div>
                  <CardDescription>
                    View and manage customers and bookings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/provider/customers">Manage Customers</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Billing & Analytics</CardTitle>
                  </div>
                  <CardDescription>
                    Financial management and business insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/provider/billing">View Billing</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Analytics & Reports</CardTitle>
                  </div>
                  <CardDescription>
                    Detailed analytics and performance reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/provider/analytics">View Analytics</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Advanced Hub</CardTitle>
                  </div>
                  <CardDescription>
                    Integrations, notifications, and advanced features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/provider/customization">Advanced Features</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}