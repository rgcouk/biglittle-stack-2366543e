import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ paymentId, status }: { paymentId: string; status: string }) => {
      const { data, error } = await supabase
        .from('payments')
        .update({ 
          status,
          payment_date: status === 'paid' ? new Date().toISOString() : undefined
        })
        .eq('id', paymentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-data'] });
      toast({
        title: "Success",
        description: "Payment status updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePaymentStatuses() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('update-payment-statuses');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-data'] });
      toast({
        title: "Success",
        description: "Payment statuses updated and monthly payments generated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to update payment statuses.",
        variant: "destructive",
      });
    },
  });
}