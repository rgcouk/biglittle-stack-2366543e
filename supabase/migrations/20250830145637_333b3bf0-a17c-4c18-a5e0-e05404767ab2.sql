-- Fix search path security issues for the functions created
CREATE OR REPLACE FUNCTION public.generate_payment_for_booking()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.update_payment_statuses()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Mark payments as overdue if past due date and still pending
  UPDATE public.payments 
  SET status = 'overdue'
  WHERE status = 'pending' 
  AND payment_date < CURRENT_DATE;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_monthly_payments()  
RETURNS void
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;