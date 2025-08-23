import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Calendar, CreditCard, User, Settings, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface MobileNavigationProps {
  userType: 'provider' | 'customer';
  userName?: string;
}

const providerNavItems: NavigationItem[] = [
  { label: 'Dashboard', href: '/provider', icon: Home },
  { label: 'Units', href: '/provider/units', icon: Building2 },
  { label: 'Customers', href: '/provider/customers', icon: User },
  { label: 'Analytics', href: '/provider/analytics', icon: Calendar },
  { label: 'Billing', href: '/provider/billing', icon: CreditCard },
  { label: 'Settings', href: '/provider/settings', icon: Settings },
];

const customerNavItems: NavigationItem[] = [
  { label: 'Dashboard', href: '/customer', icon: Home },
  { label: 'Bookings', href: '/customer/bookings', icon: Calendar },
  { label: 'Payments', href: '/customer/payments', icon: CreditCard, badge: '1' },
  { label: 'Profile', href: '/customer/profile', icon: User },
  { label: 'Settings', href: '/customer/settings', icon: Settings },
];

export function MobileNavigation({ userType, userName }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const navItems = userType === 'provider' ? providerNavItems : customerNavItems;
  
  const isActive = (href: string) => {
    if (href === '/provider' || href === '/customer') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="flex items-center gap-3 text-left">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">
                  {userType === 'provider' ? 'Provider Portal' : 'My Storage'}
                </p>
                <p className="text-sm text-muted-foreground font-normal">
                  {userName || (userType === 'provider' ? 'Manage facility' : 'SecureStore Downtown')}
                </p>
              </div>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 py-6">
            <div className="space-y-1 px-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>

            {/* Quick Stats for Provider */}
            {userType === 'provider' && (
              <div className="mt-8 px-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Quick Stats
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active Units</span>
                    <Badge variant="outline">24</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Customers</span>
                    <Badge variant="outline">18</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Occupancy</span>
                    <Badge variant="default">87%</Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Current Unit Info for Customer */}
            {userType === 'customer' && (
              <div className="mt-8 px-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Current Unit
                </h3>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Unit A-101</span>
                    <Badge variant="default" className="text-xs">Active</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Next payment: Feb 15, 2024</p>
                    <p>£150.00/month</p>
                  </div>
                </div>
              </div>
            )}
          </nav>

          <div className="border-t p-6">
            <Button variant="outline" className="w-full justify-start">
              <User className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}