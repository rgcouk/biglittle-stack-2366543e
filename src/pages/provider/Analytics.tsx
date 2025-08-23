import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowLeft, TrendingUp, Users, DollarSign, Building, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { formatCurrency } from "@/lib/currency";

export default function ProviderAnalytics() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: analytics, isLoading: analyticsLoading } = useAnalyticsData();

  const metrics = [
    { 
      title: "Occupancy Rate", 
      value: `${stats?.occupancyRate || 0}%`, 
      change: `${stats?.occupiedUnits || 0} of ${stats?.totalUnits || 0} units`, 
      icon: Building 
    },
    { 
      title: "Monthly Revenue", 
      value: formatCurrency(stats?.monthlyRevenue || 0), 
      change: "Current active bookings", 
      icon: DollarSign 
    },
    { 
      title: "Active Customers", 
      value: stats?.activeCustomers?.toString() || "0", 
      change: "With current bookings", 
      icon: Users 
    },
    { 
      title: "Available Units", 
      value: stats?.availableUnits?.toString() || "0", 
      change: "Ready for booking", 
      icon: TrendingUp 
    },
  ];

  // Sample data for charts (replace with real data later)
  const revenueData = [
    { month: 'Jan', revenue: 4800 },
    { month: 'Feb', revenue: 5200 },
    { month: 'Mar', revenue: 5800 },
    { month: 'Apr', revenue: 6200 },
    { month: 'May', revenue: 6800 },
    { month: 'Jun', revenue: 7200 },
  ];

  const occupancyData = [
    { category: 'Small', occupied: 8, available: 2 },
    { category: 'Medium', occupied: 12, available: 4 },
    { category: 'Large', occupied: 6, available: 3 },
    { category: 'Extra Large', occupied: 4, available: 1 },
  ];

  const unitStatusData = [
    { name: 'Available', value: stats?.availableUnits || 0, color: '#22c55e' },
    { name: 'Occupied', value: stats?.occupiedUnits || 0, color: '#3b82f6' },
    { name: 'Maintenance', value: 2, color: '#f59e0b' },
  ];

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/provider" className="flex items-center space-x-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl font-bold">Analytics & Reports</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">{metric.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unit Status Distribution</CardTitle>
              <CardDescription>Current status of all units</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={unitStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {unitStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Occupancy by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Occupancy by Unit Category</CardTitle>
            <CardDescription>Occupied vs available units by size category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="occupied" fill="#3b82f6" name="Occupied" />
                  <Bar dataKey="available" fill="#22c55e" name="Available" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}