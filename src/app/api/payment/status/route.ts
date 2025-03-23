import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';
import { getPaymentStatus } from '@/lib/cashfree';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Checking payment status for order: ${orderId}`);
    
    // Find the order in our database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (orderError) {
      console.error(`Error fetching order: ${orderError.message}`);
      return NextResponse.json(
        { error: `Order with ID: ${orderId} not found` },
        { status: 404 }
      );
    }
    
    // If already marked as completed, return the status
    if (orderData.payment_status === 'completed') {
      console.log(`Payment already completed for order: ${orderId}`);
      return NextResponse.json({
        success: true,
        status: 'completed',
        message: 'Payment already completed',
        alreadyProcessed: true
      });
    }
    
    // If we have a payment session ID, check with Cashfree
    if (orderData.payment_session_id) {
      try {
        // Get payment status from Cashfree
        const paymentStatus = await getPaymentStatus(orderData.payment_session_id);
        
        console.log('Cashfree payment status:', {
          orderId,
          sessionId: orderData.payment_session_id,
          status: paymentStatus.order_status,
          timestamp: new Date().toISOString()
        });
        
        // Update payment status if necessary
        if (paymentStatus.order_status === 'PAID' && orderData.payment_status !== 'completed') {
          // Update order status
          const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({
              payment_status: 'completed',
              status: 'in_progress',
              payment_reference: paymentStatus.transaction_id || `cf_${Date.now()}`,
              payment_time: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId);
            
          if (updateError) {
            console.error(`Error updating order status: ${updateError.message}`);
            // Continue anyway
          }
          
          // Add system message
          try {
            await supabaseAdmin
              .from('messages')
              .insert({
                order_id: orderId,
                sender_id: orderData.client_id,
                content: '💰 Payment completed successfully!',
                created_at: new Date().toISOString(),
                is_system_message: true
              });
          } catch (messageError) {
            console.error('Failed to add system message:', messageError);
            // Continue anyway
          }
          
          return NextResponse.json({
            success: true,
            status: 'completed',
            message: 'Payment completed',
            cashfreeStatus: paymentStatus.order_status
          });
        } else if (paymentStatus.order_status === 'ACTIVE') {
          // Payment is still pending
          return NextResponse.json({
            success: true,
            status: 'pending',
            message: 'Payment is pending',
            cashfreeStatus: paymentStatus.order_status
          });
        } else {
          // Other status (EXPIRED, CANCELLED, etc.)
          return NextResponse.json({
            success: true,
            status: orderData.payment_status || 'pending',
            message: `Payment status: ${paymentStatus.order_status}`,
            cashfreeStatus: paymentStatus.order_status
          });
        }
      } catch (cashfreeError: any) {
        console.error('Error checking Cashfree payment status:', cashfreeError);
        // Continue with local status
      }
    }
    
    // Return current payment status
    return NextResponse.json({
      success: true,
      status: orderData.payment_status || 'pending',
      message: `Current payment status: ${orderData.payment_status || 'pending'}`
    });
  } catch (error: any) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check payment status' },
      { status: 500 }
    );
  }
} 