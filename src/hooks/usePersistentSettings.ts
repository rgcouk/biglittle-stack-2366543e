import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  marketing_notifications: boolean;
  notification_types: Record<string, boolean>;
}

interface SecuritySettings {
  two_factor_enabled: boolean;
  login_alerts_enabled: boolean;
  session_timeout_minutes: number;
}

interface FacilitySettings {
  operating_hours: string;
  features: Record<string, boolean>;
  access_features: Record<string, boolean>;
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_notification_preferences')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data || {
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        marketing_notifications: false,
        notification_types: {}
      };
    },
  });
}

export function useSecuritySettings() {
  return useQuery({
    queryKey: ['security-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_security_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data || {
        two_factor_enabled: false,
        login_alerts_enabled: true,
        session_timeout_minutes: 30
      };
    },
  });
}

export function useFacilitySettings(facilityId?: string) {
  return useQuery({
    queryKey: ['facility-settings', facilityId],
    queryFn: async () => {
      if (!facilityId) return null;
      
      const { data, error } = await supabase
        .from('facility_settings')
        .select('*')
        .eq('facility_id', facilityId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data || {
        operating_hours: 'Monday - Friday: 8:00 AM - 8:00 PM\nSaturday: 9:00 AM - 6:00 PM\nSunday: 10:00 AM - 4:00 PM',
        features: {},
        access_features: {}
      };
    },
    enabled: !!facilityId,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      // Get current user's provider profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('role', 'provider')
        .single();

      if (!profile) throw new Error('Provider profile not found');

      const { data, error } = await supabase
        .from('provider_notification_preferences')
        .upsert({ ...preferences, provider_id: profile.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<SecuritySettings>) => {
      // Get current user's provider profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('role', 'provider')
        .single();

      if (!profile) throw new Error('Provider profile not found');

      const { data, error } = await supabase
        .from('provider_security_settings')
        .upsert({ ...settings, provider_id: profile.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
      toast({
        title: "Security Settings Updated",
        description: "Your security settings have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update security settings.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateFacilitySettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ facilityId, settings }: { facilityId: string; settings: Partial<FacilitySettings> }) => {
      const { data, error } = await supabase
        .from('facility_settings')
        .upsert({ facility_id: facilityId, ...settings })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facility-settings'] });
      toast({
        title: "Facility Settings Updated",
        description: "Your facility settings have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update facility settings.",
        variant: "destructive",
      });
    },
  });
}