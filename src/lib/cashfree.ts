import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Cashfree API credentials from environment variables
const APP_ID = process.env.NEXT_PUBLIC_CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const API_VERSION = '2022-09-01';
const CASHFREE_BASE_URL = 'https://api.cashfree.com/pg';

// Validate required environment variables
if (!APP_ID || !SECRET_KEY) {
  console.error('Missing required Cashfree environment variables');
}

// Add these type guards at the top of the file after the imports
const ensureSecretKey = () => {
  if (!SECRET_KEY) {
    throw new Error('CASHFREE_SECRET_KEY is not configured');
  }
  return SECRET_KEY;
};

const ensureAppId = () => {
  if (!APP_ID) {
    throw new Error('CASHFREE_APP_ID is not configured');
  }
  return APP_ID;
};

// Interface for payment initiation parameters
interface PaymentInitParams {
  orderId: string;
  orderAmount: string | number;
  orderCurrency: string;
  customerDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  orderMeta: {
    returnUrl: string;
    notifyUrl?: string;
  };
}

// Payment response interface
interface PaymentResponse {
  cfOrderId: string;
  paymentSessionId: string;
  paymentLink: string;
}

type CashfreePaymentConfig = {
  orderId: string;
  orderAmount: number;
  customerDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
};

// Add these validation functions
const validateConfig = () => {
  const missingVars = [];
  if (!APP_ID) missingVars.push('NEXT_PUBLIC_CASHFREE_APP_ID');
  if (!SECRET_KEY) missingVars.push('CASHFREE_SECRET_KEY');
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    throw new Error('Missing APP_URL configuration');
  }
  return url.replace(/\/$/, ''); // Remove trailing slash if present
};

// Initialize a payment with Cashfree
export const initializePayment = async (config: CashfreePaymentConfig) => {
  try {
    // Validate configuration
    validateConfig();
    
    // Log initialization details
    console.log('Initializing Cashfree payment:', {
      orderId: config.orderId,
      amount: config.orderAmount,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasAppId: !!APP_ID,
      hasSecretKey: !!SECRET_KEY
    });

    // Calculate expiry time (30 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 30);

    // Get base URL for callbacks
    const baseUrl = getBaseUrl();
    console.log('Using base URL for callbacks:', baseUrl);

    // Create Cashfree order payload
    const cashfreePayload = {
      order_id: config.orderId,
      order_amount: config.orderAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: config.customerDetails.customerId,
        customer_name: config.customerDetails.customerName,
        customer_email: config.customerDetails.customerEmail,
        customer_phone: config.customerDetails.customerPhone || "9999999999"
      },
      order_meta: {
        return_url: `${baseUrl}/orders/${config.orderId}?payment_status={payment_status}`,
        notify_url: `${baseUrl}/api/payment/webhook`
      },
      order_expiry_time: expiryTime.toISOString()
    };

    // Log request details for debugging
    console.log('Cashfree API request:', {
      url: `${CASHFREE_BASE_URL}/orders`,
      method: 'POST',
      headers: {
        'x-client-id': APP_ID,
        'x-api-version': API_VERSION
      }
    });

    // Make API request to Cashfree
    const response = await fetch(
      `${CASHFREE_BASE_URL}/orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': APP_ID || '',
          'x-client-secret': SECRET_KEY || '',
          'x-api-version': API_VERSION
        },
        body: JSON.stringify(cashfreePayload)
      }
    );

    const cashfreeData = await response.json();

    if (!response.ok) {
      console.error('Cashfree API error details:', {
        status: response.status,
        statusText: response.statusText,
        data: cashfreeData,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(cashfreeData.message || `Failed to create payment order: ${response.status} ${response.statusText}`);
    }

    console.log('Cashfree order created successfully:', {
      orderId: cashfreeData.order_id,
      paymentSessionId: cashfreeData.payment_session_id
    });

    return {
      orderId: cashfreeData.order_id,
      paymentSessionId: cashfreeData.payment_session_id,
      paymentLink: cashfreeData.payment_link
    };

  } catch (error: any) {
    console.error('Error in initializePayment:', {
      message: error.message,
      stack: error.stack,
      response: error.response,
      status: error.status
    });
    throw new Error(`Payment initialization failed: ${error.message}`);
  }
};

// Verify webhook signature from Cashfree
export function verifyWebhookSignature(
  payload: Record<string, any>,
  secretKey?: string
): boolean {
  try {
    const validSecretKey = secretKey || ensureSecretKey();
    
    // Skip verification in development mode if needed
    if (process.env.NODE_ENV !== 'production' && process.env.SKIP_SIGNATURE_VERIFICATION === 'true') {
      return true;
    }
    
    if (!payload.signature) {
      return false;
    }
    
    // Create data string for verification based on Cashfree's algorithm
    const dataKeys = Object.keys(payload).filter(key => key !== 'signature').sort();
    const dataString = dataKeys.map(key => `${key}=${payload[key]}`).join('&');
    
    // Compute signature
    const computedSignature = crypto
      .createHmac('sha256', validSecretKey)
      .update(dataString)
      .digest('base64');
    
    return computedSignature === payload.signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return process.env.NODE_ENV !== 'production'; // Allow in dev, fail in prod
  }
}

// Get payment status from Cashfree
export const getPaymentStatus = async (orderId: string) => {
  try {
    const response = await fetch(
      `${CASHFREE_BASE_URL}/orders/${orderId}`,
      {
        headers: new Headers({
          'x-client-id': ensureAppId(),
          'x-client-secret': ensureSecretKey(),
          'x-api-version': API_VERSION
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch payment status');
    }

    return data;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw error;
  }
};

// Verify payment signature
export const verifyPaymentSignature = (
  orderId: string,
  orderAmount: string,
  referenceId: string,
  paymentStatus: string,
  signature: string
) => {
  try {
    const secretKey = ensureSecretKey();
    // Create the data string that was used to generate the signature
    const dataString = orderId + orderAmount + referenceId + paymentStatus;
    
    // Create HMAC SHA256 hash
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(dataString)
      .digest('base64');

    // Compare signatures
    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
}; 