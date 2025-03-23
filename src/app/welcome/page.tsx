'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import Navbar from '@/components/Navbar'

export default function WelcomePage() {
  const router = useRouter()
  const [userType, setUserType] = useState<'artist' | 'client' | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_artist')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      setUserType(profile.is_artist ? 'artist' : 'client')

      // If artist, check if they have completed their profile
      if (profile.is_artist) {
        const { data: artistProfile } = await supabase
          .from('artist_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setHasCompletedProfile(!!artistProfile)
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (userType === 'artist' && !hasCompletedProfile) {
      router.push('/artist/complete-profile')
    } else if (userType === 'artist' && hasCompletedProfile) {
      router.push('/artist/profile')
    } else {
      router.push('/browse-works')
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-8 max-w-md w-full text-center"
        >
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to Editor's Hub!</h1>
          
          <p className="text-gray-300 mb-8">
            {userType === 'artist'
              ? hasCompletedProfile 
                ? 'Welcome back! Continue to your artist profile.'
                : 'Ready to showcase your creative work? Complete your artist profile to get started.'
              : 'Ready to discover amazing artists? Start browsing creative works.'}
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="glass-button px-8 py-3 rounded-lg text-white font-medium w-full"
          >
            {userType === 'artist' 
              ? hasCompletedProfile 
                ? 'Go to Profile'
                : 'Complete Profile'
              : 'Browse Works'}
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
} 