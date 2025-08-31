import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Send, 
  Search,
  Plus,
  Eye,
  MoreVertical,
  Calendar,
  DollarSign
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

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

export function InvoiceManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: billingData } = useBillingData();

  // Generate mock invoices from payments data
  const invoices: Invoice[] = billingData?.recentPayments?.map(payment => ({
    id: payment.id,
    invoiceNumber: `INV-${payment.id.slice(0, 8).toUpperCase()}`,
    customerName: payment.customerName || 'Unknown Customer',
    customerEmail: 'customer@example.com',
    amount: Math.round((payment.amount_pence || 0)),
    issueDate: new Date(payment.created_at).toISOString().split('T')[0],
    dueDate: payment.payment_date ? new Date(payment.payment_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: payment.status === 'paid' ? 'paid' : payment.status === 'pending' ? 'sent' : 'overdue',
    items: [{
      description: `Storage Unit ${payment.unitNumber || 'N/A'}`,
      quantity: 1,
      rate: Math.round((payment.amount_pence || 0)),
      amount: Math.round((payment.amount_pence || 0))
    }]
  })) || [];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'default';
      case 'sent': return 'secondary';
      case 'draft': return 'outline';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  const invoiceColumns = [
    {
      key: 'invoiceNumber' as keyof Invoice,
      label: 'Invoice #',
      render: (value: any, invoice: Invoice) => (
        <div className="font-mono text-sm">{invoice.invoiceNumber}</div>
      )
    },
    {
      key: 'customerName' as keyof Invoice,
      label: 'Customer',
      render: (value: any, invoice: Invoice) => (
        <div className="space-y-1">
          <p className="font-medium">{invoice.customerName}</p>
          <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
        </div>
      )
    },
    {
      key: 'amount' as keyof Invoice,
      label: 'Amount',
      render: (value: any, invoice: Invoice) => (
        <span className="font-semibold">{formatCurrency(invoice.amount)}</span>
      )
    },
    {
      key: 'issueDate' as keyof Invoice,
      label: 'Issue Date',
      render: (value: any, invoice: Invoice) => (
        <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
      )
    },
    {
      key: 'dueDate' as keyof Invoice,
      label: 'Due Date',
      render: (value: any, invoice: Invoice) => (
        <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
      )
    },
    {
      key: 'status' as keyof Invoice,
      label: 'Status',
      render: (value: any, invoice: Invoice) => (
        <Badge variant={getStatusVariant(invoice.status)}>
          {invoice.status}
        </Badge>
      )
    },
    {
      key: 'id' as keyof Invoice,
      label: 'Actions',
      render: (value: any, invoice: Invoice) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              View Invoice
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Send className="h-4 w-4 mr-2" />
              Send to Customer
            </DropdownMenuItem>
            {invoice.status === 'draft' && (
              <DropdownMenuItem>
                <Send className="h-4 w-4 mr-2" />
                Mark as Sent
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const totalDrafts = invoices.filter(i => i.status === 'draft').length;
  const totalSent = invoices.filter(i => i.status === 'sent').length;
  const totalPaid = invoices.filter(i => i.status === 'paid').length;
  const totalOverdue = invoices.filter(i => i.status === 'overdue').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invoice Management</h2>
          <p className="text-muted-foreground">Create, send, and track invoices</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Invoice Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDrafts}</div>
            <p className="text-xs text-muted-foreground">Pending completion</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Send className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalSent}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{totalPaid}</div>
            <p className="text-xs text-muted-foreground">Successfully paid</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalOverdue}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedTable
            data={filteredInvoices}
            columns={invoiceColumns}
          />
        </CardContent>
      </Card>
    </div>
  );
}