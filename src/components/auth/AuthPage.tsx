import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already logged in, redirect to appropriate dashboard
  if (user && !loading) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    await signIn(email, password);
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayName = formData.get('displayName') as string;
    const role = formData.get('role') as string;
    
    await signUp(email, password, displayName, role);
    setIsSubmitting(false);
  };

  const handleDemoLogin = async (role: 'customer' | 'provider') => {
    setIsSubmitting(true);
    const demoCredentials = {
      customer: { 
        email: 'demo.customer@biglittlebox.com', 
        password: 'demo123',
        displayName: 'Demo Customer',
        company: null
      },
      provider: { 
        email: 'demo.provider@biglittlebox.com', 
        password: 'demo123',
        displayName: 'Demo Provider',
        company: 'Total Storage Boston'
      }
    };
    
    const { email, password, displayName, company } = demoCredentials[role];
    
    // Try to sign in first
    const { error: signInError } = await signIn(email, password);
    
    if (signInError) {
      // If sign in fails, try to sign up the demo account
      const { error: signUpError } = await signUp(email, password, displayName, role);
      
      if (signUpError) {
        toast({
          title: "Demo Login Failed",
          description: "Could not create or access demo account. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Demo Account Created",
          description: `Demo ${role} account created and logged in successfully.`,
        });
      }
    } else {
      toast({
        title: "Demo Login Successful",
        description: `Logged in as demo ${role}.`,
      });
    }
    
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">SecureStore</CardTitle>
          <CardDescription>Access your storage account</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Demo Login Section */}
          <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-sm text-primary mb-3">Quick Demo Access</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleDemoLogin('customer')}
                disabled={isSubmitting}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Demo Customer'}
              </Button>
              <Button
                onClick={() => handleDemoLogin('provider')}
                disabled={isSubmitting}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Demo Provider'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use demo accounts to explore the platform features
            </p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
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
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Display Name</Label>
                  <Input
                    id="signup-name"
                    name="displayName"
                    type="text"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-role">Account Type</Label>
                  <Select name="role" defaultValue="customer">
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="provider">Storage Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}