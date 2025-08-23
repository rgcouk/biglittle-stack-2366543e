import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUpdateUnit } from '@/hooks/useUnits';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import type { Database } from "@/integrations/supabase/types";

type Unit = Database['public']['Tables']['units']['Row'];

const editUnitSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required'),
  sizeCategory: z.enum(['Small', 'Medium', 'Large', 'Extra Large']),
  lengthMetres: z.number().min(0.1, 'Length must be greater than 0'),
  widthMetres: z.number().min(0.1, 'Width must be greater than 0'),
  heightMetres: z.number().min(0.1, 'Height must be greater than 0'),
  monthlyPricePounds: z.number().min(1, 'Price must be greater than 0'),
  floorLevel: z.number().min(-1, 'Floor level must be -1 or greater'),
  status: z.enum(['available', 'occupied', 'maintenance']),
  features: z.array(z.string()).optional(),
});

type EditUnitData = z.infer<typeof editUnitSchema>;

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

interface EditUnitDialogProps {
  unit: Unit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUnitDialog({ unit, open, onOpenChange }: EditUnitDialogProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const updateUnit = useUpdateUnit();
  const { toast } = useToast();

  const form = useForm<EditUnitData>({
    resolver: zodResolver(editUnitSchema),
    defaultValues: {
      unitNumber: '',
      sizeCategory: 'Medium',
      lengthMetres: 2.0,
      widthMetres: 2.0,
      heightMetres: 2.5,
      monthlyPricePounds: 100,
      floorLevel: 0,
      status: 'available',
      features: [],
    },
  });

  useEffect(() => {
    if (unit && open) {
      form.reset({
        unitNumber: unit.unit_number,
        sizeCategory: unit.size_category as 'Small' | 'Medium' | 'Large' | 'Extra Large',
        lengthMetres: unit.length_metres || 2.0,
        widthMetres: unit.width_metres || 2.0,
        heightMetres: unit.height_metres || 2.5,
        monthlyPricePounds: (unit.monthly_price_pence || 0) / 100,
        floorLevel: unit.floor_level || 0,
        status: unit.status as 'available' | 'occupied' | 'maintenance',
        features: unit.features || [],
      });
      setSelectedFeatures(unit.features || []);
    }
  }, [unit, open, form]);

  const onSubmit = async (data: EditUnitData) => {
    if (!unit) return;

    try {
      await updateUnit.mutateAsync({
        id: unit.id,
        updates: {
          unit_number: data.unitNumber,
          size_category: data.sizeCategory,
          length_metres: data.lengthMetres,
          width_metres: data.widthMetres,
          height_metres: data.heightMetres,
          monthly_price_pence: data.monthlyPricePounds * 100,
          floor_level: data.floorLevel,
          status: data.status,
          features: selectedFeatures,
        },
      });
      
      toast({
        title: "Unit updated successfully",
        description: `Unit ${data.unitNumber} has been updated.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update unit",
        description: "There was an error updating the unit. Please try again.",
      });
    }
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    const newFeatures = checked 
      ? [...selectedFeatures, feature]
      : selectedFeatures.filter(f => f !== feature);
    
    setSelectedFeatures(newFeatures);
    form.setValue('features', newFeatures);
  };

  const currentPrice = form.watch('monthlyPricePounds');

  if (!unit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Unit {unit.unit_number}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
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
                        min="-1"
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

            <div className="flex gap-3">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={updateUnit.isPending}
              >
                {updateUnit.isPending ? 'Updating Unit...' : 'Update Unit'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}