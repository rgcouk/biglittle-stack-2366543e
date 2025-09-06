import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default: "shadow-card",
        elevated: "shadow-elevated hover:shadow-intense",
        gradient: "bg-gradient-card border-border/50",
        modern: "bg-gradient-subtle border-border/30 hover:shadow-modern",
        glow: "shadow-glow border-primary/20",
        interactive: "hover:shadow-elevated hover:scale-[1.02] cursor-pointer active:scale-100",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, padding, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, padding }), className)}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    centered?: boolean
  }
>(({ className, centered, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      centered && "text-center items-center",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: "sm" | "default" | "lg" | "xl"
  }
>(({ className, size = "default", ...props }, ref) => {
  const sizeClasses = {
    sm: "text-base font-semibold",
    default: "text-2xl font-semibold leading-none tracking-tight",
    lg: "text-3xl font-bold leading-none tracking-tight",
    xl: "text-4xl font-bold leading-none tracking-tight",
  }
  
  return (
    <div
      ref={ref}
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: "sm" | "default" | "lg"
  }
>(({ className, size = "default", ...props }, ref) => {
  const sizeClasses = {
    sm: "text-xs text-muted-foreground",
    default: "text-sm text-muted-foreground",
    lg: "text-base text-muted-foreground",
  }
  
  return (
    <div
      ref={ref}
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  )
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    padding?: "none" | "sm" | "default" | "lg"
  }
>(({ className, padding = "default", ...props }, ref) => {
  const paddingClasses = {
    none: "",
    sm: "p-4 pt-0",
    default: "p-6 pt-0",
    lg: "p-8 pt-0",
  }
  
  return (
    <div
      ref={ref}
      className={cn(paddingClasses[padding], className)}
      {...props}
    />
  )
})
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    centered?: boolean
  }
>(({ className, centered, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      centered && "justify-center",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Enhanced Cards for specific use cases
interface EnhancedCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ComponentType<{ className?: string }>;
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
      <Card className={cn('animate-pulse', className)} variant="elevated">
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
      variant={highlight ? "glow" : onClick ? "interactive" : "modern"}
      className={cn(className)}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle size="sm" className="text-sm font-medium text-muted-foreground">
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
          <div
            className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              getTrendColor(change.trend)
            )}
          >
            {change.trend === 'up' ? '↗' : change.trend === 'down' ? '↘' : '→'} {change.label}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  cardVariants
}