import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyMonthly } from "@/lib/currency";
import type { Database } from "@/integrations/supabase/types";

type Unit = Database['public']['Tables']['units']['Row'];

interface UnitDetailsDialogProps {
  unit: Unit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnitDetailsDialog({ unit, open, onOpenChange }: UnitDetailsDialogProps) {
  if (!unit) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "occupied": 
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Unit {unit.unit_number} Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit Number:</span>
                <span className="font-medium">{unit.unit_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size Category:</span>
                <span className="font-medium">{unit.size_category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions:</span>
                <span className="font-medium">
                  {unit.length_metres}m × {unit.width_metres}m × {unit.height_metres}m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Floor Level:</span>
                <span className="font-medium">
                  {unit.floor_level === 0 ? "Ground" : 
                   unit.floor_level === -1 ? "Basement" : 
                   `Floor ${unit.floor_level}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Price:</span>
                <span className="font-medium">
                  {formatCurrencyMonthly(unit.monthly_price_pence / 100)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(unit.status)}>
                  {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Features & Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              {unit.features && unit.features.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {unit.features.map((feature, index) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No features specified</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">
                {new Date(unit.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="font-medium">
                {new Date(unit.updated_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Floor Area:</span>
              <span className="font-medium">
                {(unit.length_metres * unit.width_metres).toFixed(1)} m²
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Volume:</span>
              <span className="font-medium">
                {(unit.length_metres * unit.width_metres * unit.height_metres).toFixed(1)} m³
              </span>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}