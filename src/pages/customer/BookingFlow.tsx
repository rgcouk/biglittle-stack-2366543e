import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Calendar, CreditCard, FileText, User } from "lucide-react"
import { Link, useParams } from "react-router-dom"

export default function BookingFlow() {
  const { providerId = "demo-storage", unitId = "U001" } = useParams()
  const [step, setStep] = useState(1)

  const unit = {
    id: unitId,
    size: "5x10",
    price: 65,
    type: "Standard"
  }

  const steps = [
    { id: 1, title: "Personal Information", icon: User },
    { id: 2, title: "Lease Terms", icon: FileText },
    { id: 3, title: "Payment", icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link to={`/storefront/${providerId}/unit/${unitId}`} className="flex items-center space-x-2 text-primary">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm text-muted-foreground">Back to Unit Details</span>
            </Link>
            <div className="w-px h-6 bg-border" />
            <h1 className="text-2xl font-bold">Reserve Unit {unit.id}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((stepItem, index) => (
            <div key={stepItem.id} className="flex items-center">
              <div className={`flex items-center space-x-2 ${
                step >= stepItem.id ? "text-primary" : "text-muted-foreground"
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepItem.id ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <stepItem.icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{stepItem.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-px mx-4 ${
                  step > stepItem.id ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>{steps[step - 1].title}</CardTitle>
                <CardDescription>
                  {step === 1 && "Please provide your contact information"}
                  {step === 2 && "Review and configure your lease terms"}
                  {step === 3 && "Complete your reservation with payment"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Smith" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="john@example.com" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="(555) 123-4567" />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea id="address" placeholder="123 Main St, City, State 12345" />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="startDate">Move-in Date</Label>
                      <Input id="startDate" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input id="emergencyContact" placeholder="Name and phone number" />
                    </div>
                    <div className="space-y-3">
                      <Label>Additional Options</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="insurance" />
                          <label htmlFor="insurance" className="text-sm">
                            Storage insurance ($10/month)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="lock" />
                          <label htmlFor="lock" className="text-sm">
                            High-security lock ($25 one-time)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="billingAddress">Billing Address</Label>
                      <Textarea id="billingAddress" placeholder="Same as above or different address" />
                    </div>
                  </div>
                )}

                <div className="flex space-x-4 pt-6">
                  {step > 1 && (
                    <Button variant="outline" onClick={() => setStep(step - 1)}>
                      Previous
                    </Button>
                  )}
                  <Button 
                    className="bg-gradient-primary hover:opacity-90 flex-1"
                    onClick={() => step < 3 ? setStep(step + 1) : null}
                  >
                    {step === 3 ? "Complete Reservation" : "Continue"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="shadow-card sticky top-8">
              <CardHeader>
                <CardTitle>Reservation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Unit {unit.id}</span>
                    <span>{unit.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type</span>
                    <span>{unit.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Rent</span>
                    <span>${unit.price}</span>
                  </div>
                </div>
                
                <hr />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>First Month</span>
                    <span>${unit.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Deposit</span>
                    <span>${unit.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admin Fee</span>
                    <span>$25</span>
                  </div>
                </div>
                
                <hr />
                
                <div className="flex justify-between font-bold">
                  <span>Total Due Today</span>
                  <span>${unit.price * 2 + 25}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}