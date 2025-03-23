'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

export default function AuthRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthChanges = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (session?.user) {
          console.log('Found session for user:', session.user.email)

          // Check if user exists in profiles
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError
          }

          if (!profile) {
            console.log('No profile found - creating new profile...')
            const userType = searchParams.get('type') || 'client'
            const isArtist = userType === 'artist'

            try {
              // Create profile
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

              // If artist, create artist profile placeholder
              if (isArtist) {
                const { error: artistProfileError } = await supabase
                  .from('artist_profiles')
                  .insert({
                    id: session.user.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  })

                if (artistProfileError) throw artistProfileError
                console.log('Artist profile placeholder created successfully')
                
                // Redirect artist to complete profile
                router.push('/artist/complete-profile')
                return
              }
              
              // Redirect client to browse works
              router.push('/browse-works')
            } catch (error: any) {
              console.error('Profile creation error:', error)
              throw error
            }
          } else {
            // Existing user - redirect based on type and profile completion
            if (profile.is_artist) {
              // Check if artist has completed their profile
              const { data: artistProfile } = await supabase
                .from('artist_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

              if (!artistProfile) {
                router.push('/artist/complete-profile')
              } else {
                router.push('/artist/profile')
              }
            } else {
              router.push('/browse-works')
            }
          }
        }
      } catch (error: any) {
        console.error('Error in auth redirect:', error)
        toast.error('Authentication failed. Please try again.')
        router.push('/auth/signin')
      }
    }

    // Check for auth code in URL
    const code = searchParams.get('code')
    if (code) {
      console.log('Found auth code in URL, handling authentication...')
      supabase.auth.exchangeCodeForSession(code).then(() => {
        handleAuthChanges()
      })
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event)
      if (event === 'SIGNED_IN' && session) {
        handleAuthChanges()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, searchParams])

  return null
} 