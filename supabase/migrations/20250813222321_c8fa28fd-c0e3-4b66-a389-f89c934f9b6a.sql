-- Master Migration: Complete Schema Reset and Setup
-- This migration creates a clean, consistent database schema for BigLittleBox

-- First, clean up any existing objects that might cause conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS set_facility_provider_id_trigger ON public.facilities CASCADE;
DROP TRIGGER IF EXISTS update_facilities_updated_at ON public.facilities CASCADE;
DROP TRIGGER IF EXISTS update_units_updated_at ON public.units CASCADE;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings CASCADE;
DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments CASCADE;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.set_facility_provider_id() CASCADE;
DROP FUNCTION IF EXISTS public.set_facility_provider_id_from_providers() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;

-- Drop existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.units CASCADE;
DROP TABLE IF EXISTS public.facilities CASCADE;
DROP TABLE IF EXISTS public.providers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create facilities table
CREATE TABLE public.facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    postcode TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on facilities
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

-- Create units table
CREATE TABLE public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    unit_number TEXT NOT NULL,
    size_category TEXT NOT NULL,
    width_metres NUMERIC,
    length_metres NUMERIC,
    height_metres NUMERIC,
    floor_level INTEGER DEFAULT 0,
    monthly_price_pence INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    features TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on units
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- Create bookings table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    monthly_rate_pence INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    amount_pence INTEGER NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'pending',
    stripe_payment_id TEXT,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create user role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    -- First try to get role from profiles table
    (
      SELECT p.role
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      LIMIT 1
    ),
    -- Fallback to metadata from auth.users
    (
      SELECT COALESCE(
        nullif(u.raw_user_meta_data->>'role', ''),
        'customer'
      )
      FROM auth.users u
      WHERE u.id = auth.uid()
      LIMIT 1
    ),
    'customer'
  );
$$;

-- Create new user handler function with corrected role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    role = COALESCE(EXCLUDED.role, profiles.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create facility provider validation function
CREATE OR REPLACE FUNCTION public.set_facility_provider_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the profile ID for the current user with provider role
    SELECT id INTO NEW.provider_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'provider';
    
    -- If no provider profile found, raise an error
    IF NEW.provider_id IS NULL THEN
        RAISE EXCEPTION 'Only providers can create facilities';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at
    BEFORE UPDATE ON public.facilities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_units_updated_at
    BEFORE UPDATE ON public.units
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for facility provider validation
CREATE TRIGGER set_facility_provider_id_trigger
    BEFORE INSERT ON public.facilities
    FOR EACH ROW
    EXECUTE FUNCTION public.set_facility_provider_id();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users cannot change their own role"
    ON public.profiles FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid() AND role = (
        SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid()
    ));

-- RLS Policies for facilities
CREATE POLICY "Providers can view their own facilities"
    ON public.facilities FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = facilities.provider_id 
        AND p.user_id = auth.uid() 
        AND p.role = 'provider'
    ));

CREATE POLICY "Providers can insert their own facilities"
    ON public.facilities FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() 
        AND p.role = 'provider' 
        AND p.id = facilities.provider_id
    ));

CREATE POLICY "Providers can update their own facilities"
    ON public.facilities FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = facilities.provider_id 
        AND p.user_id = auth.uid() 
        AND p.role = 'provider'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = facilities.provider_id 
        AND p.user_id = auth.uid() 
        AND p.role = 'provider'
    ));

CREATE POLICY "Providers can delete their own facilities"
    ON public.facilities FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = facilities.provider_id 
        AND p.user_id = auth.uid() 
        AND p.role = 'provider'
    ));

-- RLS Policies for units
CREATE POLICY "Providers can manage units in their facilities"
    ON public.units FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.facilities f
        JOIN public.profiles p ON f.provider_id = p.id
        WHERE f.id = units.facility_id 
        AND p.user_id = auth.uid() 
        AND p.role = 'provider'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.facilities f
        JOIN public.profiles p ON f.provider_id = p.id
        WHERE f.id = units.facility_id 
        AND p.user_id = auth.uid() 
        AND p.role = 'provider'
    ));

-- RLS Policies for bookings
CREATE POLICY "Customers can view their bookings"
    ON public.bookings FOR SELECT
    USING (customer_id = auth.uid());

CREATE POLICY "Customers can create their bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update their bookings"
    ON public.bookings FOR UPDATE
    USING (customer_id = auth.uid())
    WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can delete their bookings"
    ON public.bookings FOR DELETE
    USING (customer_id = auth.uid());

-- RLS Policies for payments
CREATE POLICY "Customers can view their payments"
    ON public.payments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = payments.booking_id 
        AND b.customer_id = auth.uid()
    ));

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_facilities_provider_id ON public.facilities(provider_id);
CREATE INDEX idx_units_facility_id ON public.units(facility_id);
CREATE INDEX idx_units_status ON public.units(status);
CREATE INDEX idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX idx_bookings_unit_id ON public.bookings(unit_id);
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);