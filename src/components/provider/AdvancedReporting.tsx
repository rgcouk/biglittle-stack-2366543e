import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  DollarSign, 
  Calendar,
  Download
} from 'lucide-react';

const revenueData = [
  { month: 'Jan', revenue: 45000, bookings: 120, occupancy: 85 },
  { month: 'Feb', revenue: 52000, bookings: 135, occupancy: 88 },
  { month: 'Mar', revenue: 48000, bookings: 128, occupancy: 82 },
  { month: 'Apr', revenue: 61000, bookings: 155, occupancy: 92 },
  { month: 'May', revenue: 58000, bookings: 148, occupancy: 89 },
  { month: 'Jun', revenue: 67000, bookings: 168, occupancy: 95 }
];

const unitTypeData = [
  { name: 'Small', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Medium', value: 45, color: 'hsl(var(--secondary))' },
  { name: 'Large', value: 20, color: 'hsl(var(--accent))' }
];

const customerRetentionData = [
  { month: 'Jan', retention: 92, churn: 8 },
  { month: 'Feb', retention: 94, churn: 6 },
  { month: 'Mar', retention: 91, churn: 9 },
  { month: 'Apr', retention: 96, churn: 4 },
  { month: 'May', retention: 93, churn: 7 },
  { month: 'Jun', retention: 95, churn: 5 }
];

export function AdvancedReporting() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedFacility, setSelectedFacility] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights and reporting for your facilities</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedFacility} onValueChange={setSelectedFacility}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select facility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Facilities</SelectItem>
              <SelectItem value="downtown">Downtown Storage</SelectItem>
              <SelectItem value="westside">Westside Facility</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.3%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
              +2.1% from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.2%</div>
            <Progress value={89.2} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Retention</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
              +1.2% from last quarter
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Booking Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.3 mo</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-orange-500" />
              -0.3 mo from last quarter
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy Trends</TabsTrigger>
          <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
          <TabsTrigger value="units">Unit Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Unit Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={unitTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {unitTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="occupancy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Rate Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="occupancy" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Retention & Churn</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={customerRetentionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="retention" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="churn" stroke="hsl(var(--destructive))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="units" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Unit Performance Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Small Units', 'Medium Units', 'Large Units'].map((unitType, index) => (
                    <div key={unitType} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{unitType}</p>
                        <p className="text-xs text-muted-foreground">
                          {index === 0 ? '120 units' : index === 1 ? '85 units' : '45 units'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={[85, 92, 78][index]} className="w-24" />
                        <Badge variant="secondary">{[85, 92, 78][index]}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}