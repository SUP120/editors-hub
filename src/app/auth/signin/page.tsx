'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function SignIn() {
  const router = useRouter()
  const [userType, setUserType] = useState<'client' | 'artist'>('client')

  const handleSignInWithGoogle = async () => {
    try {
      // Store the user type intention in localStorage
      localStorage.setItem('isArtistSignup', userType === 'artist' ? 'true' : 'false')

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://artist-hiring-public-dowe8kogu-sup120s-projects.vercel.app'}/auth/callback`
        }
      })

      if (error) throw error
    } catch (error: any) {
      console.error('Error signing in with Google:', error)
      toast.error(error.message || 'Failed to sign in with Google')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Welcome to Editor's Hub</h2>
            <p className="mt-2 text-gray-300">Sign in or create a new account</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => setUserType('client')}
                className={`px-6 py-3 rounded-lg ${
                  userType === 'client'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Continue as Client
              </button>
              <button
                type="button"
                onClick={() => setUserType('artist')}
                className={`px-6 py-3 rounded-lg ${
                  userType === 'artist'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Continue as Artist
              </button>
            </div>
            <p className="text-gray-400 text-center mt-4">
              {userType === 'artist'
                ? 'Access your artist dashboard or create a new artist account'
                : 'Browse works or create a new client account'}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignInWithGoogle}
            className="w-full flex items-center justify-center px-6 py-4 bg-white rounded-lg text-gray-800 hover:bg-gray-50 transition-colors font-medium"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </motion.button>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              By signing in, you agree to our{' '}
              <Link href="/about" className="text-violet-400 hover:text-violet-300">
                Terms & Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 