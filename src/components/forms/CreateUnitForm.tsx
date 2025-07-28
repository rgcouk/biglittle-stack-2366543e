import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateUnit } from '@/hooks/useUnits';
import { useProviderFacilities } from '@/hooks/useFacilities';
import { formatCurrency } from '@/lib/currency';

const createUnitSchema = z.object({
  facilityId: z.string().min(1, 'Please select a facility'),
  unitNumber: z.string().min(1, 'Unit number is required'),
  sizeCategory: z.enum(['Small', 'Medium', 'Large', 'Extra Large']),
  lengthMetres: z.number().min(0.1, 'Length must be greater than 0'),
  widthMetres: z.number().min(0.1, 'Width must be greater than 0'),
  heightMetres: z.number().min(0.1, 'Height must be greater than 0'),
  monthlyPricePounds: z.number().min(1, 'Price must be greater than 0'),
  floorLevel: z.number().min(0, 'Floor level must be 0 or greater'),
  features: z.array(z.string()).optional(),
});

type CreateUnitData = z.infer<typeof createUnitSchema>;

const availableFeatures = [
  '24/7 Access',
  'Climate Control',
  'Power Outlet',
  'Ground Floor',
  'Loading Bay Access',
  'CCTV Monitoring',
  'Indoor Access',
  'Drive-up Access',
];

interface CreateUnitFormProps {
  onSuccess?: () => void;
}

export function CreateUnitForm({ onSuccess }: CreateUnitFormProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const { data: facilities, isLoading: facilitiesLoading } = useProviderFacilities();
  const createUnit = useCreateUnit();

  const form = useForm<CreateUnitData>({
    resolver: zodResolver(createUnitSchema),
    defaultValues: {
      unitNumber: '',
      sizeCategory: 'Medium',
      lengthMetres: 2.0,
      widthMetres: 2.0,
      heightMetres: 2.5,
      monthlyPricePounds: 100,
      floorLevel: 0,
      features: [],
    },
  });

  const onSubmit = async (data: CreateUnitData) => {
    try {
      await createUnit.mutateAsync({
        facility_id: data.facilityId,
        unit_number: data.unitNumber,
        size_category: data.sizeCategory,
        length_metres: data.lengthMetres,
        width_metres: data.widthMetres,
        height_metres: data.heightMetres,
        monthly_price_pence: data.monthlyPricePounds * 100,
        floor_level: data.floorLevel,
        features: selectedFeatures,
        status: 'available',
      });
      
      form.reset();
      setSelectedFeatures([]);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create unit:', error);
    }
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setSelectedFeatures(prev => 
      checked 
        ? [...prev, feature]
        : prev.filter(f => f !== feature)
    );
    form.setValue('features', selectedFeatures);
  };

  const currentPrice = form.watch('monthlyPricePounds');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Storage Unit</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="facilityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select facility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {facilities?.map((facility) => (
                          <SelectItem key={facility.id} value={facility.id}>
                            {facility.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A01, B15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sizeCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Small">Small</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Large">Large</SelectItem>
                        <SelectItem value="Extra Large">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="floorLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor Level</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="lengthMetres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (metres)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="widthMetres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (metres)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="heightMetres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (metres)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="monthlyPricePounds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">£</span>
                      <Input 
                        type="number" 
                        min="1"
                        className="pl-7"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(currentPrice || 0)}/month
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label className="text-base font-medium">Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {availableFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={selectedFeatures.includes(feature)}
                      onCheckedChange={(checked) => handleFeatureChange(feature, checked as boolean)}
                    />
                    <Label htmlFor={feature} className="text-sm font-normal">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createUnit.isPending || facilitiesLoading}
            >
              {createUnit.isPending ? 'Creating Unit...' : 'Create Unit'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}