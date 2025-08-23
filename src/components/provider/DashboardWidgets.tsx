import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building, 
  CreditCard, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Plus,
  Settings
} from 'lucide-react';
import { AnimatedCounter, AnimatedCurrency, AnimatedPercentage } from '@/components/ui/animated-counter';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRecentActivity } from '@/hooks/useAuditLog';
import { Link } from 'react-router-dom';

export function QuickStatsWidget() {
  const { data: stats, isLoading } = useDashboardStats();

  const statsCards = [
    {
      title: 'Total Units',
      value: stats?.totalUnits || 0,
      icon: Building,
      change: { value: 12, label: '+12% from last month', trend: 'up' as const }
    },
    {
      title: 'Active Customers',
      value: stats?.activeCustomers || 0,
      icon: Users,
      change: { value: 8, label: '+8% from last month', trend: 'up' as const }
    },
    {
      title: 'Monthly Revenue',
      value: stats?.monthlyRevenue || 0,
      icon: CreditCard,
      change: { value: 15, label: '+15% from last month', trend: 'up' as const },
      isRevenue: true
    },
    {
      title: 'Occupancy Rate',
      value: stats?.occupancyRate || 0,
      icon: TrendingUp,
      change: { value: 5, label: '+5% from last month', trend: 'up' as const },
      isPercentage: true
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((card, index) => (
        <Card key={card.title} className="transition-all duration-500 hover:shadow-lg animate-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className="p-1 rounded-md bg-primary/10">
              <card.icon className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {isLoading ? (
                <div className="h-7 bg-muted animate-pulse rounded w-16"></div>
              ) : card.isRevenue ? (
                <AnimatedCurrency value={card.value} />
              ) : card.isPercentage ? (
                <AnimatedPercentage value={card.value} />
              ) : (
                <AnimatedCounter value={card.value} />
              )}
            </div>
            {card.change && !isLoading && (
              <Badge 
                variant="secondary" 
                className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                {card.change.label}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RecentActivityWidget() {
  const { activities, isLoading } = useRecentActivity(5);

  const getActivityIcon = (action: string) => {
    if (action.includes('create')) return <Plus className="h-3 w-3 text-green-500" />;
    if (action.includes('update')) return <Settings className="h-3 w-3 text-blue-500" />;
    if (action.includes('delete')) return <AlertCircle className="h-3 w-3 text-red-500" />;
    return <Clock className="h-3 w-3 text-gray-500" />;
  };

  const formatActionName = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div 
                key={activity.id} 
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors animate-in slide-in-from-right-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-1 rounded-full bg-muted">
                  {getActivityIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {formatActionName(activity.action)} - {activity.resource_type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function OccupancyProgressWidget() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const occupancyRate = stats?.occupancyRate || 0;
  const totalUnits = stats?.totalUnits || 0;
  const occupiedUnits = stats?.occupiedUnits || 0;
  const availableUnits = stats?.availableUnits || 0;

  return (
    <Card className="animate-in slide-in-from-left-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Unit Occupancy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Occupancy Rate</span>
            <span className="font-medium">
              <AnimatedPercentage value={occupancyRate} />
            </span>
          </div>
          <Progress 
            value={occupancyRate} 
            className="h-3 transition-all duration-1000"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              <AnimatedCounter value={occupiedUnits} />
            </div>
            <div className="text-xs text-muted-foreground">Occupied</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              <AnimatedCounter value={availableUnits} />
            </div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickActionsWidget() {
  const actions = [
    { name: 'Add Unit', icon: Plus, href: '/provider/units' },
    { name: 'View Reports', icon: TrendingUp, href: '/provider/analytics' },
    { name: 'Manage Customers', icon: Users, href: '/provider/customers' },
    { name: 'Settings', icon: Settings, href: '/provider/customization' }
  ];

  return (
    <Card className="animate-in slide-in-from-right-4">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={action.name}
              variant="outline"
              className="h-auto p-4 flex-col space-y-2 hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
              asChild
            >
              <Link to={action.href}>
                <action.icon className="h-5 w-5" />
                <span className="text-xs">{action.name}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}