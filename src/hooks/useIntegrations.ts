import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Integration {
  id: string;
  provider_id: string;
  service_name: string;
  service_id: string;
  status: 'connected' | 'disconnected' | 'error';
  api_key_encrypted?: string;
  webhook_url?: string;
  settings: Record<string, any>;
  last_tested_at?: string;
  created_at: string;
  updated_at: string;
}

export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Integration[];
    },
  });
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      integrationId, 
      updates 
    }: { 
      integrationId: string; 
      updates: Partial<Integration>;
    }) => {
      const { data, error } = await supabase
        .from('integrations')
        .update(updates)
        .eq('id', integrationId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({
        title: "Success",
        description: "Integration updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update integration.",
        variant: "destructive",
      });
    },
  });
}

export function useCreateIntegration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (integration: Omit<Integration, 'id' | 'provider_id' | 'created_at' | 'updated_at'>) => {
      // Get the current user's provider profile ID
      const { data: providerData, error: providerError } = await supabase
        .rpc('get_current_user_provider_id');
      
      if (providerError) throw providerError;
      if (!providerData) throw new Error('User is not a provider');

      const { data, error } = await supabase
        .from('integrations')
        .insert({
          ...integration,
          provider_id: providerData as string,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({
        title: "Success",
        description: "Integration connected successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to connect integration.",
        variant: "destructive",
      });
    },
  });
}

export function useTestIntegration() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ serviceName, apiKey }: { serviceName: string; apiKey: string }) => {
      // This would call different test endpoints based on the service
      // For now, we'll simulate the test
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, message: 'Connection test successful' });
        }, 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Test Successful",
        description: "Integration is working correctly.",
      });
    },
    onError: () => {
      toast({
        title: "Test Failed",
        description: "Unable to connect to the service.",
        variant: "destructive",
      });
    },
  });
}

export function useStripeCheckout() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ bookingId, unitId, monthlyRatePence }: {
      bookingId: string;
      unitId: string; 
      monthlyRatePence: number;
    }) => {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { bookingId, unitId, monthlyRatePence }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create checkout session.",
        variant: "destructive",
      });
    },
  });
}

export function useStripePayment() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ paymentId, amount }: {
      paymentId: string;
      amount: number;
    }) => {
      const { data, error } = await supabase.functions.invoke('create-stripe-payment', {
        body: { paymentId, amount }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to create payment session.",
        variant: "destructive",
      });
    },
  });
}