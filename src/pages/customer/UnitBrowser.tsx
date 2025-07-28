import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Ruler, Thermometer, Car, Camera, ArrowLeft, Filter, Loader2 } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useFacility } from "@/hooks/useFacilities"
import { useUnits } from "@/hooks/useUnits"
import { formatCurrencyMonthly } from "@/lib/currency"

export default function UnitBrowser() {
  const { providerId } = useParams()
  const [priceRange, setPriceRange] = useState("all")
  const [unitType, setUnitType] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const { data: facility, isLoading: facilityLoading } = useFacility(providerId || "")
  const { data: units = [], isLoading: unitsLoading } = useUnits(providerId)

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.unit_number.includes(searchTerm) || 
                         unit.size_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (unit.features || []).some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const priceInPounds = unit.monthly_price_pence / 100;
    const matchesPrice = priceRange === "all" || 
                        (priceRange === "under-50" && priceInPounds < 50) ||
                        (priceRange === "50-100" && priceInPounds >= 50 && priceInPounds <= 100) ||
                        (priceRange === "over-100" && priceInPounds > 100)
    
    const matchesType = unitType === "all" || 
                       unit.size_category.toLowerCase().replace(" ", "-") === unitType

    return matchesSearch && matchesPrice && matchesType && unit.status === "available"
  })

  if (facilityLoading || unitsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Facility not found</h2>
          <p className="text-muted-foreground">The requested facility could not be found.</p>
        </div>
      </div>
    );
  }

  const getTypeIcon = (features: string[]) => {
    return features?.includes("Climate Controlled") ? Thermometer : Car
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
              <h1 className="text-2xl font-bold">Browse Available Units - {facility.name}</h1>
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
                       <SelectItem value="under-50">Under £50</SelectItem>
                       <SelectItem value="50-100">£50 - £100</SelectItem>
                       <SelectItem value="over-100">Over £100</SelectItem>
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
                       <SelectItem value="small">Small</SelectItem>
                       <SelectItem value="medium">Medium</SelectItem>
                       <SelectItem value="large">Large</SelectItem>
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
                const TypeIcon = getTypeIcon(unit.features || [])
                const hasClimateControl = unit.features?.includes("Climate Controlled")
                return (
                  <Card key={unit.id} className="shadow-card hover:shadow-elevated transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Ruler className="h-5 w-5 text-primary" />
                          <CardTitle className="text-xl">{unit.length_metres}m × {unit.width_metres}m</CardTitle>
                        </div>
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <TypeIcon className="h-3 w-3" />
                          <span>{hasClimateControl ? "Climate Controlled" : "Standard"}</span>
                        </Badge>
                      </div>
                       <CardDescription>
                         <span className="text-2xl font-bold text-primary">{formatCurrencyMonthly(unit.monthly_price_pence / 100)}</span>
                       </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {unit.size_category} unit - Perfect for various storage needs
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {unit.features?.map((feature, index) => (
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