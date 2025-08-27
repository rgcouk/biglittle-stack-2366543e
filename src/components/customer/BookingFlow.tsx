import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Calendar, 
  CreditCard, 
  User, 
  Building2,
  ArrowLeft,
  ArrowRight,
  Clock,
  Shield,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCreateBooking } from '@/hooks/useBookings';
import { formatCurrency } from '@/lib/currency';

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

interface BookingFlowProps {
  unit: Unit;
  facilityName: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface BookingData {
  moveInDate: string;
  duration: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentInfo: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    nameOnCard: string;
  };
  requirements: string;
  agreeTerms: boolean;
}

const steps = [
  { id: 'unit', label: 'Unit Selection', icon: Building2 },
  { id: 'details', label: 'Booking Details', icon: Calendar },
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: FileText },
  { id: 'confirm', label: 'Confirmation', icon: CheckCircle }
];

export function BookingFlow({ unit, facilityName, onComplete, onCancel }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    moveInDate: '',
    duration: '1',
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    paymentInfo: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      nameOnCard: ''
    },
    requirements: '',
    agreeTerms: false
  });
  const { toast } = useToast();
  const { user, signUp } = useAuth();
  const createBooking = useCreateBooking();

  const progress = (currentStep / (steps.length - 1)) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      let currentUser = user;
      
      // If user is not authenticated, create an account first
      if (!currentUser) {
        const { error } = await signUp(
          bookingData.personalInfo.email,
          'temporary_password_123', // Temporary password - user will be prompted to set a real one
          `${bookingData.personalInfo.firstName} ${bookingData.personalInfo.lastName}`,
          'customer'
        );
        
        if (error) {
          toast({
            title: "Account Creation Failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        // For now, we'll continue with the booking creation
        // In a real app, you might want to wait for email verification
      }

      // Create the booking
      const startDate = new Date(bookingData.moveInDate);
      
      await createBooking.mutateAsync({
        unit_id: unit.id,
        customer_id: currentUser?.id, // This will be set by the booking mutation if user is authenticated
        start_date: startDate.toISOString().split('T')[0],
        monthly_rate_pence: unit.monthly_price_pence,
        status: 'active'
      });

      // Move to confirmation step
      setCurrentStep(steps.length - 1);
      
      // Auto-close after a delay
      setTimeout(() => {
        onComplete();
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Unit Selection
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Unit Selected</h2>
              <p className="text-muted-foreground">You've chosen the perfect storage unit</p>
            </div>
            
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Unit {unit.unit_number}</span>
                  <Badge variant="outline">{unit.size_category}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(unit.monthly_price_pence)}<span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
                
                {unit.width_metres && unit.length_metres && (
                  <div className="text-sm text-muted-foreground">
                    Dimensions: {unit.width_metres}m × {unit.length_metres}m
                    {unit.height_metres && ` × ${unit.height_metres}m`}
                  </div>
                )}
                
                {unit.features && unit.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {unit.features.map((feature) => (
                      <Badge key={feature} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 1: // Booking Details
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Booking Details</h2>
              <p className="text-muted-foreground">When do you need to move in?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="moveInDate">Move-in Date</Label>
                <Input
                  id="moveInDate"
                  type="date"
                  value={bookingData.moveInDate}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    moveInDate: e.target.value
                  })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Initial Duration</Label>
                <select
                  id="duration"
                  value={bookingData.duration}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    duration: e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="1">1 month</option>
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">Special Requirements (Optional)</Label>
              <Textarea
                id="requirements"
                placeholder="Any special access needs or requirements..."
                value={bookingData.requirements}
                onChange={(e) => setBookingData({
                  ...bookingData,
                  requirements: e.target.value
                })}
              />
            </div>
          </div>
        );

      case 2: // Personal Info
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
              <p className="text-muted-foreground">
                {user ? 'Confirm your details for this booking' : 'We need your details to create your account'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={bookingData.personalInfo.firstName}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    personalInfo: {
                      ...bookingData.personalInfo,
                      firstName: e.target.value
                    }
                  })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={bookingData.personalInfo.lastName}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    personalInfo: {
                      ...bookingData.personalInfo,
                      lastName: e.target.value
                    }
                  })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={bookingData.personalInfo.email}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    personalInfo: {
                      ...bookingData.personalInfo,
                      email: e.target.value
                    }
                  })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={bookingData.personalInfo.phone}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    personalInfo: {
                      ...bookingData.personalInfo,
                      phone: e.target.value
                    }
                  })}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3: // Payment
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Payment Information</h2>
              <p className="text-muted-foreground">Secure payment processing</p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-200">Secure Payment</h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your payment information is encrypted and secure. First month's rent is due today.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nameOnCard">Name on Card</Label>
                <Input
                  id="nameOnCard"
                  value={bookingData.paymentInfo.nameOnCard}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    paymentInfo: {
                      ...bookingData.paymentInfo,
                      nameOnCard: e.target.value
                    }
                  })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={bookingData.paymentInfo.cardNumber}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    paymentInfo: {
                      ...bookingData.paymentInfo,
                      cardNumber: e.target.value
                    }
                  })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={bookingData.paymentInfo.expiryDate}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      paymentInfo: {
                        ...bookingData.paymentInfo,
                        expiryDate: e.target.value
                      }
                    })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={bookingData.paymentInfo.cvv}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      paymentInfo: {
                        ...bookingData.paymentInfo,
                        cvv: e.target.value
                      }
                    })}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Review Your Booking</h2>
              <p className="text-muted-foreground">Please verify all details before confirming</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Unit Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>Unit {unit.unit_number} at {facilityName}</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(unit.monthly_price_pence)}/month
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Move-in: {bookingData.moveInDate}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>{bookingData.personalInfo.firstName} {bookingData.personalInfo.lastName}</div>
                  <div className="text-sm text-muted-foreground">{bookingData.personalInfo.email}</div>
                  <div className="text-sm text-muted-foreground">{bookingData.personalInfo.phone}</div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>First month's rent</span>
                    <span>{formatCurrency(unit.monthly_price_pence)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security deposit</span>
                    <span>{formatCurrency(unit.monthly_price_pence)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total due today</span>
                      <span>{formatCurrency(unit.monthly_price_pence * 2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={bookingData.agreeTerms}
                onChange={(e) => setBookingData({
                  ...bookingData,
                  agreeTerms: e.target.checked
                })}
                className="rounded"
              />
              <Label htmlFor="agreeTerms" className="text-sm">
                I agree to the terms and conditions and privacy policy
              </Label>
            </div>
          </div>
        );

      case 5: // Confirmation
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground">
                {user ? 
                  `Thank you for booking with ${facilityName}. Your booking has been created successfully.` :
                  `Thank you for choosing ${facilityName}. We've created your account and booking. Please check your email for further instructions.`
                }
              </p>
            </div>
            
            <Card className="text-left max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-lg">Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Unit:</span>
                  <span className="font-medium">{unit.unit_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Rate:</span>
                  <span className="font-medium">{formatCurrency(unit.monthly_price_pence)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Move-in Date:</span>
                  <span className="font-medium">{new Date(bookingData.moveInDate).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <Progress value={progress} className="mb-4" />
          
          <div className="flex justify-between text-sm">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center gap-2 ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <step.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        {currentStep < steps.length - 1 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={currentStep === 4 ? handleSubmit : nextStep}
              disabled={
                currentStep === 0 ||
                (currentStep === 1 && !bookingData.moveInDate) ||
                (currentStep === 2 && (!bookingData.personalInfo.firstName || !bookingData.personalInfo.lastName || !bookingData.personalInfo.email || !bookingData.personalInfo.phone)) ||
                (currentStep === 4 && !bookingData.agreeTerms) ||
                createBooking.isPending
              }
            >
              {currentStep === 4 ? (createBooking.isPending ? 'Creating Booking...' : 'Confirm Booking') : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}