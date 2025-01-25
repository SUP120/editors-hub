import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY || 're_Y5EFsz5v_C129wqeQhYeXUo22KeUQB4VX')

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json()

    const data = await resend.emails.send({
      from: 'Artist Hiring <onboarding@resend.dev>',
      to,
      subject,
      html,
      // Adding additional configuration for better deliverability
      tags: [{ name: 'category', value: 'notification' }],
      headers: {
        'X-Entity-Ref-ID': new Date().getTime().toString(),
      }
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
} 