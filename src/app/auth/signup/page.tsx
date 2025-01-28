'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [userType, setUserType] = useState<'client' | 'artist'>('client')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      // First check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id, is_artist')
        .eq('email', email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingUser) {
        setError('An account with this email already exists. Please sign in instead.')
        return
      }

      // Clear any existing user type first
      localStorage.removeItem('isArtistSignup')
      // Store new user type in localStorage
      localStorage.setItem('isArtistSignup', userType === 'artist' ? 'true' : 'false')
      console.log('Stored user type in localStorage:', userType)

      const { error: signUpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        }
      })

      if (signUpError) throw signUpError

      toast.success('Check your email for the magic link!')
      setMessage('Check your email for the magic link!')
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
      toast.error(error.message)
      // Clear localStorage on error
      localStorage.removeItem('isArtistSignup')
    } finally {
      setIsLoading(false)
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
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="mt-2 text-gray-300">Join as an artist or client</p>
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
                Join as Client
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
                Join as Artist
              </button>
            </div>
            <p className="text-gray-400 text-center mt-4">
              {userType === 'artist'
                ? 'Create an account to showcase your work and get hired'
                : 'Create an account to hire talented artists'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="Enter your email"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {message && (
              <div className="text-green-400 text-sm text-center">
                {message}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full glass-button px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Sign Up with Email'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-violet-400 hover:text-violet-300">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 