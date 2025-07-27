import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ruler, Thermometer, Car, Camera, ArrowLeft, Calendar, MapPin } from "lucide-react"
import { Link, useParams } from "react-router-dom"

export default function UnitDetails() {
  const { providerId = "demo-storage", unitId = "U001" } = useParams()

  const unit = {
    id: unitId,
    size: "5x10",
    price: 48,
    type: "Standard",
    features: ["Ground Floor", "Drive-Up Access", "24/7 Access"],
    available: true,
    floor: 1,
    description: "Perfect for storing contents of a studio flat or small office space. Easy drive-up access makes loading and unloading convenient.",
    dimensions: "1.5m × 3m × 2.4m (height)",
    squareFootage: "4.6 sq m",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link to={`/storefront/${providerId}/units`} className="flex items-center space-x-2 text-primary">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm text-muted-foreground">Back to Units</span>
            </Link>
            <div className="w-px h-6 bg-border" />
            <h1 className="text-2xl font-bold">Unit {unit.id} - {unit.size}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <Card className="shadow-card overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-3 gap-2">
              {unit.images.slice(1).map((image, index) => (
                <div key={index} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>

          {/* Unit Details */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Ruler className="h-5 w-5 text-primary" />
                    <CardTitle className="text-2xl">{unit.size}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    {unit.type === "Climate Controlled" ? (
                      <Thermometer className="h-3 w-3" />
                    ) : (
                      <Car className="h-3 w-3" />
                    )}
                    <span>{unit.type}</span>
                  </Badge>
                </div>
                 <CardDescription className="text-lg">
                   <span className="text-3xl font-bold text-primary">£{unit.price}</span>
                   <span className="text-sm text-muted-foreground">/month</span>
                 </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{unit.description}</p>
                
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Dimensions</h4>
                    <p className="font-medium">{unit.dimensions}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Square Footage</h4>
                    <p className="font-medium">{unit.squareFootage}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Floor</h4>
                    <p className="font-medium">Floor {unit.floor}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Availability</h4>
                    <Badge variant="default">Available Now</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Features & Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {unit.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full bg-gradient-primary hover:opacity-90"
                  asChild
                >
                  <Link to={`/storefront/${providerId}/book/${unit.id}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Reserve This Unit
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Location Info */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Location & Access</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Facility Address</h4>
                   <p className="text-muted-foreground">
                     123 Storage Park<br />
                     Manchester, M1 7ED
                   </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Access Hours</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span>6:00 AM - 10:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekend:</span>
                      <span>7:00 AM - 9:00 PM</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}