import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Phone, Mail, Shield, Clock, Car, Thermometer, ArrowRight } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { getDemoFacility, isDemoProvider } from "@/services/demoData"

export default function DemoStorefront() {
  const { providerId } = useParams()
  
  // Check if this is a demo provider
  if (!isDemoProvider(providerId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Demo not available</h2>
          <p className="text-muted-foreground mb-4">This demo is only available for the demo provider.</p>
          <Button asChild>
            <Link to="/demo">Back to Demo</Link>
          </Button>
        </div>
      </div>
    );
  }

  const facility = getDemoFacility(providerId || "")

  if (!facility) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Demo facility not found</h2>
          <p className="text-muted-foreground mb-4">The demo facility could not be loaded.</p>
          <Button asChild>
            <Link to="/demo">Back to Demo</Link>
          </Button>
        </div>
      </div>
    );
  }

  const features = [
    { icon: Shield, title: "24/7 Security", description: "Round-the-clock CCTV monitoring and secure access" },
    { icon: Clock, title: "24/7 Access", description: "Access your storage unit any time, day or night" },
    { icon: Car, title: "Drive-Up Access", description: "Convenient drive-up access for easy loading" },
    { icon: Thermometer, title: "Climate Control", description: "Temperature and humidity controlled units available" }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Banner */}
      <div className="bg-gradient-primary text-primary-foreground py-2 px-4 text-center">
        <p className="text-sm font-medium">
          🎭 Demo Mode - This is a demonstration of the customer storefront experience
        </p>
      </div>

      {/* Navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">SecureStore Demo</h1>
            </div>
            <Button asChild>
              <Link to="/demo">Back to Demo</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-primary text-primary-foreground py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {facility.name}
          </h1>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {facility.description}
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="shadow-elevated"
            asChild
          >
            <Link to={`/storefront/${providerId}/units`}>
              Browse Available Units
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Storage?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="shadow-card text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Visit Our Facility</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground">{facility.address}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">{facility.contact_phone}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">{facility.contact_email}</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Ready to Get Started?</CardTitle>
                <CardDescription>
                  Browse our available storage units and find the perfect space for your needs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-gradient-primary hover:opacity-90" asChild>
                  <Link to={`/storefront/${providerId}/units`}>
                    View Available Units
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  <Badge variant="outline" className="mr-2">Demo</Badge>
                  This is a demonstration storefront
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}