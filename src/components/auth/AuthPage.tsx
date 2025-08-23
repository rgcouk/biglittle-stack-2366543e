import { useState, useEffect } from "react"
import { useNavigate, useSearchParams, Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { useUserRole } from "@/hooks/useUserRole"
import { useFacilityContext } from "@/hooks/useFacilityContext"
import { ArrowLeft, Building, Users, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { forceAuthRefresh } from "@/utils/authUtils"

const AuthPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("signin")
  const [searchParams] = useSearchParams()
  
  const { user, signUp, signIn } = useAuth()
  const { data: userRole, refetch: refetchRole } = useUserRole()
  const { facilityId, isSubdomain } = useFacilityContext()
  const navigate = useNavigate()
  const { toast } = useToast()
  const location = useLocation()
  
  // Extract authType, facility, and redirect from query parameters
  const authType = searchParams.get("type") // 'provider' or 'customer'
  const facilityParam = searchParams.get('facility')
  const isSignup = searchParams.get('signup') === 'true'
  const redirectPath = searchParams.get("redirect")

  const isProviderAuth = authType === 'provider'
  const isCustomerAuth = authType === 'customer'
  const isFacilityCustomer = isCustomerAuth && (facilityParam || isSubdomain)

  const handleRefreshAuth = async () => {
    setIsLoading(true);
    try {
      await forceAuthRefresh();
      await refetchRole();
      toast({
        title: "Auth Refreshed",
        description: "Authentication state has been refreshed"
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh authentication",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && userRole) {
      // User is authenticated, redirect based on role
      console.log('AuthPage redirect logic - User:', user.id, 'Role:', userRole);
      
      if (userRole === 'provider') {
        console.log('Redirecting to provider dashboard');
        navigate("/provider");
      } else if (userRole === 'customer') {
        console.log('Redirecting to customer dashboard');
        navigate(redirectPath || "/customer");
      } else {
        console.log('Role not recognized, redirecting to home. Role:', userRole);
        // Default redirect
        navigate("/");
      }
    }
  }, [user, userRole, navigate, redirectPath])

  useEffect(() => {
    // If authType is specified or signup is requested, default to signup
    if (authType || isSignup) {
      setActiveTab("signup")
    }
  }, [authType, isSignup])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Determine role based on context: customers only on subdomains, providers on main domain
      const role = isSubdomain ? 'customer' : 'provider'
      const targetFacilityId = facilityParam || facilityId
      
      const { error } = await signUp(
        email, 
        password, 
        displayName, 
        role,
        isSubdomain ? targetFacilityId : undefined
      )
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTitle = () => {
    if (isFacilityCustomer) return "Join This Storage Facility"
    if (isSubdomain && !authType) return "Customer Access"
    return "Provider Authentication"
  }

  const getDescription = () => {
    if (isFacilityCustomer) return "Sign up to book storage units at this facility"
    if (isSubdomain && !authType) return "Sign in to manage your storage bookings at this facility"
    return "Join as a storage provider to manage your facilities and grow your business"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-6">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button variant="ghost" asChild className="text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card className="shadow-elevated">
          <CardHeader className="text-center space-y-4">
            {isSubdomain ? (
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                <Users className="h-8 w-8 text-primary" />
              </div>
            ) : (
              <div className="mx-auto p-3 bg-accent/10 rounded-full w-fit">
                <Building className="h-8 w-8 text-accent" />
              </div>
            )}
            
            <div>
              <CardTitle className="text-2xl">{getTitle()}</CardTitle>
              <CardDescription>{getDescription()}</CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {isSubdomain ? (
                      <>You're signing up as a <strong>customer</strong> for this facility. You'll be able to book storage units here.</>
                    ) : (
                      <>You're signing up as a <strong>provider</strong>. You'll be able to list and manage storage facilities.</>
                    )}
                  </AlertDescription>
                </Alert>
                
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Display Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : `Sign Up as ${isSubdomain ? 'Customer' : 'Provider'}`}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

          </CardContent>
        </Card>

        {/* Debug section - show current auth state */}
        {user && (
          <Card className="mt-4 bg-yellow-50 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Debug: Current Auth State</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Role:</strong> {userRole || 'Loading...'}</p>
              <p><strong>Current Route:</strong> {location.pathname}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefreshAuth}
                disabled={isLoading}
                className="w-full mt-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {isLoading ? "Refreshing..." : "Refresh Auth State"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default AuthPage