import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCustomerBookings } from "@/hooks/useBookings"
import { useAuth } from "@/hooks/useAuth"
import { useUserRole } from "@/hooks/useUserRole"
import { Link, useNavigate } from "react-router-dom"
import { Package, Calendar, DollarSign, MapPin, Plus, Building, RefreshCw, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { format } from "date-fns"
import { forceAuthRefresh } from "@/utils/authUtils"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

const CustomerDashboard = () => {
  const { user } = useAuth()
  const { data: userRole, refetch: refetchRole } = useUserRole()
  const { data: bookings, isLoading } = useCustomerBookings()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const activeBookings = bookings?.filter(booking => booking.status === 'active') || []
  const totalMonthlySpend = activeBookings.reduce((sum, booking) => sum + booking.monthly_rate_pence, 0)

  const handleRefreshAuth = async () => {
    setIsRefreshing(true);
    try {
      await forceAuthRefresh();
      await refetchRole();
      
      toast({
        title: "Auth Refreshed",
        description: "Authentication state has been refreshed"
      });
      
      // Check if role changed and redirect
      setTimeout(() => {
        if (userRole === 'provider') {
          navigate('/provider');
        }
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh authentication",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Storage</h1>
            <p className="text-muted-foreground">Manage your storage units and bookings</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-12">
        {/* Debug Auth Issue Alert */}
        <Card className="mb-8 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Debug: Authentication Issue Detected
            </CardTitle>
            <CardDescription className="text-yellow-700">
              You appear to be a provider but are currently in the customer portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>User ID:</strong> {user?.id}</p>
                <p><strong>Current Role:</strong> {userRole || 'Loading...'}</p>
              </div>
              <div>
                <p><strong>Expected:</strong> Provider Dashboard</p>
                <p><strong>Current:</strong> Customer Portal</p>
              </div>
            </div>
            <Button
              onClick={handleRefreshAuth}
              disabled={isRefreshing}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {isRefreshing ? "Refreshing..." : "Fix Authentication & Redirect to Provider Dashboard"}
            </Button>
          </CardContent>
        </Card>

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground text-lg">
              Manage your storage units and bookings
            </p>
          </div>
          <Button variant="gradient" size="lg" asChild>
            <Link to="/">
              <Plus className="mr-2 h-5 w-5" />
              Find More Storage
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Active Units
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">{activeBookings.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Monthly Spend
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">{formatCurrency(totalMonthlySpend)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Bookings
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">{bookings?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Facilities
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">
                {new Set(bookings?.map(b => b.unit?.facility_id)).size || 0}
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Active Bookings */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Storage Units</h2>
          {activeBookings.length > 0 && (
            <Button variant="outline" asChild>
              <Link to="/customer/bookings">View All Bookings</Link>
            </Button>
          )}
        </div>

        {activeBookings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-elevated transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Unit {booking.unit?.unit_number}
                    </CardTitle>
                    <Badge variant="outline" className="text-accent">
                      Active
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {booking.unit?.facility?.name}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Size Category</p>
                    <p className="font-medium">{booking.unit?.size_category}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Rate</p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(booking.monthly_rate_pence)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Started</p>
                      <p className="font-medium">
                        {format(new Date(booking.start_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link to={`/customer/booking/${booking.id}`}>
                      Manage Booking
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No active storage units</h3>
            <p className="text-muted-foreground mb-6">
              You don't have any active storage bookings yet. Find the perfect storage unit for your needs.
            </p>
            <Button asChild size="lg">
              <Link to="/">
                <Plus className="mr-2 h-4 w-4" />
                Find Storage
              </Link>
            </Button>
          </Card>
        )}
      </div>
      </div>
    </div>
  )
}

export default CustomerDashboard