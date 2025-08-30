import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  DollarSign, 
  Download, 
  Send, 
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Eye,
  MoreVertical,
  Loader2,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EnhancedTable } from '@/components/ui/enhanced-table';
import { formatCurrency } from '@/lib/currency';
import { useBillingData } from '@/hooks/useBillingData';
import { usePaymentStatusUpdate, useUpdatePaymentStatuses, useGenerateMonthlyPayments } from '@/hooks/usePaymentManagement';

interface Payment {
  id: string;
  customerName: string;
  customerEmail?: string;
  unitNumber: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'failed';
  paymentMethod?: string;
  invoiceNumber?: string;
}

export function BillingManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  
  const { data: billingData, isLoading, error } = useBillingData();
  const updatePaymentStatus = usePaymentStatusUpdate();
  const updateStatuses = useUpdatePaymentStatuses();
  const generateMonthlyPayments = useGenerateMonthlyPayments();

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusVariant = (status: Payment['status']) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'overdue': return 'destructive';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  // Transform real data into Payment format
  const payments: Payment[] = billingData?.recentPayments?.map(payment => ({
    id: payment.id,
    customerName: payment.customerName || 'Unknown Customer',
    customerEmail: undefined,
    unitNumber: payment.unitNumber || 'N/A',
    amount: Math.round((payment.amount_pence || 0)),
    dueDate: new Date(payment.created_at).toISOString().split('T')[0],
    paidDate: payment.payment_date ? new Date(payment.payment_date).toISOString().split('T')[0] : undefined,
    status: payment.status as Payment['status'],
    paymentMethod: payment.payment_method,
    invoiceNumber: `INV-${payment.id.slice(0, 8)}`
  })) || [];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.invoiceNumber && payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paymentColumns = [
    {
      key: 'customerName' as keyof Payment,
      label: 'Customer',
      render: (value: any, payment: Payment) => (
        <div className="space-y-1">
          <p className="font-medium">{payment.customerName}</p>
          <p className="text-sm text-muted-foreground">{payment.customerEmail}</p>
        </div>
      )
    },
    {
      key: 'unitNumber' as keyof Payment,
      label: 'Unit',
      render: (value: any, payment: Payment) => (
        <Badge variant="outline">{payment.unitNumber}</Badge>
      )
    },
    {
      key: 'amount' as keyof Payment,
      label: 'Amount',
      render: (value: any, payment: Payment) => (
        <span className="font-semibold">{formatCurrency(payment.amount)}</span>
      )
    },
    {
      key: 'dueDate' as keyof Payment,
      label: 'Due Date',
      render: (value: any, payment: Payment) => (
        <span>{new Date(payment.dueDate).toLocaleDateString()}</span>
      )
    },
    {
      key: 'status' as keyof Payment,
      label: 'Status',
      render: (value: any, payment: Payment) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(payment.status)}
          <Badge variant={getStatusVariant(payment.status)}>
            {payment.status}
          </Badge>
        </div>
      )
    },
    {
      key: 'id' as keyof Payment,
      label: 'Actions',
      render: (value: any, payment: Payment) => (
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
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Send className="h-4 w-4 mr-2" />
              Send Reminder
            </DropdownMenuItem>
            {payment.status !== 'paid' && (
              <DropdownMenuItem 
                onClick={() => updatePaymentStatus.mutate({ paymentId: payment.id, status: 'paid' })}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Paid
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  // Use real billing data for calculations
  const totalRevenue = Math.round((billingData?.totalRevenue || 0) * 100);
  const paidAmount = Math.round((billingData?.paidThisMonth || 0) * 100);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const overdueAmount = Math.round((billingData?.outstanding || 0) * 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Billing Data</h3>
        <p className="text-muted-foreground">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
          <p className="text-muted-foreground">Manage invoices, payments, and billing processes</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => updateStatuses.mutate()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Statuses
          </Button>
          <Button variant="outline" onClick={() => generateMonthlyPayments.mutate()}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Monthly Payments
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(paidAmount)}</div>
            <p className="text-xs text-muted-foreground">Paid invoices</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Records</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedTable
                data={filteredPayments}
                columns={paymentColumns}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Invoice Management</h3>
                <p className="text-muted-foreground mb-4">Create, send, and track invoices for your customers</p>
                <Button>Create New Invoice</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Subscription Management</h3>
                <p className="text-muted-foreground mb-4">Manage recurring payments and subscription billing</p>
                <Button>Set Up Recurring Billing</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Payment Terms</Label>
                  <Select defaultValue="net30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Due Immediately</SelectItem>
                      <SelectItem value="net7">Net 7 days</SelectItem>
                      <SelectItem value="net15">Net 15 days</SelectItem>
                      <SelectItem value="net30">Net 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Late Fee Percentage</Label>
                  <Input type="number" placeholder="5" />
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold">Payment Methods</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Stripe</p>
                        <p className="text-sm text-muted-foreground">Credit & debit cards</p>
                      </div>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}