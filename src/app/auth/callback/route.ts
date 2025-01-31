import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Session exchange error:', error)
      return NextResponse.redirect(new URL('/auth/signin?error=callback_failed', process.env.NEXT_PUBLIC_SITE_URL))
    }

    if (!session) {
      console.error('No session available')
      return NextResponse.redirect(new URL('/auth/signin?error=no_session', process.env.NEXT_PUBLIC_SITE_URL))
    }

    try {
      // Get user metadata to check if they're an artist
      const isArtist = session.user.user_metadata?.is_artist || false

      // Create base profile if it doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          is_artist: isArtist,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (profileError) throw profileError

      // If user is an artist, create artist profile if it doesn't exist
      if (isArtist) {
        const { error: artistProfileError } = await supabase
          .from('artist_profiles')
          .upsert({
            id: session.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })

        if (artistProfileError) throw artistProfileError

        // Redirect artist to complete profile
        return NextResponse.redirect(new URL('/artist/complete-profile', process.env.NEXT_PUBLIC_SITE_URL))
      }

      // Redirect client to browse works
      return NextResponse.redirect(new URL('/browse-works', process.env.NEXT_PUBLIC_SITE_URL))
    } catch (error) {
      console.error('Profile creation error:', error)
      return NextResponse.redirect(new URL('/auth/signin?error=profile_creation_failed', process.env.NEXT_PUBLIC_SITE_URL))
    }
  }

  // Default redirect
  return NextResponse.redirect(new URL('/auth/signin?error=invalid_callback', process.env.NEXT_PUBLIC_SITE_URL))
} 