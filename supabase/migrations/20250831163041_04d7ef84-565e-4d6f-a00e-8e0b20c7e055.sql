-- Create integrations table to track third-party service connections
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  service_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
  api_key_encrypted TEXT,
  webhook_url TEXT,
  settings JSONB DEFAULT '{}',
  last_tested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_id, service_name)
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Providers can manage their own integrations" 
ON public.integrations 
FOR ALL 
USING (provider_id = get_user_provider_profile_id());

-- Create trigger for updated_at
CREATE TRIGGER update_integrations_updated_at
BEFORE UPDATE ON public.integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();