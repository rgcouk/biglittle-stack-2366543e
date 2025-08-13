import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCustomerBookings } from "@/hooks/useBookings"
import { Link } from "react-router-dom"
import { Package, Calendar, DollarSign, MapPin, ArrowLeft } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { format } from "date-fns"

const CustomerBookings = () => {
  const { data: bookings, isLoading } = useCustomerBookings()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/customer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Manage all your storage unit bookings</p>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="h-16 bg-muted rounded"></div>
                  <div className="h-16 bg-muted rounded"></div>
                  <div className="h-16 bg-muted rounded"></div>
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-accent text-accent-foreground'
      case 'expired':
        return 'bg-destructive text-destructive-foreground'
      case 'pending':
        return 'bg-warning text-warning-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/customer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground">
          Manage all your storage unit bookings
        </p>
      </div>

      {/* Bookings List */}
      {bookings && bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-elevated transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Unit {booking.unit?.unit_number}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      {booking.unit?.facility?.name}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Unit Details */}
                  <div>
                    <h4 className="font-medium mb-2">Unit Details</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Size: {booking.unit?.size_category}</p>
                      {booking.unit?.length_metres && booking.unit?.width_metres && (
                        <p>
                          Dimensions: {booking.unit.length_metres}m × {booking.unit.width_metres}m
                          {booking.unit.height_metres && ` × ${booking.unit.height_metres}m`}
                        </p>
                      )}
                      {booking.unit?.floor_level !== null && (
                        <p>
                          Floor: {booking.unit.floor_level === 0 ? 'Ground' : `Level ${booking.unit.floor_level}`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Booking Period */}
                  <div>
                    <h4 className="font-medium mb-2">Booking Period</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Started: {format(new Date(booking.start_date), 'MMM d, yyyy')}</span>
                      </div>
                      {booking.end_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Ends: {format(new Date(booking.end_date), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      <p>
                        Created: {format(new Date(booking.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Pricing */}
                  <div>
                    <h4 className="font-medium mb-2">Pricing</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(booking.monthly_rate_pence)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button asChild className="w-full">
                      <Link to={`/customer/booking/${booking.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link to={`/facility/${booking.unit?.facility_id}`}>
                        Visit Facility
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
          <p className="text-muted-foreground mb-6">
            You haven't made any storage bookings yet. Find the perfect storage unit for your needs.
          </p>
          <Button asChild size="lg">
            <Link to="/">Find Storage</Link>
          </Button>
        </Card>
      )}
    </div>
  )
}

export default CustomerBookings