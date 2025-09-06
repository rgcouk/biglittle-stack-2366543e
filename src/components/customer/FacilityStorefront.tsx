import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  Building2,
  Ruler,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import { usePublicFacility, usePublicUnits } from '@/hooks/usePublicFacility';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface Unit {
  id: string;
  unit_number: string;
  size_category: string;
  monthly_price_pence: number;
  width_metres?: number;
  length_metres?: number;
  height_metres?: number;
  features?: string[];
}

interface FacilityStorefrontProps {
  facilityId: string;
  onBookUnit?: (unit: Unit) => void;
}

export function FacilityStorefront({ facilityId, onBookUnit }: FacilityStorefrontProps) {
  const { data, isLoading, error } = usePublicFacility(facilityId);
  const { data: units, isLoading: unitsLoading } = usePublicUnits(facilityId);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="h-48 bg-muted animate-pulse rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.facility) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Facility Not Found</h1>
          <p className="text-muted-foreground">The facility you're looking for doesn't exist or isn't available.</p>
        </div>
      </div>
    );
  }

  const { facility, unitCategories, availableUnits } = data;
  const displayUnits = unitCategories || []; // Use secure aggregate data
  
  const categories = ['all', ...new Set(displayUnits.map(unit => unit.size_category))];
  const filteredUnits = selectedCategory === 'all' 
    ? displayUnits 
    : displayUnits.filter(unit => unit.size_category === selectedCategory);

  const features = [
    { icon: Shield, label: 'Security', description: '24/7 CCTV monitoring' },
    { icon: Clock, label: 'Access', description: 'Extended hours access' },
    { icon: Building2, label: 'Climate', description: 'Climate controlled units' },
    { icon: CheckCircle, label: 'Insurance', description: 'Optional insurance available' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {facility.name}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {facility.description || 'Premium storage solutions for your needs'}
            </p>
            
            <div className="flex items-center justify-center gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{facility.address}</span>
              </div>
              {unitCategories && unitCategories.length > 0 && (
                <Badge variant="secondary" className="px-3 py-1">
                  {unitCategories.reduce((total, cat) => total + cat.available_count, 0)} units available
                </Badge>
              )}
            </div>

            <Button size="lg" className="animate-in slide-in-from-bottom-4 duration-1000 delay-200">
              Book Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.label} 
                className="text-center hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Units Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Available Units</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Sizes' : category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex border rounded">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {unitsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredUnits.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Units Available</h3>
              <p className="text-muted-foreground">
                {selectedCategory === 'all' 
                  ? 'All units are currently occupied. Check back later!'
                  : `No ${selectedCategory} units available. Try a different size.`
                }
              </p>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            )}>
              {filteredUnits.map((category, index) => (
                <Card 
                  key={`${category.facility_id}-${category.size_category}`}
                  className={cn(
                    'hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-4',
                    viewMode === 'list' && 'flex items-center'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className={cn(viewMode === 'list' && 'flex-1')}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{category.size_category} Units</CardTitle>
                      <Badge variant="outline">{category.available_count} available</Badge>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {category.pricing_type === 'Fixed Rate' 
                        ? `£${category.min_price_range_pounds}`
                        : `£${category.min_price_range_pounds} - £${category.max_price_range_pounds}`
                      }
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className={cn(viewMode === 'list' && 'flex items-center gap-4')}>
                    <div className={cn('space-y-2', viewMode === 'list' && 'flex gap-4 space-y-0')}>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        {category.size_category} storage units
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Contact for exact dimensions and availability
                      </div>
                    </div>
                    <Button 
                      className={cn('w-full mt-4', viewMode === 'list' && 'w-auto mt-0')}
                      onClick={() => {
                        // Create a placeholder unit object for the booking flow
                        if (onBookUnit) {
                          const placeholderUnit = {
                            id: `category-${category.size_category}`,
                            unit_number: `${category.size_category} Unit`,
                            size_category: category.size_category,
                            monthly_price_pence: category.min_price_range_pounds * 100,
                            width_metres: undefined,
                            length_metres: undefined,
                            height_metres: undefined,
                            features: []
                          };
                          onBookUnit(placeholderUnit);
                        }
                      }}
                    >
                      Inquire About Units
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Get In Touch</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Visit Us</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {facility.address}
                  {facility.postcode && `, ${facility.postcode}`}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Call Us</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Available 7 days a week
                </p>
                <Button variant="outline" className="mt-2 w-full">
                  Contact Now
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}