# Cashfree Payment Gateway Integration Guide

This guide explains how to integrate Cashfree payment gateway into your Next.js application, including error handling and best practices.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Setup](#setup)
3. [Implementation](#implementation)
4. [Error Handling](#error-handling)
5. [Common Issues & Solutions](#common-issues--solutions)

## Prerequisites

1. Cashfree Account:
   - Sign up at [Cashfree](https://merchant.cashfree.com/merchant/sign-up)
   - Get your App ID and Secret Key from the dashboard
   - Note both Test and Production credentials

2. Environment Variables:
```env
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CASHFREE_ENV=TEST # or PROD
```

## Setup

1. Install Required Dependencies:
```bash
npm install cashfree-sdk
```

2. Create Cashfree Configuration (`src/lib/cashfree.ts`):
```typescript
const APP_ID = process.env.CASHFREE_APP_ID || '';
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const API_VERSION = '2022-09-01';
const CASHFREE_BASE_URL = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'PROD'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

export interface CashfreePaymentConfig {
  orderId: string;
  orderAmount: string;
  customerDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
  };
}

// Validate configuration
const validateConfig = () => {
  if (!APP_ID || !SECRET_KEY) {
    throw new Error('Cashfree credentials not configured');
  }
};

// Get base URL for callbacks
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000';
};

// Initialize payment
export const initializePayment = async (config: CashfreePaymentConfig) => {
  validateConfig();
  
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + 30);
  
  const baseUrl = getBaseUrl();
  
  const payload = {
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
      return_url: `${baseUrl}/payment/callback?orderId={order_id}&txStatus={transaction_status}`,
      notify_url: `${baseUrl}/api/payment/webhook`
    },
    order_expiry_time: expiryTime.toISOString()
  };

  const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': APP_ID,
      'x-client-secret': SECRET_KEY,
      'x-api-version': API_VERSION
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create payment');
  }

  return response.json();
};

// Verify payment signature
export const verifyWebhookSignature = (data: any, secretKey: string): boolean => {
  // Implementation depends on your security requirements
  return true; // Replace with actual verification logic
};

// Get payment status
export const getPaymentStatus = async (orderId: string) => {
  validateConfig();
  
  const response = await fetch(
    `${CASHFREE_BASE_URL}/orders/${orderId}`,
    {
      headers: {
        'x-client-id': APP_ID,
        'x-client-secret': SECRET_KEY,
        'x-api-version': API_VERSION
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch payment status');
  }

  return response.json();
};
```

## Implementation

1. Create Payment API Route (`src/app/api/payment/initiate/route.ts`):
```typescript
import { NextResponse } from 'next/server';
import { initializePayment } from '@/lib/cashfree';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, customerName, customerEmail, customerPhone } = body;

    const paymentData = await initializePayment({
      orderId,
      orderAmount: amount,
      customerDetails: {
        customerId: orderId,
        customerName,
        customerEmail,
        customerPhone
      }
    });

    return NextResponse.json(paymentData);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
```

2. Create Payment Callback Handler (`src/app/payment/callback/page.tsx`):
```typescript
'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function PaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const orderId = searchParams.get('orderId');
        const txStatus = searchParams.get('txStatus');

        if (!orderId) {
          throw new Error('Order ID not found');
        }

        const response = await fetch('/api/payment/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(Object.fromEntries(searchParams.entries()))
        });

        const data = await response.json();

        if (txStatus === 'SUCCESS' || data.status === 'completed') {
          toast.success('Payment successful!');
          router.push(`/orders/${orderId}`);
        } else {
          toast.error('Payment failed');
          router.push(`/orders/${orderId}/payment?error=${txStatus.toLowerCase()}`);
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
        <h2 className="mt-4 text-xl">Verifying Payment...</h2>
      </div>
    </div>
  );
}
```

## Error Handling

Common errors and how to handle them:

1. Payment Creation Errors:
   - Invalid credentials
   - Network issues
   - Invalid order amount
   - Missing required fields

```typescript
try {
  // Payment creation code
} catch (error) {
  if (error.message.includes('credentials')) {
    // Handle authentication errors
  } else if (error.message.includes('amount')) {
    // Handle amount validation errors
  } else {
    // Handle other errors
  }
}
```

2. Payment Verification Errors:
   - Invalid signature
   - Order not found
   - Payment already processed

```typescript
try {
  // Verification code
} catch (error) {
  if (error.status === 404) {
    // Handle order not found
  } else if (error.message.includes('signature')) {
    // Handle signature verification failure
  } else {
    // Handle other errors
  }
}
```

## Common Issues & Solutions

1. **Double Payment Issue**
   - Problem: Payment page showing after successful payment
   - Solution: Check payment status before showing payment page
   ```typescript
   // In payment page
   useEffect(() => {
     const checkPaymentStatus = async () => {
       const { data } = await supabase
         .from('orders')
         .select('payment_status')
         .eq('id', orderId)
         .single();

       if (data?.payment_status === 'completed') {
         router.push(`/orders/${orderId}`);
       }
     };

     checkPaymentStatus();
   }, [orderId]);
   ```

2. **Payment Status Sync**
   - Problem: Payment status not updating in database
   - Solution: Implement webhook handler and status checks
   ```typescript
   // In webhook handler
   export async function POST(request: Request) {
     try {
       const payload = await request.json();
       
       // Verify webhook signature
       if (!verifyWebhookSignature(payload, process.env.CASHFREE_SECRET_KEY!)) {
         throw new Error('Invalid signature');
       }

       // Update order status
       await supabase
         .from('orders')
         .update({
           payment_status: payload.txStatus === 'SUCCESS' ? 'completed' : 'failed',
           payment_reference: payload.referenceId
         })
         .eq('id', payload.orderId);

       return NextResponse.json({ success: true });
     } catch (error) {
       console.error('Webhook error:', error);
       return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
     }
   }
   ```

3. **Environment Configuration**
   - Problem: Different credentials for test/prod
   - Solution: Use environment variables and configuration file
   ```typescript
   // config/cashfree.ts
   export const cashfreeConfig = {
     appId: process.env.CASHFREE_APP_ID!,
     secretKey: process.env.CASHFREE_SECRET_KEY!,
     baseUrl: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'PROD'
       ? 'https://api.cashfree.com/pg'
       : 'https://sandbox.cashfree.com/pg',
     apiVersion: '2022-09-01'
   };
   ```

Remember to:
- Always validate payment responses
- Implement proper error handling
- Use webhooks for reliable status updates
- Test thoroughly in sandbox environment
- Secure sensitive credentials
- Handle network issues gracefully
- Implement proper logging for debugging 