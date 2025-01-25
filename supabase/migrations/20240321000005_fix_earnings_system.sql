-- Drop existing triggers if any
DROP TRIGGER IF EXISTS order_completion_trigger ON orders;
DROP TRIGGER IF EXISTS payout_request_trigger ON payment_requests;

-- Create transactions table to track all credits and debits
CREATE TABLE IF NOT EXISTS earnings_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artist_id UUID REFERENCES profiles(id),
    amount DECIMAL NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
    description TEXT,
    reference_id UUID, -- order_id or payment_request_id
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_amount CHECK (amount >= 0)
);

-- Function to handle automatic crediting on order completion
CREATE OR REPLACE FUNCTION handle_order_completion()
RETURNS TRIGGER AS $$
DECLARE
    platform_fee INTEGER := 4; -- ₹4 platform fee
    net_amount INTEGER;
BEGIN
    -- Only proceed if the order is being marked as completed
    IF (NEW.status = 'completed' AND OLD.status != 'completed') THEN
        -- Calculate net amount after platform fee
        net_amount := NEW.total_amount - platform_fee;
        
        -- Insert credit transaction
        INSERT INTO earnings_transactions (
            artist_id,
            amount,
            transaction_type,
            description,
            reference_id
        ) VALUES (
            NEW.artist_id,
            net_amount,
            'credit',
            'Earnings from order: ' || (SELECT title FROM works WHERE id = NEW.work_id),
            NEW.id
        );

        -- Update artist_earnings
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
        )
        ON CONFLICT (artist_id) DO UPDATE
        SET 
            total_earned = artist_earnings.total_earned + EXCLUDED.total_earned,
            pending_amount = artist_earnings.pending_amount + EXCLUDED.total_earned,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle payout requests
CREATE OR REPLACE FUNCTION handle_payout_request()
RETURNS TRIGGER AS $$
DECLARE
    available_amount DECIMAL;
BEGIN
    -- Get available amount
    SELECT pending_amount INTO available_amount
    FROM artist_earnings
    WHERE artist_id = NEW.artist_id;
    
    -- Validate amount
    IF NEW.amount < 200 OR NEW.amount > 10000 THEN
        RAISE EXCEPTION 'Payout amount must be between ₹200 and ₹10,000';
    END IF;
    
    IF available_amount < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient balance for payout';
    END IF;
    
    -- Insert debit transaction
    INSERT INTO earnings_transactions (
        artist_id,
        amount,
        transaction_type,
        description,
        reference_id
    ) VALUES (
        NEW.artist_id,
        NEW.amount,
        'debit',
        'Payout request',
        NEW.id
    );
    
    -- Update artist_earnings
    UPDATE artist_earnings
    SET 
        pending_amount = pending_amount - NEW.amount,
        last_payout_date = NOW(),
        updated_at = NOW()
    WHERE artist_id = NEW.artist_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER order_completion_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_completion();

CREATE TRIGGER payout_request_trigger
    BEFORE INSERT ON payment_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_payout_request(); 