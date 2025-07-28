-- Security fixes: Add missing UPDATE/DELETE policies for bookings and payments tables

-- Add UPDATE policy for bookings table (allow customers to update their own bookings)
CREATE POLICY "Customers can update own bookings"
ON public.bookings
FOR UPDATE
USING (customer_id IN (
  SELECT profiles.id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
))
WITH CHECK (customer_id IN (
  SELECT profiles.id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

-- Add UPDATE policy for bookings table (allow providers to update bookings for their units)
CREATE POLICY "Providers can update bookings for their units"
ON public.bookings
FOR UPDATE
USING (unit_id IN (
  SELECT u.id
  FROM units u
  JOIN facilities f ON u.facility_id = f.id
  JOIN profiles p ON f.provider_id = p.id
  WHERE p.user_id = auth.uid() AND p.role = 'provider'
))
WITH CHECK (unit_id IN (
  SELECT u.id
  FROM units u
  JOIN facilities f ON u.facility_id = f.id
  JOIN profiles p ON f.provider_id = p.id
  WHERE p.user_id = auth.uid() AND p.role = 'provider'
));

-- Add DELETE policy for bookings table (allow customers to delete their own bookings)
CREATE POLICY "Customers can delete own bookings"
ON public.bookings
FOR DELETE
USING (customer_id IN (
  SELECT profiles.id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

-- Add DELETE policy for bookings table (allow providers to delete bookings for their units)
CREATE POLICY "Providers can delete bookings for their units"
ON public.bookings
FOR DELETE
USING (unit_id IN (
  SELECT u.id
  FROM units u
  JOIN facilities f ON u.facility_id = f.id
  JOIN profiles p ON f.provider_id = p.id
  WHERE p.user_id = auth.uid() AND p.role = 'provider'
));

-- Add UPDATE policy for payments table (providers can update payment status)
CREATE POLICY "Providers can update payments for their bookings"
ON public.payments
FOR UPDATE
USING (booking_id IN (
  SELECT b.id
  FROM bookings b
  JOIN units u ON b.unit_id = u.id
  JOIN facilities f ON u.facility_id = f.id
  JOIN profiles p ON f.provider_id = p.id
  WHERE p.user_id = auth.uid() AND p.role = 'provider'
))
WITH CHECK (booking_id IN (
  SELECT b.id
  FROM bookings b
  JOIN units u ON b.unit_id = u.id
  JOIN facilities f ON u.facility_id = f.id
  JOIN profiles p ON f.provider_id = p.id
  WHERE p.user_id = auth.uid() AND p.role = 'provider'
));

-- Add INSERT policy for payments table (allow system to create payments for valid bookings)
CREATE POLICY "Allow payment creation for valid bookings"
ON public.payments
FOR INSERT
WITH CHECK (booking_id IN (
  SELECT b.id
  FROM bookings b
  JOIN profiles p ON b.customer_id = p.id
  WHERE p.user_id = auth.uid()
) OR booking_id IN (
  SELECT b.id
  FROM bookings b
  JOIN units u ON b.unit_id = u.id
  JOIN facilities f ON u.facility_id = f.id
  JOIN profiles p ON f.provider_id = p.id
  WHERE p.user_id = auth.uid() AND p.role = 'provider'
));