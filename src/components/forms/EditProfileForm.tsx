import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useProfile, useUpdateProfile } from '@/hooks/useProfiles';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

export function EditProfileForm() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.display_name || '',
      phone: profile?.phone || '',
      companyName: profile?.company_name || '',
    },
  });

  // Update form when profile data loads
  if (profile && !form.formState.isDirty) {
    form.reset({
      displayName: profile.display_name || '',
      phone: profile.phone || '',
      companyName: profile.company_name || '',
    });
  }

  const onSubmit = async (data: ProfileData) => {
    try {
      await updateProfile.mutateAsync({
        display_name: data.displayName,
        phone: data.phone || null,
        company_name: data.companyName || null,
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., +44 7700 900000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {profile?.role === 'provider' && (
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}