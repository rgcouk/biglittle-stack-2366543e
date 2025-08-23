import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Building, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function FacilityOnboarding() {
  const { user } = useAuth();
  const { data: userRole } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    address: "",
    postcode: "",
    phone: "",
    email: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subdomainError, setSubdomainError] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate subdomain from facility name
    if (field === 'name') {
      const subdomain = value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 30);
      setFormData(prev => ({ ...prev, subdomain }));
    }
    
    // Clear subdomain error when user types
    if (field === 'subdomain') {
      setSubdomainError("");
    }
  };

  const validateSubdomain = (subdomain: string) => {
    if (!subdomain) return "Subdomain is required";
    if (subdomain.length < 3) return "Subdomain must be at least 3 characters";
    if (subdomain.length > 30) return "Subdomain must be less than 30 characters";
    if (!/^[a-z0-9-]+$/.test(subdomain)) return "Subdomain can only contain lowercase letters, numbers, and hyphens";
    if (subdomain.startsWith('-') || subdomain.endsWith('-')) return "Subdomain cannot start or end with a hyphen";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userRole !== "provider") {
      toast({
        title: "Access Denied",
        description: "Only providers can create facilities.",
        variant: "destructive",
      });
      return;
    }

    // Validate subdomain
    const subdomainValidationError = validateSubdomain(formData.subdomain);
    if (subdomainValidationError) {
      setSubdomainError(subdomainValidationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if subdomain is already taken
      const { data: existingFacility, error: checkError } = await supabase
        .from('facilities')
        .select('id')
        .eq('subdomain', formData.subdomain)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingFacility) {
        setSubdomainError("This subdomain is already taken");
        setIsSubmitting(false);
        return;
      }

      // Get the provider profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .eq('role', 'provider')
        .single();

      if (profileError) {
        throw new Error("Provider profile not found");
      }

      // Insert facility data
      const { error: insertError } = await supabase
        .from('facilities')
        .insert({
          name: formData.name,
          subdomain: formData.subdomain,
          address: formData.address,
          postcode: formData.postcode,
          phone: formData.phone || null,
          email: formData.email || null,
          description: formData.description || null,
          provider_id: profile.id
        });

      if (insertError) throw insertError;

      toast({
        title: "Facility created!",
        description: `Your facility is now available at ${formData.subdomain}.biglittlebox.io`,
      });

      // Force a page reload to clear all cached auth state and redirect
      window.location.href = '/provider';
      
    } catch (error: any) {
      console.error('Facility creation error:', error);
      toast({
        title: "Error creating facility",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-6">
      <Card className="w-full max-w-2xl shadow-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-lg w-fit">
            <Building className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Set up your storage facility</CardTitle>
          <CardDescription>
            Create your facility profile and get your customer portal at {formData.subdomain || 'yourfacility'}.biglittlebox.io
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="facility-name">Facility Name *</Label>
              <Input
                id="facility-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g. Downtown Storage Center"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">Customer Portal URL *</Label>
              <div className="flex items-center">
                <Input
                  id="subdomain"
                  value={formData.subdomain}
                  onChange={(e) => handleInputChange('subdomain', e.target.value)}
                  placeholder="yourfacility"
                  required
                  disabled={isSubmitting}
                  className={subdomainError ? "border-destructive" : ""}
                />
                <span className="ml-2 text-sm text-muted-foreground whitespace-nowrap">
                  .biglittlebox.io
                </span>
              </div>
              {subdomainError && (
                <p className="text-sm text-destructive">{subdomainError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Your customers will book storage at this URL
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Street address"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode *</Label>
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={(e) => handleInputChange('postcode', e.target.value)}
                placeholder="Postcode"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Contact phone number"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Contact email for customers"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your storage facility..."
                disabled={isSubmitting}
                rows={3}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:opacity-90" 
              size="lg"
              disabled={isSubmitting || !formData.name || !formData.subdomain || !formData.address || !formData.postcode}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating facility...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Create Facility & Get URL
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}