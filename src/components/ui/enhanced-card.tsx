import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EnhancedCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: LucideIcon;
  className?: string;
  loading?: boolean;
  onClick?: () => void;
  highlight?: boolean;
}

export function EnhancedCard({
  title,
  value,
  change,
  icon: Icon,
  className,
  loading,
  onClick,
  highlight
}: EnhancedCardProps) {
  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950';
      case 'down':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-muted rounded w-20"></div>
          {Icon && <div className="h-4 w-4 bg-muted rounded"></div>}
        </CardHeader>
        <CardContent>
          <div className="h-7 bg-muted rounded w-16 mb-1"></div>
          <div className="h-3 bg-muted rounded w-24"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:shadow-md',
        highlight && 'ring-2 ring-primary/20 shadow-lg',
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="p-1 rounded-md bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {change && (
          <Badge
            variant="secondary"
            className={cn(
              'text-xs font-medium',
              getTrendColor(change.trend)
            )}
          >
            {change.trend === 'up' ? '↗' : change.trend === 'down' ? '↘' : '→'} {change.label}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized cards for common use cases
export function RevenueCard({ value, change, loading }: {
  value: number;
  change?: EnhancedCardProps['change'];
  loading?: boolean;
}) {
  return (
    <EnhancedCard
      title="Monthly Revenue"
      value={new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
      }).format(value / 100)}
      change={change}
      loading={loading}
      highlight={change?.trend === 'up'}
    />
  );
}

export function OccupancyCard({ value, change, loading }: {
  value: number;
  change?: EnhancedCardProps['change'];
  loading?: boolean;
}) {
  return (
    <EnhancedCard
      title="Occupancy Rate"
      value={`${value.toFixed(1)}%`}
      change={change}
      loading={loading}
      highlight={value >= 90}
    />
  );
}