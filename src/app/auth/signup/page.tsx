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
  const [userType, setUserType] = useState<'artist' | 'client'>('client')
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

      // Store user type in localStorage for callback page
      if (userType === 'artist') {
        localStorage.setItem('isArtist', 'true')
      }

      const { error: signUpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            is_artist: userType === 'artist'
          }
        }
      })

      if (signUpError) throw signUpError

      setMessage('Check your email for the magic link!')
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUpWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback'
        }
      })

      if (error) throw error
    } catch (error: any) {
      console.error('Error signing up with Google:', error)
      toast.error(error.message || 'Failed to sign up with Google')
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
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Create Account
          </h2>

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
              <input
                type="email"
                required
                placeholder="Email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="text-sm text-gray-400 text-center">
              We'll send you a magic link to sign up
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full glass-button py-3 text-white font-medium rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Sending magic link...' : 'Get magic link'}
            </button>

            {error && (
              <div className="text-red-500 text-center mt-4">
                {error}
              </div>
            )}

            {message && (
              <div className="text-green-500 text-center mt-4">
                {message}
              </div>
            )}

            <div className="text-center mt-4">
              <Link href="/auth/signin" className="text-violet-400 hover:text-violet-300">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
} 