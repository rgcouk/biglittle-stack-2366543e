import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  BarChart3,
  CreditCard,
  Settings,
  Home,
  Package,
  Bell,
  Palette,
  FileText,
  Shield
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
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

const navigationItems = [
  {
    group: 'Overview',
    items: [
      { title: 'Dashboard', url: '/provider', icon: Home, exact: true },
      { title: 'Analytics', url: '/provider/analytics', icon: BarChart3 },
    ]
  },
  {
    group: 'Management',
    items: [
      { title: 'Units', url: '/provider/units', icon: Package },
      { title: 'Customers', url: '/provider/customers', icon: Users },
      { title: 'Billing', url: '/provider/billing', icon: CreditCard },
    ]
  },
  {
    group: 'Advanced',
    items: [
      { title: 'Advanced Hub', url: '/provider/customization', icon: Palette },
      { title: 'Settings', url: '/provider/settings', icon: Settings },
    ]
  }
];

export function ProviderSidebar() {
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
                <h2 className="font-semibold text-sm">Provider Portal</h2>
                <p className="text-xs text-muted-foreground">Manage your facility</p>
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
                        {!collapsed && item.title === 'Advanced Hub' && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            New
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

        {/* Quick Stats */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-2">
              Quick Stats
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-4 py-2 space-y-3">
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
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Footer */}
        <div className="mt-auto p-4 border-t">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium">Storage Pro</p>
                <p className="text-xs text-muted-foreground">Premium Plan</p>
              </div>
              <Shield className="h-4 w-4 text-green-500" />
            </div>
          ) : (
            <div className="flex justify-center">
              <Shield className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}