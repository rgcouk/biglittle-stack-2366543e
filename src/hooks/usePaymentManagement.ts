import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePaymentStatusUpdate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ paymentId, status }: { paymentId: string; status: string }) => {
      const updateData: any = { status };
      
      // If marking as paid, set payment date to now
      if (status === 'paid') {
        updateData.payment_date = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('payments')
        .update(updateData)
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
      const { error } = await supabase.rpc('update_payment_statuses');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-data'] });
      toast({
        title: "Success",
        description: "Payment statuses updated based on due dates.",
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

export function useGenerateMonthlyPayments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('generate_monthly_payments');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-data'] });
      toast({
        title: "Success",
        description: "Monthly payments generated for active bookings.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate monthly payments.",
        variant: "destructive",
      });
    },
  });
}