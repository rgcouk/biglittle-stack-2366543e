import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Calendar, 
  CreditCard, 
  FileText, 
  Settings,
  Bell,
  Download,
  Phone,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle,
  Package,
  Key
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

interface CustomerDashboardProps {
  customerData?: {
    name: string;
    email: string;
    phone: string;
    bookings: Array<{
      id: string;
      unit_number: string;
      facility_name: string;
      start_date: string;
      monthly_rate: number;
      status: string;
      next_payment: string;
    }>;
    payments: Array<{
      id: string;
      amount: number;
      date: string;
      status: string;
      description: string;
    }>;
  };
}

export function CustomerDashboard({ customerData }: CustomerDashboardProps) {
  const { toast } = useToast();

  // Mock data if none provided
  const defaultData = {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+44 7700 900123',
    bookings: [
      {
        id: '1',
        unit_number: 'A-101',
        facility_name: 'SecureStore Downtown',
        start_date: '2024-01-15',
        monthly_rate: 15000, // £150 in pence
        status: 'active',
        next_payment: '2024-02-15'
      }
    ],
    payments: [
      {
        id: '1',
        amount: 15000,
        date: '2024-01-15',
        status: 'paid',
        description: 'Monthly rent - Unit A-101'
      }
    ]
  };

  const data = customerData || defaultData;
  const activeBooking = data.bookings[0]; // Assuming one active booking for now

  const handleDownloadContract = () => {
    toast({
      title: "Download Started",
      description: "Your rental contract is being downloaded.",
    });
  };

  const handleContactSupport = () => {
    toast({
      title: "Contact Support",
      description: "We'll get back to you within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Storage Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {data.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Booking */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Your Storage Unit</h2>
              {activeBooking ? (
                <Card className="border-primary/20 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        Unit {activeBooking.unit_number}
                      </CardTitle>
                      <Badge 
                        variant={activeBooking.status === 'active' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {activeBooking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Facility</p>
                        <p className="font-medium">{activeBooking.facility_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Monthly Rate</p>
                        <p className="font-medium text-lg">{formatCurrency(activeBooking.monthly_rate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Next Payment</p>
                        <p className="font-medium">{new Date(activeBooking.next_payment).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button>
                        <Key className="h-4 w-4 mr-2" />
                        Access Unit
                      </Button>
                      <Button variant="outline">
                        <Package className="h-4 w-4 mr-2" />
                        Book Move Service
                      </Button>
                      <Button variant="outline" onClick={handleDownloadContract}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Contract
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Active Bookings</h3>
                    <p className="text-muted-foreground mb-6">
                      You don't have any active storage units. Browse available units to get started.
                    </p>
                    <Button>Browse Storage Units</Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent Payments */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Payment History</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {data.payments.map((payment, index) => (
                      <div 
                        key={payment.id}
                        className={`p-6 border-b last:border-b-0 ${index % 2 === 0 ? 'bg-muted/20' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {payment.status === 'paid' ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-amber-500" />
                            )}
                            <div>
                              <p className="font-medium">{payment.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(payment.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(payment.amount)}</p>
                            <Badge 
                              variant={payment.status === 'paid' ? 'default' : 'destructive'}
                              className="capitalize text-xs"
                            >
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <CreditCard className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">Make Payment</h3>
                    <p className="text-sm text-muted-foreground">Pay your monthly rent</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">Schedule Visit</h3>
                    <p className="text-sm text-muted-foreground">Book facility access</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">View Documents</h3>
                    <p className="text-sm text-muted-foreground">Access contracts & receipts</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-medium">{data.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{data.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium">{data.phone}</p>
                </div>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Our support team is here to help with any questions or issues.
                </p>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" onClick={handleContactSupport}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Us
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3" />
                    Support Hours
                  </div>
                  <p>Mon-Fri: 9AM-6PM</p>
                  <p>Sat-Sun: 10AM-4PM</p>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Bell className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Payment Reminder</p>
                      <p className="text-xs text-muted-foreground">
                        Your next payment is due in 3 days
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Payment Received</p>
                      <p className="text-xs text-muted-foreground">
                        Thank you for your recent payment
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button variant="ghost" className="w-full mt-4 text-sm">
                  View All Notifications
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}