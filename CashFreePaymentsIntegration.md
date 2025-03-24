# Cashfree Payment Gateway Integration Guide

This guide explains how to integrate Cashfree's payment gateway into a Next.js/React application.

## Prerequisites

1. Cashfree merchant account
2. Production/Test API credentials:
   - App ID
   - Secret Key
3. Domain whitelisted in Cashfree dashboard

## Step 1: Environment Setup

Create `.env.local` file with your Cashfree credentials:

```env
CASHFREE_APP_ID=your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here
CASHFREE_WEBHOOK_URL=https://your-domain.com/api/payment-webhook
```

## Step 2: Create Order API Endpoint

Create `api/create-order/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      console.error('Missing Cashfree credentials')
      return NextResponse.json(
        { error: 'Payment gateway configuration error' },
        { status: 500 }
      )
    }

    // Get request body
    const body = await request.json()
    const { name, email, amount, order_meta } = body

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`

    // Calculate expiry time (30 minutes from now)
    const expiryTime = new Date()
    expiryTime.setMinutes(expiryTime.getMinutes() + 30)

    // Create Cashfree order payload
    const cashfreePayload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: order_meta.customer_id,
        customer_name: name,
        customer_email: email,
        customer_phone: "9999999999" // Optional
      },
      order_meta: {
        return_url: `${origin}/success?order_id=${orderId}`,
        notify_url: process.env.CASHFREE_WEBHOOK_URL
      },
      order_expiry_time: expiryTime.toISOString()
    }

    // Create order with Cashfree
    const response = await fetch(
      'https://api.cashfree.com/pg/orders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY,
          'x-api-version': '2022-09-01'
        },
        body: JSON.stringify(cashfreePayload)
      }
    )

    const cashfreeData = await response.json()

    if (!response.ok) {
      throw new Error(cashfreeData.message || 'Failed to create payment')
    }

    return NextResponse.json({
      order_id: cashfreeData.order_id,
      payment_session_id: cashfreeData.payment_session_id
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Step 3: Frontend Payment Integration

Create a payment component:

```typescript
'use client'

const PaymentComponent = () => {
  const handlePayment = async (formData) => {
    try {
      // Create order
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      // Load Cashfree SDK
      const script = document.createElement('script')
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
      script.onload = async () => {
        try {
          const cashfree = new (window as any).Cashfree({
            mode: 'production' // Use 'test' for sandbox
          })

          const paymentConfig = {
            paymentSessionId: data.payment_session_id,
            returnUrl: window.location.origin + `/success?order_id=${data.order_id}`,
            style: {
              backgroundColor: '#ffffff',
              color: '#11385b',
              theme: 'light',
              errorColor: '#ff0000',
              themeColor: '#0074D4'
            }
          }

          await cashfree.checkout(paymentConfig)
        } catch (err) {
          console.error('Payment error:', err)
        }
      }

      document.body.appendChild(script)

    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    // Your payment form JSX
  )
}
```

## Step 4: Success Page

Create `app/success/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function SuccessPage() {
  const [status, setStatus] = useState('verifying')
  const [retryCount, setRetryCount] = useState(0)
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/verify-payment?order_id=${orderId}`)
        const data = await response.json()

        if (data.status === 'PAID') {
          setStatus('success')
        } else if (retryCount < 10) {
          // Retry after 3 seconds, up to 10 times
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, 3000)
        } else {
          setStatus('failed')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('failed')
      }
    }

    if (orderId) {
      verifyPayment()
    }
  }, [orderId, retryCount])

  return (
    // Your success page UI
  )
}
```

## Step 5: Webhook Handler

Create `api/payment-webhook/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Verify webhook signature
    const webhookSignature = request.headers.get('x-webhook-signature')
    if (!webhookSignature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Compute signature
    const computedSignature = crypto
      .createHmac('sha256', process.env.CASHFREE_SECRET_KEY!)
      .update(JSON.stringify(body))
      .digest('base64')

    if (webhookSignature !== computedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Process the webhook
    const { order_id, payment_status } = body

    // Update order status in your database
    // ... your database update logic here

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Important Notes

1. **Domain Whitelisting**:
   - Whitelist your domain in Cashfree dashboard
   - For development: whitelist `localhost`
   - For production: whitelist your actual domain

2. **Testing**:
   - Use test credentials in sandbox mode
   - Test card: 4111 1111 1111 1111
   - Any future expiry date
   - Any 3-digit CVV
   - Any OTP (e.g., 123456)

3. **Security**:
   - Always verify webhook signatures
   - Use environment variables for credentials
   - Implement proper error handling
   - Add request validation
   - Use HTTPS in production

4. **Best Practices**:
   - Implement proper logging
   - Handle network errors gracefully
   - Add loading states
   - Show clear error messages
   - Implement retry mechanism for payment verification

## Troubleshooting

1. **Payment Failed**:
   - Check if domain is whitelisted
   - Verify credentials are correct
   - Check order expiry time (15 mins to 30 days)
   - Verify webhook URL is accessible

2. **Webhook Issues**:
   - Ensure webhook URL is public
   - Check signature verification
   - Verify webhook URL in dashboard

3. **Common Errors**:
   - `window.Cashfree is not a constructor`: SDK not loaded
   - `Invalid credentials`: Check APP_ID and SECRET_KEY
   - `Domain not whitelisted`: Add domain in dashboard

## Production Checklist

- [ ] Switch to production credentials
- [ ] Whitelist production domain
- [ ] Set up proper error monitoring
- [ ] Implement logging system
- [ ] Set up webhook error notifications
- [ ] Test complete payment flow
- [ ] Implement proper error handling
- [ ] Set up payment analytics
- [ ] Configure proper SSL/TLS
- [ ] Set up backup payment method 