-- Create settings storage tables for persistent settings

-- Facility settings table
CREATE TABLE IF NOT EXISTS public.facility_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
  operating_hours TEXT,
  features JSONB DEFAULT '{}',
  access_features JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(facility_id)
);

-- Provider notification preferences  
CREATE TABLE IF NOT EXISTS public.provider_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  marketing_notifications BOOLEAN DEFAULT false,
  notification_types JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(provider_id)
);

-- Provider security settings
CREATE TABLE IF NOT EXISTS public.provider_security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  two_factor_enabled BOOLEAN DEFAULT false,
  login_alerts_enabled BOOLEAN DEFAULT true,
  session_timeout_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(provider_id)
);

-- Enable RLS
ALTER TABLE public.facility_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_security_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for facility_settings
CREATE POLICY "Providers can manage their facility settings" ON public.facility_settings
FOR ALL USING (
  facility_id IN (
    SELECT f.id FROM public.facilities f
    JOIN public.profiles p ON p.id = f.provider_id
    WHERE p.user_id = auth.uid() AND p.role = 'provider'
  )
);

-- RLS Policies for notification preferences
CREATE POLICY "Providers can manage their notification preferences" ON public.provider_notification_preferences
FOR ALL USING (
  provider_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'provider'
  )
);

-- RLS Policies for security settings
CREATE POLICY "Providers can manage their security settings" ON public.provider_security_settings
FOR ALL USING (
  provider_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'provider'
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_facility_settings_updated_at
  BEFORE UPDATE ON public.facility_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_notification_preferences_updated_at
  BEFORE UPDATE ON public.provider_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_security_settings_updated_at
  BEFORE UPDATE ON public.provider_security_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();