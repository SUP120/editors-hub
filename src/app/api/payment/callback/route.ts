import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';
import { verifyWebhookSignature, getPaymentStatus } from '@/lib/cashfree';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const callbackData = await request.json();
    
    // Check if this is a payment status check rather than a callback
    if (callbackData.checkPaymentStatus) {
      return await handlePaymentStatusCheck(callbackData.orderId);
    }
    
    // Log the entire callback data for debugging
    console.log('Cashfree callback received:', JSON.stringify(callbackData, null, 2));
    
    // Extract payment information
    const { 
      orderId,          // This is the payment_session_id we generated
      orderAmount, 
      referenceId,      // Cashfree transaction ID
      txStatus, 
      paymentMode, 
      txMsg, 
      txTime, 
      signature 
    } = callbackData;
    
    console.log('Payment callback processing:', {
      orderId,
      txStatus,
      referenceId,
      timestamp: new Date().toISOString()
    });

    // Validation checks
    if (!orderId) {
      console.error('Missing orderId in callback data');
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // This orderId is actually the payment_session_id we generated
    // Extract the real order ID from it (format is orderId_timestamp_random)
    const realOrderId = orderId.split('_')[0];
    console.log(`Extracted real order ID: ${realOrderId} from payment session ID: ${orderId}`);
    
    // Find the order in our database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', realOrderId)
      .single();

    if (orderError) {
      console.error(`Error fetching order for callback: ${orderError.message}`);
      return NextResponse.json(
        { error: `Order with ID: ${realOrderId} not found` },
        { status: 404 }
      );
    }

    // Double-check that this is the correct payment session
    if (orderData.payment_session_id !== orderId) {
      console.warn(`Payment session ID mismatch: expected ${orderData.payment_session_id}, got ${orderId}`);
      // We'll continue anyway, but log the mismatch
    }

    // Check if payment already processed
    if (orderData.payment_status === 'completed') {
      console.log(`Payment already processed for order: ${realOrderId}`);
      return NextResponse.json({ 
        success: true, 
        alreadyProcessed: true,
        message: 'Payment already processed'
      });
    }

    // For production, verify payment signature
    let isValidSignature = true;
    if (process.env.CASHFREE_SECRET_KEY) {
      try {
        isValidSignature = verifyWebhookSignature(callbackData, process.env.CASHFREE_SECRET_KEY);
        
        if (!isValidSignature && process.env.NODE_ENV === 'production') {
          console.error('Invalid payment signature:', {
            orderId,
            referenceId
          });
          
          return NextResponse.json(
            { error: 'Invalid payment signature' },
            { status: 400 }
          );
        } else if (!isValidSignature) {
          console.warn('Invalid signature but continuing in non-production environment');
        }
      } catch (signatureError: any) {
        console.error('Error verifying signature:', signatureError);
        // For non-production, continue anyway
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json(
            { error: 'Failed to verify payment signature' },
            { status: 400 }
          );
        }
      }
    }

    // Determine the payment status
    let paymentStatus = 'pending';
    let orderStatus = orderData.status;
    
    if (txStatus === 'SUCCESS') {
      paymentStatus = 'completed';
      orderStatus = 'in_progress'; // After payment, order moves to in_progress
    } else if (txStatus === 'FAILED') {
      paymentStatus = 'failed';
    } else if (txStatus === 'CANCELLED') {
      paymentStatus = 'cancelled';
    }

    // Update the order with payment information
    try {
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: orderStatus,
          payment_status: paymentStatus,
          payment_reference: referenceId,
          payment_mode: paymentMode || 'CASHFREE',
          payment_time: txTime || new Date().toISOString(),
          cf_transaction_id: referenceId,
          cf_transaction_status: txStatus,
          cf_transaction_msg: txMsg,
          updated_at: new Date().toISOString()
        })
        .eq('id', realOrderId);

      if (updateError) {
        console.error(`Database error updating order ${realOrderId}: ${updateError.message}`);
        return NextResponse.json(
          { error: `Failed to update order: ${updateError.message}` },
          { status: 500 }
        );
      }
      
      console.log(`Order ${realOrderId} updated with payment status: ${paymentStatus}`);
      
      // If this is a successful payment, add a system message
      if (paymentStatus === 'completed') {
        try {
          await supabaseAdmin
            .from('messages')
            .insert({
              order_id: realOrderId,
              sender_id: orderData.client_id,
              content: '💰 Payment completed successfully!',
              created_at: new Date().toISOString(),
              is_system_message: true
            });
            
          console.log(`Added payment success message to order ${realOrderId}`);
        } catch (messageError) {
          console.error('Failed to add payment system message:', {
            orderId: realOrderId,
            error: messageError
          });
          // Continue with the process even if message creation fails
        }
      }
      
      return NextResponse.json({
        success: true,
        status: paymentStatus,
        message: `Payment ${paymentStatus} for order ${realOrderId}`
      });
    } catch (dbError: any) {
      console.error(`Database error updating order ${realOrderId}:`, dbError);
      
      return NextResponse.json(
        { error: `Failed to update order: ${dbError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Payment callback processing error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to process payment callback' },
      { status: 500 }
    );
  }
}

// Helper function to handle payment status checks
async function handlePaymentStatusCheck(orderId: string) {
  try {
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