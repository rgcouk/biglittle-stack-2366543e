import { Button } from "@/components/ui/button"
import { Home, LogIn, LogOut, Settings, User } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useUserRole } from "@/hooks/useUserRole"

export function Navigation() {
  const { user, signOut } = useAuth()
  const { data: userRole } = useUserRole()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">BigLittleBox</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={userRole === 'provider' ? '/provider' : '/customer'}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                
                {userRole === 'provider' && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/provider/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </Button>
                )}
                
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth?type=customer">Find Storage</Link>
                </Button>
                
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth?type=provider">
                    <Settings className="mr-2 h-4 w-4" />
                    For Providers
                  </Link>
                </Button>
                
                <Button size="sm" asChild>
                  <Link to="/auth">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}