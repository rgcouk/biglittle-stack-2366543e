import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToastNotificationProps {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss: () => void;
}

export function ToastNotification({
  id,
  title,
  description,
  type,
  action,
  onDismiss
}: ToastNotificationProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-900 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-900 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-900 dark:text-yellow-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-200'
  };

  const Icon = icons[type];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={cn(
      'p-4 border rounded-lg shadow-lg animate-in slide-in-from-right-full duration-300',
      colors[type]
    )}>
      <div className="flex items-start">
        <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          {description && (
            <p className="mt-1 text-sm opacity-90">{description}</p>
          )}
          {action && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-auto p-0 font-medium underline"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 ml-2"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Enhanced toast utilities
export const enhancedToast = {
  success: (title: string, options?: { description?: string; action?: { label: string; onClick: () => void } }) => {
    const { toast } = useToast();
    return toast({
      title,
      description: options?.description,
      variant: 'default',
    });
  },

  error: (title: string, options?: { description?: string; action?: { label: string; onClick: () => void } }) => {
    const { toast } = useToast();
    return toast({
      title,
      description: options?.description,
      variant: 'destructive',
    });
  },

  warning: (title: string, options?: { description?: string; action?: { label: string; onClick: () => void } }) => {
    const { toast } = useToast();
    return toast({
      title,
      description: options?.description,
      variant: 'default',
    });
  },

  info: (title: string, options?: { description?: string; action?: { label: string; onClick: () => void } }) => {
    const { toast } = useToast();
    return toast({
      title,
      description: options?.description,
      variant: 'default',
    });
  },

  promise: (
    promise: Promise<any>,
    messages: {
      loading: string;
      success: string | ((data: any) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    const { toast } = useToast();
    
    const loadingToast = toast({
      title: messages.loading,
      description: "Please wait...",
    });

    return promise
      .then((data) => {
        loadingToast.dismiss();
        toast({
          title: typeof messages.success === 'function' ? messages.success(data) : messages.success,
          variant: 'default',
        });
        return data;
      })
      .catch((error) => {
        loadingToast.dismiss();
        toast({
          title: typeof messages.error === 'function' ? messages.error(error) : messages.error,
          variant: 'destructive',
        });
        throw error;
      });
  }
};