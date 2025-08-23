import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Filter, Eye, Edit, Plus, Loader2, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUnits, useDeleteUnit } from "@/hooks/useUnits";
import { useProviderFacilities } from "@/hooks/useFacilities";
import { formatCurrencyMonthly } from "@/lib/currency";
import { CreateUnitForm } from "@/components/forms/CreateUnitForm";
import { UnitDetailsDialog } from "@/components/provider/UnitDetailsDialog";
import { EditUnitDialog } from "@/components/provider/EditUnitDialog";
import { MaintenanceDialog } from "@/components/provider/MaintenanceDialog";
import type { Database } from "@/integrations/supabase/types";

type Unit = Database['public']['Tables']['units']['Row'];

const UnitsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);

  const { data: facilities, isLoading: facilitiesLoading } = useProviderFacilities();
  const facilityId = facilities?.[0]?.id; // Use first facility
  const { data: units = [], isLoading: unitsLoading } = useUnits(facilityId);
  const deleteUnit = useDeleteUnit();

  const handleDeleteUnit = async (unitId: string) => {
    if (confirm('Are you sure you want to delete this unit?')) {
      await deleteUnit.mutateAsync(unitId);
    }
  };

  const handleViewUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setViewDialogOpen(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setEditDialogOpen(true);
  };

  const handleMaintenanceUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setMaintenanceDialogOpen(true);
  };

  const filteredUnits = units.filter((unit) => {
    const matchesSearch = unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.size_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (unit.features || []).some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || unit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  if (facilitiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading facilities...</span>
      </div>
    );
  }

  if (unitsLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/provider" className="flex items-center space-x-2 text-muted-foreground hover:text-primary">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Link>
                <h1 className="text-2xl font-bold">Units Management</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading units...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/provider" className="flex items-center space-x-2 text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-2xl font-bold">Units Management</h1>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Unit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <CreateUnitForm onSuccess={() => setCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Storage Units</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search units by number, size, or features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit #</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.unit_number}</TableCell>
                    <TableCell>{unit.length_metres}m x {unit.width_metres}m</TableCell>
                    <TableCell>{unit.size_category}</TableCell>
                    <TableCell>
                      {unit.floor_level === 0 ? "Ground" : 
                       unit.floor_level === -1 ? "Basement" : 
                       `Floor ${unit.floor_level}`}
                    </TableCell>
                    <TableCell>{formatCurrencyMonthly(unit.monthly_price_pence / 100)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(unit.status)}>
                        {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {unit.features?.join(", ") || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewUnit(unit)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditUnit(unit)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMaintenanceUnit(unit)}
                        >
                          <Wrench className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteUnit(unit.id)}
                          disabled={deleteUnit.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUnits.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No units found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <UnitDetailsDialog 
        unit={selectedUnit}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
      
      <EditUnitDialog 
        unit={selectedUnit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <MaintenanceDialog 
        unitId={selectedUnit?.id || null}
        unitNumber={selectedUnit?.unit_number}
        open={maintenanceDialogOpen}
        onOpenChange={setMaintenanceDialogOpen}
      />
    </div>
  );
};

export default UnitsManagement;