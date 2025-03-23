import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend('re_JurY5sEo_5drSdk8gGZog7Bo3awtfoyhm')

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json()
    
    console.log('Email API called with:', {
      to,
      subject,
      timestamp: new Date().toISOString()
    })

    if (!to || !subject || !html) {
      console.error('Missing required email fields:', { to, subject, html: !!html })
      return NextResponse.json(
        { error: 'Missing required email fields' },
        { status: 400 }
      )
    }

    try {
      // Ensure 'to' is always an array
      const toAddresses = Array.isArray(to) ? to : [to]
      
      console.log('Sending email with Resend:', {
        to: toAddresses,
        subject,
        timestamp: new Date().toISOString()
      })

      const data = await resend.emails.send({
        from: 'Artist Hiring <onboarding@resend.dev>',
        to: toAddresses,
        reply_to: 'support@artisthiring.com',
        subject,
        html,
        text: html.replace(/<[^>]*>/g, ''),
        tags: [{ name: 'category', value: 'notification' }],
        headers: {
          'X-Entity-Ref-ID': new Date().getTime().toString(),
        }
      })

      console.log('Resend API Response:', data)

      if (!data || !data.id) {
        throw new Error('No email ID returned from Resend')
      }

      return NextResponse.json({
        success: true,
        messageId: data.id,
        timestamp: new Date().toISOString(),
        to: toAddresses
      })
    } catch (sendError: any) {
      console.error('Resend API Error:', {
        error: sendError.message,
        code: sendError.statusCode,
        details: sendError.response?.body,
        stack: sendError.stack
      })
      
      throw sendError
    }
  } catch (error: any) {
    console.error('Email sending error:', {
      error: error.message,
      details: error.response?.body || error,
      stack: error.stack
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error.message,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
} 