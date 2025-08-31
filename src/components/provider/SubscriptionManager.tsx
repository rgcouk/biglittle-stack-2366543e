import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Play,
  Pause,
  Settings,
  CreditCard,
  Clock
} from 'lucide-react';
import { EnhancedTable } from '@/components/ui/enhanced-table';
import { formatCurrency } from '@/lib/currency';
import { useBillingData } from '@/hooks/useBillingData';

interface Subscription {
  id: string;
  customerName: string;
  customerEmail: string;
  unitNumber: string;
  plan: string;
  amount: number;
  billingCycle: 'monthly' | 'quarterly' | 'annually';
  status: 'active' | 'paused' | 'cancelled';
  nextBilling: string;
  startDate: string;
}

export function SubscriptionManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [autoCollectionEnabled, setAutoCollectionEnabled] = useState(true);
  
  const { data: billingData } = useBillingData();

  // Generate subscriptions from active bookings
  const subscriptions: Subscription[] = billingData?.recentPayments?.filter(payment => 
    payment.status === 'paid' || payment.status === 'pending'
  ).map(payment => ({
    id: payment.id,
    customerName: payment.customerName || 'Unknown Customer',
    customerEmail: 'customer@example.com',
    unitNumber: payment.unitNumber || 'N/A',
    plan: 'Storage Unit Rental',
    amount: Math.round((payment.amount_pence || 0)),
    billingCycle: 'monthly' as const,
    status: payment.status === 'paid' ? 'active' as const : 'active' as const,
    nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startDate: new Date(payment.created_at).toISOString().split('T')[0]
  })) || [];

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.unitNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: Subscription['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const subscriptionColumns = [
    {
      key: 'customerName' as keyof Subscription,
      label: 'Customer',
      render: (value: any, subscription: Subscription) => (
        <div className="space-y-1">
          <p className="font-medium">{subscription.customerName}</p>
          <p className="text-sm text-muted-foreground">{subscription.customerEmail}</p>
        </div>
      )
    },
    {
      key: 'unitNumber' as keyof Subscription,
      label: 'Unit',
      render: (value: any, subscription: Subscription) => (
        <Badge variant="outline">{subscription.unitNumber}</Badge>
      )
    },
    {
      key: 'plan' as keyof Subscription,
      label: 'Plan',
      render: (value: any, subscription: Subscription) => (
        <span className="text-sm">{subscription.plan}</span>
      )
    },
    {
      key: 'amount' as keyof Subscription,
      label: 'Amount',
      render: (value: any, subscription: Subscription) => (
        <div className="space-y-1">
          <span className="font-semibold">{formatCurrency(subscription.amount)}</span>
          <p className="text-xs text-muted-foreground">/{subscription.billingCycle}</p>
        </div>
      )
    },
    {
      key: 'nextBilling' as keyof Subscription,
      label: 'Next Billing',
      render: (value: any, subscription: Subscription) => (
        <span className="text-sm">{new Date(subscription.nextBilling).toLocaleDateString()}</span>
      )
    },
    {
      key: 'status' as keyof Subscription,
      label: 'Status',
      render: (value: any, subscription: Subscription) => (
        <Badge variant={getStatusVariant(subscription.status)}>
          {subscription.status}
        </Badge>
      )
    },
    {
      key: 'id' as keyof Subscription,
      label: 'Actions',
      render: (value: any, subscription: Subscription) => (
        <div className="flex items-center gap-2">
          {subscription.status === 'active' ? (
            <Button variant="outline" size="sm">
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          ) : (
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-1" />
              Resume
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const pausedCount = subscriptions.filter(s => s.status === 'paused').length;
  const monthlyRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscription Management</h2>
          <p className="text-muted-foreground">Manage recurring billing and subscriptions</p>
        </div>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Billing Settings
        </Button>
      </div>

      {/* Subscription Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Recurring monthly</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <Pause className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pausedCount}</div>
            <p className="text-xs text-muted-foreground">Temporarily suspended</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">Recurring income</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Due next month</p>
          </CardContent>
        </Card>
      </div>

      {/* Billing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Automation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Automatic Payment Collection</Label>
              <p className="text-sm text-muted-foreground">
                Automatically charge customers on their billing date
              </p>
            </div>
            <Switch 
              checked={autoCollectionEnabled}
              onCheckedChange={setAutoCollectionEnabled}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Payment Retry Attempts</Label>
              <Select defaultValue="3">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 attempt</SelectItem>
                  <SelectItem value="3">3 attempts</SelectItem>
                  <SelectItem value="5">5 attempts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Grace Period</Label>
              <Select defaultValue="7">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <EnhancedTable
            data={filteredSubscriptions}
            columns={subscriptionColumns}
          />
        </CardContent>
      </Card>
    </div>
  );
}