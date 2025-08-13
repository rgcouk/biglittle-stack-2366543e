import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Package, Calendar, User, Home, LogOut, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const CustomerLayout = () => {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const navigation = [
    { name: 'Dashboard', href: '/customer', icon: Home },
    { name: 'My Bookings', href: '/customer/bookings', icon: Package },
    { name: 'Payment History', href: '/customer/payments', icon: Calendar },
    { name: 'Profile', href: '/customer/profile', icon: User },
  ]

  const isActive = (href: string) => {
    if (href === '/customer') {
      return location.pathname === '/customer'
    }
    return location.pathname.startsWith(href)
  }

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn("space-y-2", mobile && "px-4")}>
      {navigation.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => mobile && setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col h-full">
                  <div className="pb-4 border-b">
                    <h2 className="text-lg font-semibold">BigLittleBox</h2>
                    <p className="text-sm text-muted-foreground">Customer Portal</p>
                  </div>
                  <div className="flex-1 py-4">
                    <NavLinks mobile />
                  </div>
                  <div className="border-t pt-4 px-4">
                    <Button 
                      variant="ghost" 
                      onClick={signOut}
                      className="w-full justify-start"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/customer" className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">BigLittleBox</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link to="/">Browse Storage</Link>
            </Button>
            
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Welcome,</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            
            <Button variant="ghost" onClick={signOut} className="hidden md:flex">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6">Customer Portal</h2>
            <NavLinks />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default CustomerLayout