import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Users, 
  CreditCard, 
  Building2, 
  FileX, 
  Search,
  Plus,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = FileX,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="mb-4 rounded-full bg-muted p-4 animate-fade-in">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-muted-foreground">{description}</p>
      {action && (
        <Button 
          onClick={action.onClick} 
          variant={action.variant || 'default'}
          className="animate-fade-in"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Pre-built empty states for common scenarios
export function NoUnitsEmpty({ onCreateUnit }: { onCreateUnit: () => void }) {
  return (
    <EmptyState
      icon={Package}
      title="No storage units found"
      description="Get started by creating your first storage unit to begin managing your facility."
      action={{
        label: "Create First Unit",
        onClick: onCreateUnit
      }}
    />
  );
}

export function NoCustomersEmpty({ onInviteCustomer }: { onInviteCustomer: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No customers yet"
      description="Your customer list is empty. Start by inviting customers or wait for bookings to come in."
      action={{
        label: "Invite Customer",
        onClick: onInviteCustomer,
        variant: "outline"
      }}
    />
  );
}

export function NoPaymentsEmpty() {
  return (
    <EmptyState
      icon={CreditCard}
      title="No payments recorded"
      description="Payment history will appear here once customers start making payments for their storage units."
    />
  );
}

export function NoBookingsEmpty() {
  return (
    <EmptyState
      icon={Building2}
      title="No bookings found"
      description="Your booking history is empty. New bookings will appear here when customers rent units."
    />
  );
}

export function SearchEmpty({ 
  searchTerm, 
  onClearSearch 
}: { 
  searchTerm: string; 
  onClearSearch: () => void; 
}) {
  return (
    <EmptyState
      icon={Search}
      title={`No results for "${searchTerm}"`}
      description="Try adjusting your search terms or clear the search to see all items."
      action={{
        label: "Clear Search",
        onClick: onClearSearch,
        variant: "outline"
      }}
    />
  );
}

export function ErrorEmpty({ 
  title = "Something went wrong",
  description = "We encountered an error loading this content. Please try again.",
  onRetry 
}: { 
  title?: string;
  description?: string;
  onRetry?: () => void; 
}) {
  return (
    <EmptyState
      icon={RefreshCw}
      title={title}
      description={description}
      action={onRetry ? {
        label: "Try Again",
        onClick: onRetry,
        variant: "outline"
      } : undefined}
    />
  );
}

// Empty state card wrapper
export function EmptyStateCard({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardContent className="p-0">
        {children}
      </CardContent>
    </Card>
  );
}