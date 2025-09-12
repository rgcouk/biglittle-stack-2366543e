import React from 'react';
import { QuickStatsWidget, RecentActivityWidget, OccupancyProgressWidget, QuickActionsWidget } from '@/components/provider/DashboardWidgets';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { EnhancedErrorBoundary } from '@/components/ui/error-boundary-enhanced';
import { NotificationCenter } from '@/components/provider/NotificationCenter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { ArrowRight, BarChart3, Users, CreditCard, TrendingUp, Building2, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProviderDashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const { unreadCount } = useNotificationSystem();
  
  // Enable real-time updates
  useRealtimeDashboard();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
          <p className="text-muted-foreground">Manage your storage facility operations</p>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
          <p className="text-muted-foreground">Manage your storage facility operations</p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Bell className="w-3 h-3" />
            {unreadCount} new notifications
          </Badge>
        )}
      </div>

      <div className="space-y-8">
        {/* Enhanced Stats Cards */}
        <EnhancedErrorBoundary>
          <QuickStatsWidget />
        </EnhancedErrorBoundary>

        {/* Main Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Occupancy Progress */}
          <div className="lg:col-span-2">
            <EnhancedErrorBoundary>
              <OccupancyProgressWidget />
            </EnhancedErrorBoundary>
          </div>
          
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <EnhancedErrorBoundary>
              <QuickActionsWidget />
            </EnhancedErrorBoundary>
          </div>

          {/* Recent Activity & Notifications */}
          <div className="lg:col-span-3 space-y-6">
            <EnhancedErrorBoundary>
              <RecentActivityWidget />
            </EnhancedErrorBoundary>
            <EnhancedErrorBoundary>
              <NotificationCenter />
            </EnhancedErrorBoundary>
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
                <div className="text-2xl font-bold mb-2">{stats?.totalUnits || 0}</div>
                <p className="text-xs text-muted-foreground mb-4">Total units</p>
                <Button asChild className="w-full">
                  <Link to="/provider/units">
                    Manage Units <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
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
                <div className="text-2xl font-bold mb-2">{stats?.activeCustomers || 0}</div>
                <p className="text-xs text-muted-foreground mb-4">Active customers</p>
                <Button asChild className="w-full">
                  <Link to="/provider/customers">
                    Manage Customers <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
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
                <div className="text-2xl font-bold mb-2">£{stats?.monthlyRevenue?.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground mb-4">Monthly revenue</p>
                <Button asChild className="w-full">
                  <Link to="/provider/billing">
                    View Billing <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
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
                <div className="text-2xl font-bold mb-2">{stats?.occupancyRate || 0}%</div>
                <p className="text-xs text-muted-foreground mb-4">Occupancy rate</p>
                <Button asChild className="w-full">
                  <Link to="/provider/analytics">
                    View Analytics <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
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
                  <Link to="/provider/customization">
                    Advanced Features <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}