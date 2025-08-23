import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  CreditCard,
  FileText,
  User,
  Building2,
  Phone,
  Settings,
  Bell,
  HelpCircle
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const navigationItems = [
  {
    group: 'My Storage',
    items: [
      { title: 'Dashboard', url: '/customer', icon: Home, exact: true },
      { title: 'My Bookings', url: '/customer/bookings', icon: Calendar },
      { title: 'Payments', url: '/customer/payments', icon: CreditCard },
      { title: 'Documents', url: '/customer/documents', icon: FileText },
    ]
  },
  {
    group: 'Account',
    items: [
      { title: 'Profile', url: '/customer/profile', icon: User },
      { title: 'Settings', url: '/customer/settings', icon: Settings },
    ]
  },
  {
    group: 'Support',
    items: [
      { title: 'Contact Facility', url: '/customer/contact', icon: Phone },
      { title: 'Help Center', url: '/customer/help', icon: HelpCircle },
    ]
  }
];

export function CustomerSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (url: string, exact = false) => {
    if (exact) {
      return currentPath === url;
    }
    return currentPath.startsWith(url);
  };

  const getNavClassName = (url: string, exact = false) => {
    const active = isActive(url, exact);
    return active 
      ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' 
      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground';
  };

  return (
    <Sidebar
      className={collapsed ? 'w-14' : 'w-64'}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">My Storage</h2>
                <p className="text-xs text-muted-foreground">SecureStore Downtown</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
            </div>
          )}
        </div>

        {/* Current Unit Info */}
        {!collapsed && (
          <div className="p-4 bg-muted/30">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Unit A-101</span>
                <Badge variant="default" className="text-xs">Active</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Next payment: Feb 15, 2024</p>
                <p>£150.00/month</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        {navigationItems.map((group) => (
          <SidebarGroup key={group.group}>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-2">
                {group.group}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={getNavClassName(item.url, item.exact)}
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className={`h-4 w-4 ${collapsed ? '' : 'mr-3'}`} />
                        {!collapsed && (
                          <span className="truncate">{item.title}</span>
                        )}
                        {!collapsed && item.title === 'Payments' && (
                          <Badge variant="destructive" className="ml-auto text-xs">
                            1
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Quick Actions */}
        {!collapsed && (
          <div className="p-4 space-y-2">
            <Button variant="outline" className="w-full justify-start text-sm">
              <Phone className="h-4 w-4 mr-2" />
              Emergency Access
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm">
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Now
            </Button>
          </div>
        )}

        {/* Notifications */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-2">
              Recent Notifications
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-4 py-2 space-y-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="h-3 w-3 text-blue-500" />
                    <span className="font-medium text-blue-900 dark:text-blue-200">Payment Due</span>
                  </div>
                  <p className="text-blue-700 dark:text-blue-300">Payment due in 3 days</p>
                </div>
                
                <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="h-3 w-3 text-green-500" />
                    <span className="font-medium text-green-900 dark:text-green-200">Access Granted</span>
                  </div>
                  <p className="text-green-700 dark:text-green-300">Unit accessed at 2:30 PM</p>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}