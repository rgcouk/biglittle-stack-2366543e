import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string, role?: string) => Promise<{ error: any }>;
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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string, role?: string) => {
    try {
      // Input validation
      if (!email || !password) {
        const error = new Error('Email and password are required');
        toast({
          title: "Sign up failed",
          description: "Please provide both email and password",
          variant: "destructive"
        });
        return { error };
      }
      
      if (password.length < 8) {
        const error = new Error('Password must be at least 8 characters');
        toast({
          title: "Sign up failed", 
          description: "Password must be at least 8 characters long",
          variant: "destructive"
        });
        return { error };
      }
      
      // Sanitize inputs
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedDisplayName = displayName?.trim();
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: sanitizedDisplayName,
            role: role || 'customer'
          }
        }
      });
      
      if (error) {
        // Sanitize error messages to prevent information disclosure
        const sanitizedMessage = error.message.includes('already registered') 
          ? 'This email is already registered. Please try signing in instead.'
          : 'Unable to create account. Please check your details and try again.';
        
        toast({
          title: "Sign up failed",
          description: sanitizedMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Check your email",
          description: "Please check your email for a confirmation link."
        });
      }
      
      return { error };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Input validation
      if (!email || !password) {
        const error = new Error('Email and password are required');
        toast({
          title: "Sign in failed",
          description: "Please provide both email and password",
          variant: "destructive"
        });
        return { error };
      }
      
      // Sanitize inputs
      const sanitizedEmail = email.trim().toLowerCase();
      
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password
      });
      
      if (error) {
        // Sanitize error messages to prevent user enumeration
        const sanitizedMessage = 'Invalid email or password. Please check your credentials and try again.';
        
        toast({
          title: "Sign in failed",
          description: sanitizedMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in."
        });
      }
      
      return { error };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred",
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}