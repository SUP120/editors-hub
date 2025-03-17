import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend('re_JurY5sEo_5drSdk8gGZog7Bo3awtfoyhm')

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Get the email from query parameter or use a default
    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get('email') || 'test@gmail.com'

    console.log('Sending test email to:', testEmail)
    
    const data = await resend.emails.send({
      from: 'Artist Hiring <onboarding@resend.dev>',
      to: ['itspossible4202@gmail.com'],
      subject: 'Test Email from Artist Hiring Platform',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email</h2>
          <p>This is a test email to verify the email notification system.</p>
          <p>If you received this email, it means the email system is working correctly.</p>
          <p>Time sent: ${new Date().toISOString()}</p>
        </div>
      `
    })

    console.log('Test email sent:', data)
    return NextResponse.json({ 
      success: true, 
      data,
      sentTo: testEmail,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      error: 'Failed to send test email', 
      details: error,
      timestamp: new Date().toISOString()
    })
  }
} 