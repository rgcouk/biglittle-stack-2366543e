import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string, role?: string, facilityId?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change event:', event, 'User ID:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Clear any retry timeouts on successful auth state change
        if (retryTimeout) {
          clearTimeout(retryTimeout);
        }
      }
    );

    // Enhanced session initialization with retry logic
    const initializeSession = async (retryCount = 0) => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session initialization error:', error);
          
          // Retry with exponential backoff for network errors
          if (retryCount < 3 && (error.message.includes('fetch') || error.message.includes('network'))) {
            const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
            console.log(`Retrying session initialization in ${delay}ms (attempt ${retryCount + 1})`);
            
            retryTimeout = setTimeout(() => {
              initializeSession(retryCount + 1);
            }, delay);
            return;
          }
          
          // If all retries failed, show user feedback
          toast({
            title: "Connection Issue",
            description: "Having trouble connecting to authentication service. Please refresh the page.",
            variant: "destructive"
          });
        }
        
        console.log('Initial session loaded, User ID:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
      } catch (error: any) {
        console.error('Session initialization failed:', error);
        
        // Network error handling with retry
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000;
          retryTimeout = setTimeout(() => {
            initializeSession(retryCount + 1);
          }, delay);
        } else {
          // Final fallback - set loading to false to prevent infinite loading
          setLoading(false);
          toast({
            title: "Authentication Error",
            description: "Unable to initialize authentication. Please refresh the page.",
            variant: "destructive"
          });
        }
      }
    };

    // Initialize session with retry logic
    initializeSession();

    return () => {
      subscription.unsubscribe();
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [toast]);

  const signUp = async (email: string, password: string, displayName?: string, role?: string, facilityId?: string) => {
    try {
      // Enhanced input validation
      if (!email || !password) {
        const error = new Error('Email and password are required');
        toast({
          title: "Sign up failed",
          description: "Please provide both email and password",
          variant: "destructive"
        });
        return { error };
      }

      // Enhanced email validation
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        const error = new Error('Invalid email format');
        toast({
          title: "Sign up failed",
          description: "Please provide a valid email address",
          variant: "destructive"
        });
        return { error };
      }
      
      // Enhanced password validation
      if (password.length < 8) {
        const error = new Error('Password must be at least 8 characters');
        toast({
          title: "Sign up failed", 
          description: "Password must be at least 8 characters long",
          variant: "destructive"
        });
        return { error };
      }

      // Check for common password patterns
      if (/^(password|123456|qwerty|admin)$/i.test(password)) {
        const error = new Error('Password is too common');
        toast({
          title: "Sign up failed",
          description: "Please choose a stronger, less common password",
          variant: "destructive"
        });
        return { error };
      }
      
      // Sanitize inputs and validate role
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedDisplayName = displayName?.trim();
      const validatedRole = (role === 'provider' || role === 'customer') ? role : 'customer';
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: sanitizedDisplayName,
            role: validatedRole,
            facility_id: facilityId
          }
        }
      });
      
      if (error) {
        // Enhanced error message sanitization to prevent user enumeration
        let sanitizedMessage = 'Unable to create account. Please check your details and try again.';
        
        // Only show specific messages for certain safe error types
        if (error.message.includes('User already registered')) {
          sanitizedMessage = 'An account with this email may already exist. Please try signing in.';
        } else if (error.message.includes('Password should be')) {
          sanitizedMessage = 'Password does not meet security requirements.';
        }
        
        toast({
          title: "Sign up failed",
          description: sanitizedMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Check your email",
          description: "Please check your email for a confirmation link to complete registration."
        });
      }
      
      return { error };
    } catch (error: any) {
      // Log error for monitoring (remove sensitive info)
      console.error('Sign up error:', { 
        message: error.message,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Enhanced input validation
      if (!email || !password) {
        const error = new Error('Email and password are required');
        toast({
          title: "Sign in failed",
          description: "Please provide both email and password",
          variant: "destructive"
        });
        return { error };
      }

      // Validate email format
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        const error = new Error('Invalid email format');
        toast({
          title: "Sign in failed",
          description: "Please provide a valid email address",
          variant: "destructive"
        });
        return { error };
      }
      
      // Sanitize inputs
      const sanitizedEmail = email.trim().toLowerCase();
      
      // Enhanced network resilience with retry logic
      let lastError;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email: sanitizedEmail,
            password
          });
          
          if (error) {
            // Check for network-related errors
            if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
              lastError = error;
              
              if (attempt < 2) {
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
              }
              
              // All network retries failed
              toast({
                title: "Connection Error",
                description: "Unable to connect to authentication service. Please check your internet connection and try again.",
                variant: "destructive"
              });
              return { error };
            }
            
            // Non-network authentication error
            let sanitizedMessage = 'Authentication failed. Please verify your credentials.';
            
            // Log failed attempts for security monitoring (without sensitive data)
            console.warn('Authentication failure:', {
              email: sanitizedEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Partially mask email
              timestamp: new Date().toISOString(),
              errorType: error.message.includes('Invalid') ? 'invalid_credentials' : 'other'
            });
            
            // Consistent timing to prevent user enumeration via response timing
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 200));
            
            toast({
              title: "Sign in failed",
              description: sanitizedMessage,
              variant: "destructive"
            });
            return { error };
          } else {
            toast({
              title: "Welcome back!",
              description: "You have successfully signed in."
            });
            return { error: null };
          }
        } catch (networkError: any) {
          lastError = networkError;
          console.error(`Sign in attempt ${attempt + 1} failed:`, networkError.message);
          
          if (attempt < 2) {
            // Wait before retrying with exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
            continue;
          }
        }
      }
      
      // All attempts failed
      toast({
        title: "Connection Error",
        description: "Unable to connect to authentication service. Please check your internet connection and try again.",
        variant: "destructive"
      });
      return { error: lastError };
      
    } catch (error: any) {
      // Log errors for monitoring (remove sensitive info)
      console.error('Sign in error:', { 
        message: error.message,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out",
        variant: "destructive"
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthErrorBoundary>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </AuthErrorBoundary>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}