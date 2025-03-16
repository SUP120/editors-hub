import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend('re_JurY5sEo_5drSdk8gGZog7Bo3awtfoyhm')

export async function GET(request: Request) {
  try {
    // Get the email from query parameter or use a default
    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get('email')
    
    if (!testEmail) {
      return NextResponse.json({ 
        error: 'Email parameter is required',
        example: '/api/test-email-gmail?email=your.email@gmail.com'
      }, { status: 400 })
    }

    console.log('Sending test email to Gmail:', testEmail)
    
    // Current timestamp for unique subject
    const timestamp = new Date().toISOString()
    
    const data = await resend.emails.send({
      from: 'Artist Hiring <onboarding@resend.dev>',
      to: [testEmail],
      reply_to: 'support@artisthiring.com',
      subject: `Test Email to Gmail - ${timestamp}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email to Gmail</h2>
          <p>This is a test email to verify the email notification system with Gmail.</p>
          <p>If you received this email, it means the email system is working correctly with Gmail.</p>
          <p>Time sent: ${timestamp}</p>
          <p>This is a direct test to your Gmail account to troubleshoot delivery issues.</p>
        </div>
      `,
      text: `Test Email to Gmail\n\nThis is a test email to verify the email notification system with Gmail.\nIf you received this email, it means the email system is working correctly with Gmail.\nTime sent: ${timestamp}\nThis is a direct test to your Gmail account to troubleshoot delivery issues.`,
      tags: [{ name: 'category', value: 'test' }, { name: 'provider', value: 'gmail' }],
    })

    console.log('Test email to Gmail sent:', data)
    return NextResponse.json({ 
      success: true, 
      data,
      sentTo: testEmail,
      timestamp: timestamp,
      message: 'Test email sent to Gmail. Please check your inbox and spam folder.'
    })
  } catch (error: any) {
    console.error('Test email to Gmail error:', error)
    return NextResponse.json({ 
      error: 'Failed to send test email to Gmail', 
      details: error.message,
      response: error.response?.body,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 