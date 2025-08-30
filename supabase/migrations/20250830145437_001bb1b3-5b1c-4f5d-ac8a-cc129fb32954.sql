-- Add policies to allow providers to insert/update payments for their facility bookings
CREATE POLICY "Providers can insert payments for their facility bookings" 
ON public.payments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN units u ON u.id = b.unit_id
    JOIN facilities f ON f.id = u.facility_id
    JOIN profiles p ON p.id = f.provider_id
    WHERE b.id = payments.booking_id 
    AND p.user_id = auth.uid() 
    AND p.role = 'provider'
  )
);

CREATE POLICY "Providers can update payments for their facility bookings" 
ON public.payments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN units u ON u.id = b.unit_id
    JOIN facilities f ON f.id = u.facility_id
    JOIN profiles p ON p.id = f.provider_id
    WHERE b.id = payments.booking_id 
    AND p.user_id = auth.uid() 
    AND p.role = 'provider'
  )
);

-- Create function to automatically generate payment records when bookings are created
CREATE OR REPLACE FUNCTION public.generate_payment_for_booking()
RETURNS TRIGGER AS $$
DECLARE
  due_date DATE;
BEGIN
  -- Calculate due date (first of next month)
  due_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
  
  -- Insert payment record for the new booking
  INSERT INTO public.payments (
    booking_id,
    amount_pence,
    status,
    payment_date
  ) VALUES (
    NEW.id,
    NEW.monthly_rate_pence,
    'pending',
    due_date
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically generate payments when bookings are created
CREATE TRIGGER generate_payment_on_booking_insert
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_payment_for_booking();

-- Create function to update payment statuses based on due dates
CREATE OR REPLACE FUNCTION public.update_payment_statuses()
RETURNS void AS $$
BEGIN
  -- Mark payments as overdue if past due date and still pending
  UPDATE public.payments 
  SET status = 'overdue'
  WHERE status = 'pending' 
  AND payment_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate monthly recurring payments
CREATE OR REPLACE FUNCTION public.generate_monthly_payments()
RETURNS void AS $$
DECLARE
  booking_record RECORD;
  next_payment_date DATE;
BEGIN
  -- Get all active bookings
  FOR booking_record IN 
    SELECT id, monthly_rate_pence 
    FROM public.bookings 
    WHERE status = 'active'
  LOOP
    -- Calculate next payment date (first of next month)
    next_payment_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
    
    -- Check if payment already exists for this booking and month
    IF NOT EXISTS (
      SELECT 1 FROM public.payments 
      WHERE booking_id = booking_record.id 
      AND DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', next_payment_date)
    ) THEN
      -- Insert new payment record
      INSERT INTO public.payments (
        booking_id,
        amount_pence,
        status,
        payment_date
      ) VALUES (
        booking_record.id,
        booking_record.monthly_rate_pence,
        'pending',
        next_payment_date
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;