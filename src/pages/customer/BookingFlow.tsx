import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, CreditCard, User, MapPin, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUnit } from "@/hooks/useUnits";
import { useFacility } from "@/hooks/useFacilities";
import { useCreateBooking } from "@/hooks/useBookings";
import { useProfile } from "@/hooks/useProfiles";
import { formatCurrencyMonthly, formatCurrency } from "@/lib/currency";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const BookingFlow = () => {
  const { providerId, unitId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    postcode: "",
    startDate: "",
    duration: "1", // months
    emergencyContact: "",
    emergencyPhone: "",
  });

  const { data: unit, isLoading: unitLoading } = useUnit(unitId || "");
  const { data: facility, isLoading: facilityLoading } = useFacility(providerId || "");
  const { data: profile } = useProfile();
  const createBooking = useCreateBooking();

  const steps = [
    { title: "Personal Information", icon: User },
    { title: "Lease Details", icon: Calendar },
    { title: "Payment & Confirmation", icon: CreditCard },
  ];

  const monthlyRate = unit ? unit.monthly_price_pence / 100 : 0;
  const totalCost = monthlyRate * parseInt(formData.duration);
  const securityDeposit = monthlyRate; // One month security deposit
  const adminFee = 18;
  const totalAmount = totalCost + securityDeposit + adminFee;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!unit || !profile) return;
    
    try {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + parseInt(formData.duration));

      await createBooking.mutateAsync({
        customer_id: profile.id,
        unit_id: unit.id,
        start_date: formData.startDate,
        end_date: formData.duration === "ongoing" ? null : endDate.toISOString().split('T')[0],
        monthly_rate_pence: unit.monthly_price_pence,
        status: "active"
      });

      toast({
        title: "Booking Confirmed!",
        description: "Your storage unit has been successfully reserved.",
      });

      navigate(`/storefront/${providerId}`);
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (unitLoading || facilityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!unit || !facility) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Unit not found</h2>
          <p className="text-muted-foreground">The requested unit could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link to={`/storefront/${providerId}/unit/${unitId}`} className="flex items-center space-x-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Unit Details</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Book Unit {unit.unit_number}</h1>
              <p className="text-muted-foreground">{facility.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((stepInfo, index) => {
            const StepIcon = stepInfo.icon;
            const isActive = step === index + 1;
            const isCompleted = step > index + 1;
            
            return (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted ? "bg-primary border-primary text-primary-foreground" :
                  isActive ? "border-primary text-primary" : "border-muted text-muted-foreground"
                }`}>
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? "text-primary" : isCompleted ? "text-primary" : "text-muted-foreground"
                }`}>
                  {stepInfo.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-0.5 mx-4 ${
                    isCompleted ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 && "Personal Information"}
                  {step === 2 && "Lease Details"}
                  {step === 3 && "Payment & Confirmation"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postcode">Postcode *</Label>
                      <Input
                        id="postcode"
                        value={formData.postcode}
                        onChange={(e) => handleInputChange("postcode", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Lease Duration</Label>
                      <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Month</SelectItem>
                          <SelectItem value="3">3 Months</SelectItem>
                          <SelectItem value="6">6 Months</SelectItem>
                          <SelectItem value="12">12 Months</SelectItem>
                          <SelectItem value="ongoing">Ongoing (Month-to-Month)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                        <Input
                          id="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                        <Input
                          id="emergencyPhone"
                          type="tel"
                          value={formData.emergencyPhone}
                          onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-2">Booking Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Unit:</span>
                          <span>{unit.unit_number} - {unit.size_category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Rate:</span>
                          <span>{formatCurrencyMonthly(monthlyRate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{formData.duration === "ongoing" ? "Month-to-Month" : `${formData.duration} Month(s)`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Start Date:</span>
                          <span>{new Date(formData.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Payment Breakdown</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Rent ({formData.duration} month{formData.duration !== "1" ? "s" : ""}):</span>
                          <span>{formatCurrency(totalCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Security Deposit:</span>
                          <span>{formatCurrency(securityDeposit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Admin Fee:</span>
                          <span>{formatCurrency(adminFee)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base pt-2 border-t">
                          <span>Total Amount:</span>
                          <span>{formatCurrency(totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      By proceeding, you agree to our terms and conditions. The security deposit will be refunded 
                      at the end of your tenancy, subject to the unit being returned in good condition.
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  {step > 1 && (
                    <Button variant="outline" onClick={handlePrevious}>
                      Previous
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button onClick={handleNext} className="ml-auto">
                      Continue
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit} 
                      className="ml-auto"
                      disabled={createBooking.isPending}
                    >
                      {createBooking.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Confirm Booking"
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reservation Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Reservation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Unit {unit.unit_number}</h3>
                  <p className="text-sm text-muted-foreground">{facility.name}</p>
                  <p className="text-sm text-muted-foreground">{unit.size_category}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {unit.floor_level === 0 ? "Ground Floor" : 
                       unit.floor_level === -1 ? "Basement" : 
                       `Floor ${unit.floor_level}`}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Dimensions: </span>
                    {unit.length_metres}m × {unit.width_metres}m × {unit.height_metres}m
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrencyMonthly(monthlyRate)}
                    </div>
                    <p className="text-sm text-muted-foreground">Monthly rental fee</p>
                  </div>
                </div>

                {formData.duration && formData.duration !== "ongoing" && (
                  <div className="pt-4 border-t">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Rent:</span>
                        <span>{formatCurrency(totalCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Security Deposit:</span>
                        <span>{formatCurrency(securityDeposit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Admin Fee:</span>
                        <span>{formatCurrency(adminFee)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;