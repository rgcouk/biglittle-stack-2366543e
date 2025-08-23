import React from 'react';
import { ChevronRight, Home, Building2, Users, CreditCard, BarChart3, Settings, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface EnhancedBreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const routeConfig: Record<string, { label: string; icon?: React.ComponentType<{ className?: string }> }> = {
  '/provider': { label: 'Dashboard', icon: Home },
  '/provider/units': { label: 'Units', icon: Package },
  '/provider/customers': { label: 'Customers', icon: Users },
  '/provider/analytics': { label: 'Analytics', icon: BarChart3 },
  '/provider/billing': { label: 'Billing', icon: CreditCard },
  '/provider/customization': { label: 'Advanced Hub', icon: Settings },
  '/provider/settings': { label: 'Settings', icon: Settings },
  '/customer': { label: 'Dashboard', icon: Home },
  '/customer/bookings': { label: 'Bookings', icon: Package },
  '/customer/payments': { label: 'Payments', icon: CreditCard },
  '/facility': { label: 'Storefront', icon: Building2 },
};

export function EnhancedBreadcrumbs({ items, className }: EnhancedBreadcrumbsProps) {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from current path if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Use route config if available, otherwise convert segment
      const config = routeConfig[currentPath];
      const label = config?.label || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Don't add href for the last item (current page)
      const href = index === pathSegments.length - 1 ? undefined : currentPath;
      
      breadcrumbs.push({ 
        label, 
        href,
        icon: config?.icon
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)}>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center">
            {item.href ? (
              <Link
                to={item.href}
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted/50"
              >
                {item.icon && <item.icon className="h-3 w-3 mr-1" />}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center text-foreground font-medium px-2 py-1">
                {item.icon && <item.icon className="h-3 w-3 mr-1" />}
                {item.label}
              </span>
            )}
          </div>
          
          {index < breadcrumbItems.length - 1 && (
            <ChevronRight className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}