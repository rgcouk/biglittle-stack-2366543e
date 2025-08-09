-- Phase 1: Clean Up & Rebuild
---------------------------------

-- Drop all existing tables, functions, and triggers to start from a clean slate
DROP TABLE IF EXISTS public.payments;
DROP TABLE IF EXISTS public.bookings;
DROP TABLE IF EXISTS public.units;
DROP TABLE IF EXISTS public.facilities;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.providers;
DROP TABLE IF EXISTS public.provider_customers CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user;
DROP FUNCTION IF EXISTS public.set_facility_provider_id;
DROP FUNCTION IF EXISTS public.set_facility_provider_id_from_providers;
DROP FUNCTION IF EXISTS public.get_current_user_role;
DROP FUNCTION IF EXISTS public.update_updated_at_column;

-- Phase 2: Create Tables
---------------------------------

-- Create profiles table for user information (providers only)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT,
  phone TEXT,
  company_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('provider', 'customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create storage facilities table
CREATE TABLE public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  postcode TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create storage units table
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
  unit_number TEXT NOT NULL,
  size_category TEXT NOT NULL,
  width_metres DECIMAL(4,2),
  length_metres DECIMAL(4,2),
  height_metres NUMERIC(5,2),
  floor_level INTEGER DEFAULT 0,
  monthly_price_pence INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
  features TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(facility_id, unit_number)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_rate_pence INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  amount_pence INTEGER NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase 3: Create Functions & Triggers
------------------------------------------

-- Function to handle new user signups and set a role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Function to set facility provider_id from the current user
CREATE OR REPLACE FUNCTION public.set_facility_provider_id()
RETURNS TRIGGER AS $$
BEGIN
  SELECT id INTO NEW.provider_id
  FROM public.profiles
  WHERE user_id = auth.uid() AND role = 'provider';

  IF NEW.provider_id IS NULL THEN
    RAISE EXCEPTION 'Only providers can create facilities';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Function to get the current user role for RLS
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at
  BEFORE UPDATE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_facility_provider_trigger
  BEFORE INSERT ON public.facilities
  FOR EACH ROW
  EXECUTE FUNCTION public.set_facility_provider_id();

-- Phase 4: Security (Row Level Security)
------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Policies for facilities
CREATE POLICY "Providers can manage own facilities" ON public.facilities
  FOR ALL USING (provider_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'provider'
  ));
CREATE POLICY "Customers can view facilities" ON public.facilities
  FOR SELECT USING (true);

-- Policies for units
CREATE POLICY "Providers can manage units in own facilities" ON public.units
  FOR ALL USING (facility_id IN (
    SELECT f.id FROM public.facilities f
    JOIN public.profiles p ON f.provider_id = p.id
    WHERE p.user_id = auth.uid() AND p.role = 'provider'
  ));
CREATE POLICY "Customers can view available units" ON public.units
  FOR SELECT USING (true);

-- Policies for bookings
CREATE POLICY "Customers can view own bookings" ON public.bookings
  FOR SELECT USING (customer_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));
CREATE POLICY "Providers can view bookings for their units" ON public.bookings
  FOR SELECT USING (unit_id IN (
    SELECT u.id FROM public.units u
    JOIN public.facilities f ON u.facility_id = f.id
    JOIN public.profiles p ON f.provider_id = p.id
    WHERE p.user_id = auth.uid() AND p.role = 'provider'
  ));
CREATE POLICY "Customers can create own bookings" ON public.bookings
  FOR INSERT WITH CHECK (customer_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Policies for payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (booking_id IN (
    SELECT b.id FROM public.bookings b
    JOIN public.profiles p ON b.customer_id = p.id
    WHERE p.user_id = auth.uid()
  ) OR booking_id IN (
    SELECT b.id FROM public.bookings b
    JOIN public.units u ON b.unit_id = u.id
    JOIN public.facilities f ON u.facility_id = f.id
    JOIN public.profiles p ON f.provider_id = p.id
    WHERE p.user_id = auth.uid() AND p.role = 'provider'
  ));