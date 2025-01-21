'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the user after auth callback
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No user found')

        // Check if user already has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError
        }

        if (profile) {
          // User has a profile, check if they're an artist
          if (profile.is_artist) {
            // Artist profile exists, redirect to dashboard
            router.push('/artist/dashboard')
          } else {
            // Regular user profile exists, redirect to client dashboard
            router.push('/dashboard')
          }
        } else {
          // No profile exists, redirect to profile creation
          router.push('/auth/complete-profile')
        }
      } catch (error) {
        console.error('Error in auth callback:', error)
        router.push('/auth/signin?error=callback_failed')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
      <div className="glass-card p-8 rounded-xl text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto mb-4"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  )
} 