import { supabase } from './supabase'
import { emailTemplates } from './email-templates'
import { Order } from '@/types'

type EmailTemplate = {
  to: string
  subject: string
  html: string
}

export const sendEmail = async (template: EmailTemplate) => {
  try {
    // Validate email address
    if (!template.to) {
      console.error('No recipient email provided for email sending')
      throw new Error('No recipient email provided')
    }

    console.log('Attempting to send email to:', template.to)
    console.log('Email subject:', template.subject)
    console.log('Email template:', {
      to: template.to,
      subject: template.subject,
      htmlLength: template.html?.length
    })
    
    // Add a unique identifier to help with debugging
    const emailId = `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Email-ID': emailId
      },
      body: JSON.stringify({
        ...template,
        _emailId: emailId // Include in the payload for tracking
      }),
    })

    const responseData = await response.json()
    console.log(`Email API Response (${emailId}):`, responseData)

    if (!response.ok) {
      console.error(`Email API Error Response (${emailId}):`, {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        to: template.to,
        subject: template.subject
      })
      throw new Error(responseData.error || `Failed to send email: ${response.statusText}`)
    }

    if (!responseData.success) {
      console.error(`Email sending failed (${emailId}):`, {
        responseData,
        to: template.to,
        subject: template.subject
      })
      throw new Error('Failed to send email: No success confirmation')
    }

    console.log(`Email sent successfully (${emailId}):`, {
      to: template.to,
      subject: template.subject,
      messageId: responseData.messageId,
      timestamp: responseData.timestamp
    })
    return responseData
  } catch (error) {
    console.error('Error in sendEmail:', error, {
      to: template.to,
      subject: template.subject
    })
    throw error
  }
}

const fetchOrderDetails = async (orderId: string): Promise<Order | null> => {
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      work:work_id (title, description),
      artist:artist_id (email, full_name),
      client:client_id (email, full_name)
    `)
    .eq('id', orderId)
    .single()

  if (error) {
    console.error('Error fetching order details:', error)
    return null
  }

  return order
}

export const sendOrderNotification = async (orderId: string) => {
  try {
    console.log('Starting order notification process for order:', orderId)
    const order = await fetchOrderDetails(orderId)
    
    if (!order) {
      console.error('Order not found:', orderId)
      return
    }

    console.log('Order details retrieved:', {
      orderId: order.id,
      artistEmail: order.artist.email,
      clientEmail: order.client.email,
      workTitle: order.work.title,
      orderStatus: order.status,
      timestamp: new Date().toISOString()
    })

    if (!order.artist.email || !order.client.email) {
      console.error('Missing email addresses:', {
        artistEmail: order.artist.email,
        clientEmail: order.client.email
      })
      throw new Error('Missing required email addresses')
    }

    // Notify artist
    console.log('Preparing artist notification email:', {
      to: order.artist.email,
      orderTitle: order.work.title
    })
    
    const artistTemplate = emailTemplates.orderCreated(order)
    console.log('Artist email template prepared:', {
      subject: artistTemplate.subject,
      htmlLength: artistTemplate.html.length
    })

    const artistEmailResult = await sendEmail({
      to: order.artist.email,
      ...artistTemplate
    })
    console.log('Artist notification sent:', artistEmailResult)

    // Notify client
    console.log('Preparing client notification email:', {
      to: order.client.email,
      orderTitle: order.work.title
    })
    
    const clientTemplate = emailTemplates.orderConfirmation(order)
    console.log('Client email template prepared:', {
      subject: clientTemplate.subject,
      htmlLength: clientTemplate.html.length
    })

    const clientEmailResult = await sendEmail({
      to: order.client.email,
      ...clientTemplate
    })
    console.log('Client notification sent:', clientEmailResult)

    console.log('All order notifications sent successfully:', {
      orderId,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Error sending order notifications:', {
      error: error.message,
      stack: error.stack,
      orderId
    })
    throw error
  }
}

export const sendOrderStatusUpdate = async (orderId: string, status: string) => {
  try {
    console.log('Starting status update notification for order:', orderId, 'status:', status)
    const order = await fetchOrderDetails(orderId)
    if (!order) {
      console.error('Order not found:', orderId)
      return
    }

    const statusEmailMap = {
      accepted: {
        client: emailTemplates.orderAccepted,
        artist: (order: Order) => ({
          subject: 'Order Accepted Confirmation',
          html: emailTemplates.orderAccepted(order).html
        })
      },
      rejected: {
        client: emailTemplates.orderRejected,
        artist: (order: Order) => ({
          subject: 'Order Rejection Confirmation',
          html: emailTemplates.orderRejected(order).html
        })
      },
      completed: {
        client: emailTemplates.orderCompleted,
        artist: (order: Order) => ({
          subject: 'Order Completion Confirmation',
          html: emailTemplates.orderCompleted(order).html
        })
      },
      revision_needed: {
        client: (order: Order) => ({
          subject: 'Revision Request Confirmed',
          html: emailTemplates.revisionRequested(order, order.client_feedback || '').html
        }),
        artist: (order: Order) => emailTemplates.revisionRequested(order, order.client_feedback || '')
      }
    }

    const emailTemplateSet = statusEmailMap[status as keyof typeof statusEmailMap]
    if (!emailTemplateSet) {
      console.error('Invalid status for email notification:', status)
      return
    }

    // Notify client
    console.log('Sending status update to client:', order.client.email)
    const clientEmailResult = await sendEmail({
      to: order.client.email,
      ...emailTemplateSet.client(order)
    })
    console.log('Client status notification sent:', clientEmailResult)

    // Notify artist
    console.log('Sending status update to artist:', order.artist.email)
    const artistEmailResult = await sendEmail({
      to: order.artist.email,
      ...emailTemplateSet.artist(order)
    })
    console.log('Artist status notification sent:', artistEmailResult)

    console.log('All status update notifications sent successfully')
  } catch (error) {
    console.error('Error sending status update notifications:', error)
    throw error
  }
}

export const sendPaymentNotification = async (orderId: string) => {
  try {
    console.log('Starting payment notification process for order:', orderId)
    const order = await fetchOrderDetails(orderId)
    
    if (!order) {
      console.error('Order not found for payment notification:', orderId)
      return
    }
    
    console.log('Payment notification - order details retrieved:', {
      orderId: order.id,
      artistEmail: order.artist.email,
      clientEmail: order.client.email,
      workTitle: order.work.title,
      amount: order.total_amount,
      timestamp: new Date().toISOString()
    })

    // Verify email addresses are valid
    if (!order.artist.email || !order.client.email) {
      console.error('Missing email addresses for payment notification:', {
        artistEmail: order.artist.email,
        clientEmail: order.client.email
      })
      throw new Error('Missing required email addresses for payment notification')
    }

    // Notify artist with retry logic
    console.log('Sending payment notification to artist:', order.artist.email)
    const artistTemplate = emailTemplates.paymentReceived(order)
    console.log('Artist payment template prepared:', {
      subject: artistTemplate.subject,
      htmlLength: artistTemplate.html.length
    })
    
    let artistResult;
    try {
      artistResult = await sendEmail({
        to: order.artist.email,
        ...artistTemplate
      })
      console.log('Artist payment notification sent successfully:', artistResult)
    } catch (artistEmailError) {
      console.error('Failed to send artist payment notification, retrying...', artistEmailError)
      // Retry once after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      artistResult = await sendEmail({
        to: order.artist.email,
        ...artistTemplate
      })
      console.log('Artist payment notification sent on retry:', artistResult)
    }

    // Notify client with retry logic
    console.log('Sending payment confirmation to client:', order.client.email)
    const clientTemplate = emailTemplates.paymentConfirmation(order)
    console.log('Client payment template prepared:', {
      subject: clientTemplate.subject,
      htmlLength: clientTemplate.html.length
    })
    
    let clientResult;
    try {
      clientResult = await sendEmail({
        to: order.client.email,
        ...clientTemplate
      })
      console.log('Client payment confirmation sent successfully:', clientResult)
    } catch (clientEmailError) {
      console.error('Failed to send client payment notification, retrying...', clientEmailError)
      // Retry once after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      clientResult = await sendEmail({
        to: order.client.email,
        ...clientTemplate
      })
      console.log('Client payment confirmation sent on retry:', clientResult)
    }
    
    console.log('All payment notifications sent successfully for order:', orderId, {
      artistResult,
      clientResult
    })
    
    return { artistResult, clientResult }
  } catch (error) {
    console.error('Error sending payment notifications:', error)
    throw error
  }
}

export const sendFinalCompletionNotification = async (orderId: string) => {
  try {
    console.log('Starting final completion notification for order:', orderId)
    const order = await fetchOrderDetails(orderId)
    if (!order) {
      console.error('Order not found:', orderId)
      return
    }

    // Send final completion notification to client
    console.log('Sending final completion notification to client:', order.client.email)
    const clientEmailResult = await sendEmail({
      to: order.client.email,
      ...emailTemplates.finalCompletion(order)
    })
    console.log('Client final completion notification sent:', clientEmailResult)

    // Send completion confirmation to artist
    console.log('Sending final completion notification to artist:', order.artist.email)
    const artistEmailResult = await sendEmail({
      to: order.artist.email,
      ...emailTemplates.finalCompletion(order)
    })
    console.log('Artist final completion notification sent:', artistEmailResult)

    console.log('All final completion notifications sent successfully')
  } catch (error) {
    console.error('Error sending final completion notifications:', error)
    throw error
  }
}

export const sendWelcomeEmail = async (email: string, name: string, isArtist: boolean) => {
  try {
    console.log('Sending welcome email to:', email, 'isArtist:', isArtist)
    
    const welcomeTemplate = emailTemplates.welcome(name || email.split('@')[0], isArtist)
    console.log('Welcome email template prepared:', {
      subject: welcomeTemplate.subject,
      htmlLength: welcomeTemplate.html.length
    })
    
    const result = await sendEmail({
      to: email,
      ...welcomeTemplate
    })
    
    console.log('Welcome email sent successfully:', {
      to: email,
      isArtist,
      timestamp: new Date().toISOString()
    })
    
    return result
  } catch (error) {
    console.error('Error sending welcome email:', {
      error,
      email,
      isArtist
    })
    // Don't throw error to prevent blocking signup process
    return null
  }
}

export const sendVerificationEmail = async (email: string) => {
  try {
    console.log('Sending verification email to:', email)
    
    // Generate a verification link
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-success`,
    })
    
    if (error) {
      console.error('Error generating verification link:', error)
      throw error
    }
    
    // Create a verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${data?.user?.confirmation_token}`
    
    // Send the verification email
    const verifyTemplate = emailTemplates.verifyEmail(verificationLink)
    console.log('Verification email template prepared:', {
      subject: verifyTemplate.subject,
      htmlLength: verifyTemplate.html.length
    })
    
    const result = await sendEmail({
      to: email,
      ...verifyTemplate
    })
    
    console.log('Verification email sent successfully:', {
      to: email,
      timestamp: new Date().toISOString()
    })
    
    return result
  } catch (error) {
    console.error('Error sending verification email:', {
      error,
      email
    })
    throw error
  }
} 