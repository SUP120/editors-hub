import { supabase } from './supabase'

type EmailTemplate = {
  to: string
  subject: string
  html: string
}

export const sendEmail = async (template: EmailTemplate) => {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export const sendOrderNotification = async (orderId: string) => {
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      work:work_id (title),
      artist:artist_id (email, full_name),
      client:client_id (email, full_name)
    `)
    .eq('id', orderId)
    .single()

  if (!order) return

  // Notify artist
  await sendEmail({
    to: order.artist.email,
    subject: 'New Order Received',
    html: `
      <h1>New Order Received</h1>
      <p>Hello ${order.artist.full_name},</p>
      <p>You have received a new order for "${order.work.title}".</p>
      <p>Client: ${order.client.full_name}</p>
      <p>Amount: ₹${order.total_amount}</p>
      <p>Please review and accept/reject the order in your dashboard.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/artist/notifications">View Order</a>
    `
  })

  // Notify client
  await sendEmail({
    to: order.client.email,
    subject: 'Order Confirmation',
    html: `
      <h1>Order Placed Successfully</h1>
      <p>Hello ${order.client.full_name},</p>
      <p>Your order for "${order.work.title}" has been placed successfully.</p>
      <p>Amount: ₹${order.total_amount}</p>
      <p>The artist will review your order shortly.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}">View Order Details</a>
    `
  })
}

export const sendOrderStatusUpdate = async (orderId: string, status: string) => {
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      work:work_id (title),
      artist:artist_id (email, full_name),
      client:client_id (email, full_name)
    `)
    .eq('id', orderId)
    .single()

  if (!order) return

  const statusMessages = {
    accepted: {
      subject: 'Order Accepted',
      clientMessage: 'Your order has been accepted by the artist.',
      artistMessage: 'You have accepted this order.',
    },
    rejected: {
      subject: 'Order Rejected',
      clientMessage: 'Your order has been rejected by the artist.',
      artistMessage: 'You have rejected this order.',
    },
    completed: {
      subject: 'Order Completed',
      clientMessage: 'Your order has been marked as completed by the artist.',
      artistMessage: 'You have marked this order as completed.',
    },
  }

  const message = statusMessages[status as keyof typeof statusMessages]
  if (!message) return

  // Notify client
  await sendEmail({
    to: order.client.email,
    subject: message.subject,
    html: `
      <h1>${message.subject}</h1>
      <p>Hello ${order.client.full_name},</p>
      <p>${message.clientMessage}</p>
      <p>Order: "${order.work.title}"</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}">View Order Details</a>
    `
  })

  // Notify artist
  await sendEmail({
    to: order.artist.email,
    subject: message.subject,
    html: `
      <h1>${message.subject}</h1>
      <p>Hello ${order.artist.full_name},</p>
      <p>${message.artistMessage}</p>
      <p>Order: "${order.work.title}"</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}">View Order Details</a>
    `
  })
}

export const sendPaymentNotification = async (orderId: string) => {
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      work:work_id (title),
      artist:artist_id (email, full_name),
      client:client_id (email, full_name)
    `)
    .eq('id', orderId)
    .single()

  if (!order) return

  // Notify artist
  await sendEmail({
    to: order.artist.email,
    subject: 'Payment Received',
    html: `
      <h1>Payment Received</h1>
      <p>Hello ${order.artist.full_name},</p>
      <p>Payment has been received for order "${order.work.title}".</p>
      <p>Amount: ₹${order.total_amount}</p>
      <p>You can now start working on this order.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}">View Order Details</a>
    `
  })

  // Notify client
  await sendEmail({
    to: order.client.email,
    subject: 'Payment Confirmation',
    html: `
      <h1>Payment Successful</h1>
      <p>Hello ${order.client.full_name},</p>
      <p>Your payment for "${order.work.title}" has been processed successfully.</p>
      <p>Amount: ₹${order.total_amount}</p>
      <p>The artist will be notified and will start working on your order.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}">View Order Details</a>
    `
  })
} 