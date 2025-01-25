'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (!session) throw new Error('No session found')

        // Check if user profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_artist')
          .eq('id', session.user.id)
          .single()

        // Get the intended role from localStorage (for new signups)
        const intendedRole = localStorage.getItem('isArtistSignup')
        
        if (profileError && profileError.code === 'PGRST116') {
          // This is a new user signing up
          const isArtistSignup = intendedRole === 'true'
          
          // Create basic profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
              is_artist: isArtistSignup,
              is_admin: false
            })

          if (insertError) throw insertError

          // Clear the signup type from storage
          localStorage.removeItem('isArtistSignup')
          
          // New user redirects
          if (isArtistSignup) {
            router.push('/artist/complete-profile') // New artist goes to complete profile
          } else {
            router.push('/browse-works') // New client goes to browse
          }
          return
        } else if (profileError) {
          throw profileError
        }

        // This is a returning user
        localStorage.removeItem('isArtistSignup') // Clean up any leftover flags
        
        // Existing user redirects
        if (profile.is_artist) {
          router.push('/artist/profile') // Existing artist goes to profile
        } else {
          router.push('/browse-works') // Existing client goes to browse
        }
      } catch (error: any) {
        console.error('Auth callback error:', error)
        setError(error.message || 'Authentication failed')
        setTimeout(() => {
          router.push('/auth/signin')
        }, 3000)
      }
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-red-500/10 p-6 rounded-lg text-center">
          <h2 className="text-red-500 text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-gray-300">{error}</p>
          <p className="text-gray-400 mt-2">Redirecting to sign in page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <LoadingSpinner fullScreen text="Completing authentication..." />
    </div>
  )
} 