import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { User, CreditCard, FileText, Building2, Phone, Mail, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useProfile } from "@/hooks/useProfiles"
import { useCustomerBookings } from "@/hooks/useBookings"
import { useAuth } from "@/hooks/useAuth"
import { formatCurrency } from "@/lib/currency"
import { EditProfileForm } from "@/components/forms/EditProfileForm"

export default function CustomerAccount() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: bookings = [], isLoading: bookingsLoading } = useCustomerBookings();

  if (profileLoading || bookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentBooking = bookings.find(booking => booking.status === "active");
  
  // Mock payment history for demo - in production this would come from payments table
  const invoices = [
    { id: "INV-001", date: "2024-04-01", amount: 8500, status: "Paid" },
    { id: "INV-002", date: "2024-03-01", amount: 8500, status: "Paid" },
    { id: "INV-003", date: "2024-02-01", amount: 8500, status: "Paid" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Account</h1>
            <div className="flex items-center space-x-4">
              <Link to="/demo" className="text-primary hover:underline">
                Find More Storage
              </Link>
              <Button variant="outline" onClick={signOut}>Sign Out</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile & Unit Info */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{profile?.display_name || user?.email}</h3>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(profile?.created_at || user?.created_at || "").toLocaleDateString("en-GB", { 
                      month: "long", 
                      year: "numeric" 
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    {user?.email}
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {profile.phone}
                    </div>
                  )}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <EditProfileForm />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {currentBooking && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span>My Unit</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Unit {currentBooking.unit?.unit_number}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentBooking.unit?.size_category} • Total Storage Boston
                      </p>
                    </div>
                    <Badge variant="default" className="capitalize">{currentBooking.status}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Rate:</span>
                      <span>{formatCurrency(currentBooking.monthly_rate_pence / 100)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lease Start:</span>
                      <span>{new Date(currentBooking.start_date).toLocaleDateString()}</span>
                    </div>
                    {currentBooking.end_date && (
                      <div className="flex justify-between">
                        <span>Lease End:</span>
                        <span>{new Date(currentBooking.end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="w-full">
                    View Unit Details
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Billing & Documents */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span>Payment Method</span>
                </CardTitle>
                <CardDescription>Manage your payment information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      VISA
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4567</p>
                      <p className="text-sm text-muted-foreground">Expires 12/26</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Billing History</span>
                </CardTitle>
                <CardDescription>View your payment history and download invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount / 100)}</TableCell>
                        <TableCell>
                          <Badge variant="default">{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Download</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                    <FileText className="h-6 w-6" />
                    <span>Download Lease</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                    <CreditCard className="h-6 w-6" />
                    <span>Make Payment</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                    <Phone className="h-6 w-6" />
                    <span>Contact Support</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}