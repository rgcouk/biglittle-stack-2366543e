import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Building2 } from 'lucide-react';

export default function FacilityOnboarding() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const facilityData = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      postcode: formData.get('postcode') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      description: formData.get('description') as string,
    };

    try {
      // Get user's role using the function
      const { data: userRole, error: roleError } = await supabase
        .rpc('get_current_user_role');

      if (roleError) throw roleError;

      if (userRole !== 'provider') {
        throw new Error('Only providers can create facilities');
      }

      // Create the facility - provider_id will be set automatically via trigger
      const { data: facility, error: facilityError } = await supabase
        .from('facilities')
        .insert({
          ...facilityData,
          provider_id: '00000000-0000-0000-0000-000000000000' // Placeholder, will be set by trigger
        })
        .select()
        .single();

      if (facilityError) throw facilityError;

      toast({
        title: "Facility Created!",
        description: "Your storage facility has been set up successfully.",
      });

      navigate('/provider');
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to create facility",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Set Up Your Storage Facility</CardTitle>
          <CardDescription>
            Welcome to BigLittleBox! Let's get your storage facility set up so customers can start booking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Facility Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Downtown Storage Center"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="01234 567890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Storage Street, City"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode *</Label>
                <Input
                  id="postcode"
                  name="postcode"
                  placeholder="SW1A 1AA"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contact@yourstorage.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Tell customers about your facility, security features, access hours, etc."
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Facility...
                </>
              ) : (
                'Create My Storage Facility'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}