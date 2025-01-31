import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Session exchange error:', error)
      return NextResponse.redirect(new URL('/auth/signin', process.env.NEXT_PUBLIC_SITE_URL))
    }

    if (!session) {
      console.error('No session available')
      return NextResponse.redirect(new URL('/auth/signin', process.env.NEXT_PUBLIC_SITE_URL))
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_artist')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      // Redirect based on user type
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin
      if (profile.is_artist) {
        return NextResponse.redirect(new URL('/artist/complete-profile', baseUrl))
      } else {
        return NextResponse.redirect(new URL('/browse-works', baseUrl))
      }
    }
  }

  // Default redirect
  return NextResponse.redirect(new URL('/auth/signin', process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin))
} 