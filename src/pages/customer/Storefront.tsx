import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock, Shield, Thermometer, Car, Camera, Phone, Loader2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useFacilities } from "@/hooks/useFacilities"
import { useUnits } from "@/hooks/useUnits"
import { formatCurrencyMonthly } from "@/lib/currency"

export default function CustomerStorefront() {
  const navigate = useNavigate()
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities()
  const facility = facilities?.[0] // Use first available facility
  const { data: units = [], isLoading: unitsLoading } = useUnits(facility?.provider_id)

  const features = [
    { icon: Shield, title: "24/7 Security", description: "Advanced security systems with constant monitoring" },
    { icon: Thermometer, title: "Climate Control", description: "Temperature and humidity controlled units available" },
    { icon: Car, title: "Drive-Up Access", description: "Convenient vehicle access to ground floor units" },
    { icon: Camera, title: "Video Surveillance", description: "Comprehensive CCTV coverage for your peace of mind" },
  ]

  // Group units by size category for display
  const unitTypes = units.reduce((acc, unit) => {
    const key = unit.size_category
    if (!acc[key]) {
      acc[key] = {
        size: `${unit.length_metres}x${unit.width_metres}`,
        price: unit.monthly_price_pence / 100,
        description: `${unit.size_category} storage unit`,
        available: 1,
        units: []
      }
    } else {
      acc[key].available += 1
    }
    acc[key].units.push(unit)
    return acc
  }, {} as Record<string, any>)

  const unitTypesArray = Object.values(unitTypes)

  if (facilitiesLoading || unitsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!facility) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Storage Facilities Available</h2>
          <p className="text-muted-foreground">Please check back later or contact support.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-primary">{facility.name}</h1>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.8 (124 reviews)</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/account">My Account</Link>
              </Button>
              <Button onClick={() => navigate('/units')}>
                Browse Units
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Secure Storage Solutions
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Premium self-storage facilities with state-of-the-art security, climate control, and convenient access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate('/units')}>
              Find Your Perfect Unit
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              <Phone className="h-4 w-4 mr-2" />
              Call {facility.phone || '0161 123 4567'}
            </Button>
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {facility.address}<br />
                  {facility.postcode}
                </p>
                <Button variant="outline" className="w-full">
                  Get Directions
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Access Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>6:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>7:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>8:00 AM - 8:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Why Choose Us?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide premium storage solutions with features designed for your peace of mind and convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-card hover:shadow-elevated transition-shadow text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Unit Types */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Available Unit Sizes</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from a variety of unit sizes to fit your storage needs and budget.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unitTypesArray.map((unit, index) => (
              <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">{unit.size}</CardTitle>
                    <Badge variant="secondary">{unit.available} available</Badge>
                  </div>
                  <CardDescription className="text-lg">
                    <span className="text-2xl font-bold text-primary">{formatCurrencyMonthly(unit.price)}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{unit.description}</p>
                  <Button className="w-full bg-gradient-primary hover:opacity-90" onClick={() => navigate('/units')}>
                    View Details & Book
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4">{facility.name}</h4>
              <p className="text-muted-foreground mb-4">
                Your trusted partner for secure, convenient storage solutions.
              </p>
              <p className="text-sm text-muted-foreground">
                Powered by BigLittleBox
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <div className="space-y-2">
                <button onClick={() => navigate('/units')} className="block text-muted-foreground hover:text-primary text-left">
                  Browse Units
                </button>
                <Link to="/account" className="block text-muted-foreground hover:text-primary">
                  Customer Login
                </Link>
                <a href="#" className="block text-muted-foreground hover:text-primary">
                  Contact Us
                </a>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contact</h5>
              <div className="space-y-2 text-muted-foreground">
                <p>{facility.phone || '0161 123 4567'}</p>
                <p>{facility.email || 'info@' + facility.name.toLowerCase().replace(/\s+/g, '') + '.co.uk'}</p>
                <p>{facility.address}<br />{facility.postcode}</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}