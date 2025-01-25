-- Function to handle automatic crediting of earnings
CREATE OR REPLACE FUNCTION handle_order_completion()
RETURNS TRIGGER AS $$
DECLARE
    platform_fee INTEGER := 4; -- ₹4 platform fee
    net_amount INTEGER;
    current_earnings RECORD;
BEGIN
    -- Only proceed if the order status is changing to 'completed' and payment_status is 'completed'
    IF (NEW.status = 'completed' AND NEW.payment_status = 'completed') THEN
        -- Calculate net amount after platform fee
        net_amount := NEW.total_amount - platform_fee;
        
        -- Get or create earnings record
        SELECT * INTO current_earnings 
        FROM artist_earnings 
        WHERE artist_id = NEW.artist_id;
        
        IF NOT FOUND THEN
            -- Create new earnings record
            INSERT INTO artist_earnings (
                artist_id,
                total_earned,
                pending_amount,
                created_at,
                updated_at
            ) VALUES (
                NEW.artist_id,
                net_amount,
                net_amount,
                NOW(),
                NOW()
            );
        ELSE
            -- Update existing earnings record
            UPDATE artist_earnings
            SET 
                total_earned = total_earned + net_amount,
                pending_amount = pending_amount + net_amount,
                updated_at = NOW()
            WHERE artist_id = NEW.artist_id;
        END IF;
        
        -- Set payment_status to 'transferred'
        NEW.payment_status := 'transferred';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS order_completion_trigger ON orders;
CREATE TRIGGER order_completion_trigger
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_completion();

-- Add validation for payout requests
ALTER TABLE payment_requests ADD CONSTRAINT min_payout_amount CHECK (amount >= 200);
ALTER TABLE payment_requests ADD CONSTRAINT max_payout_amount CHECK (amount <= 10000);

-- Function to validate payout request
CREATE OR REPLACE FUNCTION validate_payout_request()
RETURNS TRIGGER AS $$
DECLARE
    available_amount INTEGER;
BEGIN
    -- Get available amount for the artist
    SELECT pending_amount INTO available_amount
    FROM artist_earnings
    WHERE artist_id = NEW.artist_id;
    
    -- Check if artist has enough balance
    IF available_amount < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient balance for payout request';
    END IF;
    
    -- Check if artist has payment details
    IF NOT EXISTS (
        SELECT 1 FROM payment_details 
        WHERE artist_id = NEW.artist_id 
        AND (
            (payment_type = 'upi' AND upi_id IS NOT NULL) OR
            (payment_type = 'bank' AND bank_name IS NOT NULL AND account_number IS NOT NULL AND ifsc_code IS NOT NULL)
        )
    ) THEN
        RAISE EXCEPTION 'Payment details not found. Please add UPI or bank details first.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for payout validation
DROP TRIGGER IF EXISTS payout_request_validation_trigger ON payment_requests;
CREATE TRIGGER payout_request_validation_trigger
    BEFORE INSERT ON payment_requests
    FOR EACH ROW
    EXECUTE FUNCTION validate_payout_request(); 