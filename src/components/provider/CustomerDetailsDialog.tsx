import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatCurrencyMonthly } from "@/lib/currency";
import { useCustomerDetails } from "@/hooks/useCustomers";
import { Loader2, User, Calendar, DollarSign, Home } from "lucide-react";

interface CustomerDetailsDialogProps {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailsDialog({ customerId, open, onOpenChange }: CustomerDetailsDialogProps) {
  const { data: customerData, isLoading } = useCustomerDetails(customerId || '');

  if (!customerId) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "ended":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Details
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading customer details...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Customer Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Display Name</p>
                    <p className="font-medium">{customerData?.profile?.display_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <Badge variant="secondary">{customerData?.profile?.role}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Since</p>
                    <p className="font-medium">
                      {customerData?.profile?.created_at 
                        ? new Date(customerData.profile.created_at).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {customerData?.profile?.updated_at 
                        ? new Date(customerData.profile.updated_at).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Active Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Active Bookings ({customerData?.bookings?.filter(b => b.status === 'active').length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customerData?.bookings?.filter(b => b.status === 'active').length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Dimensions</TableHead>
                        <TableHead>Monthly Rate</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerData.bookings.filter(b => b.status === 'active').map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {booking.units?.unit_number || 'N/A'}
                          </TableCell>
                          <TableCell>{booking.units?.size_category || 'N/A'}</TableCell>
                          <TableCell>
                            {booking.units ? 
                              `${booking.units.length_metres}×${booking.units.width_metres}×${booking.units.height_metres}m` 
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {formatCurrencyMonthly((booking.monthly_rate_pence || 0) / 100)}
                          </TableCell>
                          <TableCell>
                            {new Date(booking.start_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No active bookings</p>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Recent Payments ({customerData?.payments?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customerData?.payments?.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stripe ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerData.payments.slice(0, 10).map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency((payment.amount_pence || 0) / 100)}
                          </TableCell>
                          <TableCell>{payment.payment_method || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={getPaymentStatusColor(payment.status)}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {payment.stripe_payment_id || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No payment history</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}