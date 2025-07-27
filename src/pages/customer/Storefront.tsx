import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock, Shield, Thermometer, Car, Camera, Phone } from "lucide-react"
import { Link, useParams } from "react-router-dom"

export default function CustomerStorefront() {
  const { providerId = "demo-storage" } = useParams()

  const features = [
    { icon: Shield, title: "24/7 Security", description: "Advanced security systems with constant monitoring" },
    { icon: Thermometer, title: "Climate Control", description: "Temperature and humidity controlled units available" },
    { icon: Car, title: "Drive-Up Access", description: "Convenient vehicle access to ground floor units" },
    { icon: Camera, title: "Video Surveillance", description: "Comprehensive CCTV coverage for your peace of mind" },
  ]

  const unitTypes = [
    { size: "5x5", price: 32, description: "Perfect for seasonal items and small furniture", available: 8 },
    { size: "5x10", price: 48, description: "Ideal for studio flat or office contents", available: 12 },
    { size: "10x10", price: 68, description: "Great for 1-2 bedroom home contents", available: 6 },
    { size: "10x15", price: 85, description: "Suitable for 2-3 bedroom home contents", available: 4 },
    { size: "10x20", price: 125, description: "Perfect for 3-4 bedroom home or vehicle storage", available: 3 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-primary">Premier Storage Solutions</h1>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.8 (124 reviews)</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/account">My Account</Link>
              </Button>
              <Button asChild>
                <Link to={`/storefront/${providerId}/units`}>Browse Units</Link>
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
            <Button size="lg" variant="secondary" asChild>
              <Link to={`/storefront/${providerId}/units`}>Find Your Perfect Unit</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              <Phone className="h-4 w-4 mr-2" />
              Call 0161 123 4567
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
                  123 Storage Park, Business Estate<br />
                  Manchester, M1 7ED
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
            {unitTypes.map((unit, index) => (
              <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">{unit.size}</CardTitle>
                    <Badge variant="secondary">{unit.available} available</Badge>
                  </div>
                  <CardDescription className="text-lg">
                    <span className="text-2xl font-bold text-primary">£{unit.price}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{unit.description}</p>
                  <Button className="w-full bg-gradient-primary hover:opacity-90" asChild>
                    <Link to={`/storefront/${providerId}/units`}>
                      View Details & Book
                    </Link>
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
              <h4 className="font-bold text-lg mb-4">Premier Storage Solutions</h4>
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
                <Link to={`/storefront/${providerId}/units`} className="block text-muted-foreground hover:text-primary">
                  Browse Units
                </Link>
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
                <p>0161 123 4567</p>
                <p>info@premierstoragesolutions.co.uk</p>
                <p>123 Storage Park<br />Manchester, M1 7ED</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}