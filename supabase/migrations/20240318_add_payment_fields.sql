-- Add payment fields to orders table
ALTER TABLE orders
ADD COLUMN payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
ADD COLUMN payment_session_id text,
ADD COLUMN payment_reference text,
ADD COLUMN payment_mode text,
ADD COLUMN payment_time timestamp with time zone,
ADD COLUMN amount numeric(10,2) NOT NULL DEFAULT 0; 