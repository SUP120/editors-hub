-- Drop triggers first
DROP TRIGGER IF EXISTS order_completion_trigger ON orders;
DROP TRIGGER IF EXISTS payout_request_trigger ON payment_requests;

-- Drop functions
DROP FUNCTION IF EXISTS handle_order_completion();
DROP FUNCTION IF EXISTS handle_payout_request();

-- Drop tables (only if you want to completely remove the earnings tracking)
-- Comment these out if you want to keep the historical data
DROP TABLE IF EXISTS earnings_transactions;

-- Reset any modified columns or constraints
ALTER TABLE payment_requests DROP CONSTRAINT IF EXISTS min_payout_amount;
ALTER TABLE payment_requests DROP CONSTRAINT IF EXISTS max_payout_amount;

-- Restore the original trigger for order completion
CREATE OR REPLACE FUNCTION handle_order_completion()
RETURNS TRIGGER AS $$
DECLARE
    platform_fee INTEGER := 4;
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

-- Recreate the trigger
CREATE TRIGGER order_completion_trigger
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_completion(); 