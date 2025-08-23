import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Users, DollarSign, BarChart3, TrendingUp, MapPin, Phone, Mail, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMultiFacilityDashboard, useFacilityPerformance } from "@/hooks/useMultiFacility";
import { formatCurrency } from "@/lib/currency";

export function MultiFacilityDashboard() {
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const { data: facilities = [], isLoading } = useMultiFacilityDashboard();
  const { data: performanceData } = useFacilityPerformance(selectedFacility || undefined);

  // Calculate overall totals
  const overallStats = facilities.reduce((totals, facility) => ({
    totalUnits: totals.totalUnits + (facility.stats?.totalUnits || 0),
    occupiedUnits: totals.occupiedUnits + (facility.stats?.occupiedUnits || 0),
    monthlyRevenue: totals.monthlyRevenue + (facility.stats?.monthlyRevenue || 0),
    activeCustomers: totals.activeCustomers + (facility.stats?.activeCustomers || 0),
  }), { totalUnits: 0, occupiedUnits: 0, monthlyRevenue: 0, activeCustomers: 0 });

  const overallOccupancyRate = overallStats.totalUnits > 0 
    ? Math.round((overallStats.occupiedUnits / overallStats.totalUnits) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading multi-facility dashboard...</span>
      </div>
    );
  }

  if (facilities.length <= 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multi-Facility Management</CardTitle>
          <CardDescription>
            You need multiple facilities to access advanced multi-facility features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Add New Facility</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Portfolio Overview ({facilities.length} Facilities)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{overallStats.totalUnits}</div>
              <p className="text-sm text-muted-foreground">Total Units</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{overallOccupancyRate}%</div>
              <p className="text-sm text-muted-foreground">Avg Occupancy</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatCurrency(overallStats.monthlyRevenue)}</div>
              <p className="text-sm text-muted-foreground">Total Revenue/mo</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{overallStats.activeCustomers}</div>
              <p className="text-sm text-muted-foreground">Active Customers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="facilities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="facilities">Facility Performance</TabsTrigger>
          <TabsTrigger value="comparison">Comparative Analysis</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="facilities" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {facilities.map((facility) => (
              <Card key={facility.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{facility.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {facility.address}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      (facility.stats?.occupancyRate || 0) >= 80 ? "default" :
                      (facility.stats?.occupancyRate || 0) >= 60 ? "secondary" : "outline"
                    }>
                      {facility.stats?.occupancyRate || 0}% Occupied
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{facility.stats?.totalUnits || 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Total Units</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{facility.stats?.activeCustomers || 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Customers</p>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-xl font-bold text-primary">
                      {formatCurrency(facility.stats?.monthlyRevenue || 0)}/mo
                    </div>
                    <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-green-600">
                        {facility.stats?.availableUnits || 0}
                      </div>
                      <div className="text-muted-foreground">Available</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-blue-600">
                        {facility.stats?.occupiedUnits || 0}
                      </div>
                      <div className="text-muted-foreground">Occupied</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-yellow-600">
                        {facility.stats?.maintenanceUnits || 0}
                      </div>
                      <div className="text-muted-foreground">Maintenance</div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedFacility(facility.id)}
                    >
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facility Comparison</CardTitle>
              <CardDescription>Compare key metrics across all facilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={facilities.map(f => ({ 
                    name: f.name.substring(0, 15) + (f.name.length > 15 ? '...' : ''),
                    revenue: f.stats?.monthlyRevenue || 0,
                    occupancy: f.stats?.occupancyRate || 0,
                    customers: f.stats?.activeCustomers || 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'revenue') return [formatCurrency(value as number), 'Monthly Revenue'];
                        if (name === 'occupancy') return [`${value}%`, 'Occupancy Rate'];
                        return [value, name];
                      }}
                    />
                    <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="revenue" />
                    <Bar yAxisId="right" dataKey="occupancy" fill="#22c55e" name="occupancy" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <span>Select a facility to view detailed performance trends</span>
                  <Select value={selectedFacility || ""} onValueChange={setSelectedFacility}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Choose facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map((facility) => (
                        <SelectItem key={facility.id} value={facility.id}>
                          {facility.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedFacility && performanceData ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                      <Bar dataKey="revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Select a facility to view performance trends
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}