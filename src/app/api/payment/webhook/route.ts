import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { verifyPaymentSignature } from '@/lib/cashfree';
import { sendPaymentNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-webhook-signature');

    console.log('Received payment webhook:', {
      orderId: body.order_id,
      paymentStatus: body.payment_status,
      timestamp: new Date().toISOString()
    });

    if (!signature) {
      console.error('Missing webhook signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyPaymentSignature(
      body.order_id,
      body.order_amount.toString(),
      body.reference_id,
      body.payment_status,
      signature
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Update order status in database
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: body.payment_status,
        payment_reference_id: body.reference_id,
        payment_method: body.payment_method,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.order_id);

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    // If payment is successful, send notifications
    if (body.payment_status === 'SUCCESS') {
      try {
        await sendPaymentNotification(body.order_id);
      } catch (emailError) {
        console.error('Error sending payment notification:', emailError);
        // Continue anyway as payment was successful
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 