-- Create provider_customers table for multi-tenant customer management
CREATE TABLE public.provider_customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(provider_id, email)
);

-- Enable RLS on provider_customers
ALTER TABLE public.provider_customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for provider_customers
CREATE POLICY "Providers can manage their own customers"
ON public.provider_customers
FOR ALL
USING (provider_id IN (
  SELECT id FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'provider'
));

-- Add customer_id column to bookings referencing provider_customers
ALTER TABLE public.bookings 
ADD COLUMN provider_customer_id uuid REFERENCES public.provider_customers(id);

-- Update bookings RLS policies to work with new structure
DROP POLICY IF EXISTS "Customers can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can delete own bookings" ON public.bookings;

-- Create new RLS policy for provider customer bookings
CREATE POLICY "Providers can manage bookings for their customers"
ON public.bookings
FOR ALL
USING (
  provider_customer_id IN (
    SELECT pc.id 
    FROM public.provider_customers pc
    JOIN public.profiles p ON pc.provider_id = p.id
    WHERE p.user_id = auth.uid() AND p.role = 'provider'
  )
);

-- Update profiles table to be provider-only by updating the role constraint
-- Remove existing role check if it exists and add provider-only constraint
DO $$
BEGIN
  -- Drop existing check constraint if it exists
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'profiles_role_check' 
             AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
  END IF;
  
  -- Add new constraint allowing only provider role
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role = 'provider');
EXCEPTION
  WHEN OTHERS THEN
    -- If constraint doesn't exist, just add the new one
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
      CHECK (role = 'provider');
END $$;

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_provider_customers_updated_at
  BEFORE UPDATE ON public.provider_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();