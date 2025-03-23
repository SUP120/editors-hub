import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { initializePayment } from '@/lib/cashfree';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order details with client and work information
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        work:work_id (
          title,
          price
        ),
        client:client_id (
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Calculate total amount (work price + platform fee)
    const workPrice = order.work.price;
    const platformFee = Math.round(workPrice * 0.02); // 2% platform fee
    const totalAmount = workPrice + platformFee;

    console.log('Updating order amounts:', {
      orderId,
      workPrice,
      platformFee,
      totalAmount
    });

    // First update the order status and amounts
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        total_amount: totalAmount,
        platform_fee: platformFee,
        status: 'accepted',
        payment_status: 'pending',
        created_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order amounts:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order amounts' },
        { status: 500 }
      );
    }

    console.log('Order updated successfully:', updatedOrder);

    // Initialize payment with Cashfree
    const paymentResponse = await initializePayment({
      orderId: order.id,
      orderAmount: totalAmount,
      customerDetails: {
        customerId: order.client.id,
        customerName: order.client.full_name,
        customerEmail: order.client.email,
        customerPhone: order.client.phone || '9999999999'
      }
    });

    // Update order with payment session ID
    const { error: sessionError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_session_id: paymentResponse.paymentSessionId
      })
      .eq('id', orderId);

    if (sessionError) {
      console.error('Error updating order with payment session:', sessionError);
    }

    return NextResponse.json(paymentResponse);
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: `Payment initiation failed: ${error.message}` },
      { status: 500 }
    );
  }
} 