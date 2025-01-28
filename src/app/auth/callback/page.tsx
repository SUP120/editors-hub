'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Suspense } from 'react'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Starting auth callback...')
        
        // Get the code and type from URL
        const code = searchParams.get('code')
        const userType = searchParams.get('type')
        
        console.log('URL parameters:', { code, userType })

        if (!code) {
          console.error('No code in URL')
          throw new Error('No code provided')
        }

        // Exchange code for session
        console.log('Exchanging code for session...')
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          console.error('Exchange error:', exchangeError)
          throw exchangeError
        }
        console.log('Code exchanged successfully')

        // Get session
        console.log('Getting session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          console.error('Session error:', sessionError)
          throw sessionError
        }
        if (!session) {
          console.error('No session found after exchange')
          toast.error('No session found')
          router.push('/auth/signin')
          return
        }
        console.log('Got session for user:', session.user.email)

        // Check if user exists in profiles
        console.log('Checking for existing profile...')
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile error:', profileError)
          throw profileError
        }

        // If no profile exists, this is a signup
        if (!profile) {
          console.log('No profile found - handling signup...')
          
          if (!userType) {
            console.error('No user type found in URL')
            toast.error('User type not found')
            router.push('/auth/signup')
            return
          }

          try {
            const isArtist = userType === 'artist'
            
            // Create profile
            console.log('Creating profile...')
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || '',
                is_artist: isArtist,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (createError) throw createError
            console.log('Profile created successfully')

            // If artist, create artist profile
            if (isArtist) {
              console.log('Creating artist profile...')
              const { error: artistProfileError } = await supabase
                .from('artist_profiles')
                .insert({
                  id: session.user.id,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })

              if (artistProfileError) throw artistProfileError
              console.log('Artist profile created successfully')
              
              console.log('Redirecting to artist profile...')
              router.push('/artist/profile')
              return
            } else {
              console.log('Redirecting to browse works...')
              router.push('/browse-works')
              return
            }
          } catch (error: any) {
            console.error('Profile creation error:', error)
            throw error
          }
        } else {
          // This is a signin - redirect based on existing profile type
          console.log('Existing profile found - handling signin...')
          if (profile.is_artist) {
            console.log('Redirecting artist to dashboard...')
            router.push('/dashboard')
          } else {
            console.log('Redirecting client to browse...')
            router.push('/browse-works')
          }
        }
      } catch (error: any) {
        console.error('Callback error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          stack: error.stack
        })
        
        toast.error('Authentication failed. Please try again.')
        router.push('/auth/signup')
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg">Authenticating...</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  )
} 