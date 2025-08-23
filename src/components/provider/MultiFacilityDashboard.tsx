import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  MapPin,
  Plus,
  Settings,
  Eye,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FacilityCardProps {
  facility: {
    id: string;
    name: string;
    location: string;
    totalUnits: number;
    occupiedUnits: number;
    monthlyRevenue: number;
    occupancyRate: number;
    status: 'active' | 'maintenance' | 'inactive';
  };
}

function FacilityCard({ facility }: FacilityCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'maintenance': return 'bg-orange-500';
      case 'inactive': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">{facility.name}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            {facility.location}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${getStatusColor(facility.status)}`} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Occupancy</p>
            <p className="text-lg font-bold">{facility.occupancyRate}%</p>
            <Progress value={facility.occupancyRate} className="mt-1" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monthly Revenue</p>
            <p className="text-lg font-bold">£{(facility.monthlyRevenue / 100).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {facility.occupiedUnits}/{facility.totalUnits} units occupied
          </span>
          <Badge variant={facility.occupancyRate > 90 ? "default" : "secondary"}>
            {facility.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function MultiFacilityDashboard() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Mock data for facilities
  const facilities = [
    {
      id: '1',
      name: 'Downtown Storage',
      location: 'City Centre, London',
      totalUnits: 250,
      occupiedUnits: 225,
      monthlyRevenue: 75000,
      occupancyRate: 90,
      status: 'active' as const
    },
    {
      id: '2',
      name: 'Westside Facility',
      location: 'West London',
      totalUnits: 180,
      occupiedUnits: 162,
      monthlyRevenue: 54000,
      occupancyRate: 90,
      status: 'active' as const
    },
    {
      id: '3',
      name: 'Industrial Park Storage',
      location: 'East London',
      totalUnits: 320,
      occupiedUnits: 280,
      monthlyRevenue: 96000,
      occupancyRate: 87.5,
      status: 'maintenance' as const
    }
  ];

  const totalStats = {
    totalFacilities: facilities.length,
    totalUnits: facilities.reduce((sum, f) => sum + f.totalUnits, 0),
    totalOccupied: facilities.reduce((sum, f) => sum + f.occupiedUnits, 0),
    totalRevenue: facilities.reduce((sum, f) => sum + f.monthlyRevenue, 0),
  };

  const overallOccupancy = (totalStats.totalOccupied / totalStats.totalUnits) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multi-Facility Overview</h1>
          <p className="text-muted-foreground">Manage all your storage facilities from one place</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={(value: 'grid' | 'list') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid View</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Facility
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalFacilities}</div>
            <p className="text-xs text-muted-foreground">Active locations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              {totalStats.totalOccupied} occupied
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Occupancy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallOccupancy.toFixed(1)}%</div>
            <Progress value={overallOccupancy} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{(totalStats.totalRevenue / 100).toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
              +8.2% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {facilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facility Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {facilities.map((facility) => (
                  <div key={facility.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{facility.name}</p>
                      <p className="text-xs text-muted-foreground">
                        £{(facility.monthlyRevenue / 100).toLocaleString()} monthly
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={facility.occupancyRate} className="w-24" />
                      <Badge variant="secondary">{facility.occupancyRate}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facility Alerts & Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-2 w-2 bg-orange-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Industrial Park Storage - Maintenance Required</p>
                    <p className="text-xs text-muted-foreground">HVAC system needs attention in Block C</p>
                  </div>
                  <Badge variant="outline">Medium</Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Downtown Storage - High Occupancy</p>
                    <p className="text-xs text-muted-foreground">Facility at 90% capacity, consider waitlist</p>
                  </div>
                  <Badge variant="outline">Low</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}