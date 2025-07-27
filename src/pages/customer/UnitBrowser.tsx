import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Ruler, Thermometer, Car, Camera, ArrowLeft, Filter } from "lucide-react"
import { Link, useParams } from "react-router-dom"

export default function UnitBrowser() {
  const { providerId = "demo-storage" } = useParams()
  const [priceRange, setPriceRange] = useState("all")
  const [unitType, setUnitType] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const units = [
    {
      id: "U001",
      size: "5x5",
      price: 45,
      type: "Standard",
      features: ["Ground Floor", "Drive-Up Access"],
      available: true,
      floor: 1,
      description: "Perfect for seasonal items, small furniture, and boxes"
    },
    {
      id: "U015",
      size: "5x5",
      price: 55,
      type: "Climate Controlled",
      features: ["Climate Control", "Indoor Access"],
      available: true,
      floor: 2,
      description: "Ideal for electronics, documents, and sensitive items"
    },
    {
      id: "U025",
      size: "5x10",
      price: 65,
      type: "Standard",
      features: ["Ground Floor", "Drive-Up Access"],
      available: true,
      floor: 1,
      description: "Great for studio apartment contents or office storage"
    },
    {
      id: "U032",
      size: "5x10",
      price: 75,
      type: "Climate Controlled",
      features: ["Climate Control", "Indoor Access", "24/7 Access"],
      available: true,
      floor: 2,
      description: "Perfect for business files, artwork, and valuable items"
    },
    {
      id: "U045",
      size: "10x10",
      price: 95,
      type: "Standard",
      features: ["Ground Floor", "Drive-Up Access", "Wide Door"],
      available: true,
      floor: 1,
      description: "Suitable for 1-2 bedroom home contents and furniture"
    },
    {
      id: "U052",
      size: "10x10",
      price: 115,
      type: "Climate Controlled",
      features: ["Climate Control", "Indoor Access", "Security Cameras"],
      available: false,
      floor: 2,
      description: "Premium storage for valuable and sensitive belongings"
    },
  ]

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.size.includes(searchTerm) || 
                         unit.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.features.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesPrice = priceRange === "all" || 
                        (priceRange === "under-50" && unit.price < 50) ||
                        (priceRange === "50-100" && unit.price >= 50 && unit.price <= 100) ||
                        (priceRange === "over-100" && unit.price > 100)
    
    const matchesType = unitType === "all" || 
                       unit.type.toLowerCase().replace(" ", "-") === unitType

    return matchesSearch && matchesPrice && matchesType && unit.available
  })

  const getTypeIcon = (type: string) => {
    return type === "Climate Controlled" ? Thermometer : Car
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to={`/storefront/${providerId}`} className="flex items-center space-x-2 text-primary">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm text-muted-foreground">Back to Storefront</span>
              </Link>
              <div className="w-px h-6 bg-border" />
              <h1 className="text-2xl font-bold">Browse Available Units</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-card sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <span>Filter Units</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <Input
                    placeholder="Size, type, features..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under-50">Under $50</SelectItem>
                      <SelectItem value="50-100">$50 - $100</SelectItem>
                      <SelectItem value="over-100">Over $100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Unit Type</label>
                  <Select value={unitType} onValueChange={setUnitType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="climate-controlled">Climate Controlled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Features</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="drive-up" />
                      <label htmlFor="drive-up" className="text-sm">Drive-Up Access</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="climate" />
                      <label htmlFor="climate" className="text-sm">Climate Control</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="ground" />
                      <label htmlFor="ground" className="text-sm">Ground Floor</label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Units Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {filteredUnits.length} available units
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredUnits.map((unit) => {
                const TypeIcon = getTypeIcon(unit.type)
                return (
                  <Card key={unit.id} className="shadow-card hover:shadow-elevated transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Ruler className="h-5 w-5 text-primary" />
                          <CardTitle className="text-xl">{unit.size}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <TypeIcon className="h-3 w-3" />
                          <span>{unit.type}</span>
                        </Badge>
                      </div>
                      <CardDescription>
                        <span className="text-2xl font-bold text-primary">${unit.price}</span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{unit.description}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {unit.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          asChild
                        >
                          <Link to={`/storefront/${providerId}/unit/${unit.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-primary hover:opacity-90"
                          asChild
                        >
                          <Link to={`/storefront/${providerId}/book/${unit.id}`}>
                            Reserve Now
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredUnits.length === 0 && (
              <Card className="shadow-card text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    No units match your current filters.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("")
                      setPriceRange("all")
                      setUnitType("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}