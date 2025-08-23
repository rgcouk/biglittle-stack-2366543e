import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, CreditCard, FileText, Phone } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export default function Bookings() {
  const bookings = [
    {
      id: '1',
      unit_number: 'A-101',
      facility_name: 'SecureStore Downtown',
      facility_address: '123 Storage Lane, City Center',
      start_date: '2024-01-15',
      end_date: null,
      monthly_rate: 15000,
      status: 'active',
      next_payment: '2024-02-15'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Manage your storage unit reservations</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CalendarDays className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't made any bookings yet. Browse available storage units to get started.
              </p>
              <Button>Browse Storage Units</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      Unit {booking.unit_number}
                    </CardTitle>
                    <Badge 
                      variant={booking.status === 'active' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{booking.facility_name}</p>
                        <p className="text-sm text-muted-foreground">{booking.facility_address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Start Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.start_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Monthly Rate</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(booking.monthly_rate)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {booking.status === 'active' && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900 dark:text-blue-200">
                            Next Payment Due
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {new Date(booking.next_payment).toLocaleDateString()} - {formatCurrency(booking.monthly_rate)}
                          </p>
                        </div>
                        <Button size="sm">
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      View Contract
                    </Button>
                    <Button variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Facility
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}