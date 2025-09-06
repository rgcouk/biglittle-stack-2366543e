import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  action: string;
  timestamp: string;
  details: Record<string, any>;
}

export function useSecurityMonitoring() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Monitor for suspicious authentication patterns
    const monitorAuth = () => {
      let failedAttempts = 0;
      const maxAttempts = 5;
      
      const originalSignIn = supabase.auth.signInWithPassword;
      supabase.auth.signInWithPassword = async (credentials) => {
        try {
          const result = await originalSignIn.call(supabase.auth, credentials);
          
          if (result.error) {
            failedAttempts++;
            
            if (failedAttempts >= maxAttempts) {
              toast({
                title: "Security Alert",
                description: "Multiple failed login attempts detected. Please wait before trying again.",
                variant: "destructive"
              });
              
              // Log security event
              logSecurityEvent('EXCESSIVE_LOGIN_FAILURES', {
                attempts: failedAttempts,
                identifier: 'email' in credentials ? credentials.email : credentials.phone
              });
            }
          } else {
            failedAttempts = 0; // Reset on successful login
          }
          
          return result;
        } catch (error) {
          failedAttempts++;
          throw error;
        }
      };
    };

    // Monitor for suspicious page access patterns
    const monitorPageAccess = () => {
      let pageViews = 0;
      const maxPageViews = 50;
      const timeWindow = 60000; // 1 minute
      
      const startTime = Date.now();
      
      const trackPageView = () => {
        pageViews++;
        
        if (Date.now() - startTime < timeWindow && pageViews > maxPageViews) {
          logSecurityEvent('SUSPICIOUS_PAGE_ACCESS', {
            pageViews,
            timeWindow: timeWindow / 1000,
            userAgent: navigator.userAgent
          });
          
          toast({
            title: "Security Alert",
            description: "Unusual browsing pattern detected.",
            variant: "destructive"
          });
        }
      };
      
      // Track navigation
      window.addEventListener('popstate', trackPageView);
      
      return () => {
        window.removeEventListener('popstate', trackPageView);
      };
    };

    // Monitor for potentially malicious input
    const monitorInputs = () => {
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /SELECT.*FROM/i,
        /UNION.*SELECT/i,
        /DROP.*TABLE/i
      ];
      
      const checkInput = (event: Event) => {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
          const value = target.value;
          
          const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
            pattern.test(value)
          );
          
          if (hasSuspiciousContent) {
            logSecurityEvent('SUSPICIOUS_INPUT_DETECTED', {
              inputType: target.type || target.tagName,
              pattern: 'XSS/SQL_INJECTION_ATTEMPT',
              fieldName: target.name || target.id
            });
            
            // Clear the suspicious input
            target.value = '';
            
            toast({
              title: "Security Alert",
              description: "Potentially malicious input detected and blocked.",
              variant: "destructive"
            });
          }
        }
      };
      
      document.addEventListener('input', checkInput);
      
      return () => {
        document.removeEventListener('input', checkInput);
      };
    };

    // Initialize monitoring
    monitorAuth();
    const cleanupPageMonitor = monitorPageAccess();
    const cleanupInputMonitor = monitorInputs();
    
    return () => {
      cleanupPageMonitor();
      cleanupInputMonitor();
    };
  }, [toast]);

  const logSecurityEvent = (action: string, details: Record<string, any>) => {
    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      action,
      timestamp: new Date().toISOString(),
      details
    };
    
    setEvents(prev => [...prev.slice(-9), event]); // Keep last 10 events
    
    // In a real application, you would send this to your security logging service
    console.warn(`SECURITY_EVENT: ${action}`, event);
  };

  return {
    events,
    logSecurityEvent
  };
}

// Detect and block common attack patterns
export function useSecurityHeaders() {
  useEffect(() => {
    // Content Security Policy via meta tag (basic protection)
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;";
    
    // Only add if not already present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      document.head.appendChild(cspMeta);
    }
    
    // Prevent clickjacking
    const frameOptions = document.createElement('meta');
    frameOptions.httpEquiv = 'X-Frame-Options';
    frameOptions.content = 'DENY';
    
    if (!document.querySelector('meta[http-equiv="X-Frame-Options"]')) {
      document.head.appendChild(frameOptions);
    }
    
    return () => {
      // Cleanup if needed
    };
  }, []);
}

// Rate limiting hook for client-side protection
export function useRateLimit(maxAttempts: number = 10, windowMs: number = 60000) {
  const [attempts, setAttempts] = useState<number[]>([]);
  
  const isRateLimited = () => {
    const now = Date.now();
    const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    return recentAttempts.length >= maxAttempts;
  };
  
  const recordAttempt = () => {
    const now = Date.now();
    setAttempts(prev => [...prev.filter(timestamp => now - timestamp < windowMs), now]);
  };
  
  const getRemainingAttempts = () => {
    const now = Date.now();
    const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    return Math.max(0, maxAttempts - recentAttempts.length);
  };
  
  return {
    isRateLimited: isRateLimited(),
    recordAttempt,
    remainingAttempts: getRemainingAttempts()
  };
}