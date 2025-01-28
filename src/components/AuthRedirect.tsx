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
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event)
        
        if (event === 'SIGNED_IN' && session) {
          try {
            // Check if user exists in profiles
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (!profile) {
              // Get user type from URL if this is a signup
              const userType = searchParams.get('type')
              console.log('User type from URL:', userType)

              if (userType) {
                const isArtist = userType === 'artist'
                
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

                // If artist, create artist profile
                if (isArtist) {
                  const { error: artistProfileError } = await supabase
                    .from('artist_profiles')
                    .insert({
                      id: session.user.id,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    })

                  if (artistProfileError) throw artistProfileError
                  
                  router.push('/artist/profile')
                } else {
                  router.push('/browse-works')
                }
              }
            } else {
              // Existing user - redirect based on type
              if (profile.is_artist) {
                router.push('/dashboard')
              } else {
                router.push('/browse-works')
              }
            }
          } catch (error: any) {
            console.error('Error in auth redirect:', error)
            toast.error('Something went wrong. Please try again.')
          }
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }

    handleAuthChanges()
  }, [router, searchParams])

  // Check for auth code in URL
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      console.log('Found auth code in URL, exchanging...')
      supabase.auth.exchangeCodeForSession(code)
    }
  }, [searchParams])

  return null
} 