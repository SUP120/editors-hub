'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'

export default function SignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'client' as 'client' | 'artist'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=${formData.userType}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) throw error

      // Add loading state while redirecting
      setIsLoading(true)
      toast.loading('Redirecting to Google...')
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
      toast.error(error.message)
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // First check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id, is_artist')
        .eq('email', formData.email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingUser) {
        setError('An account with this email already exists. Please sign in instead.')
        return
      }

      console.log('Starting signup process...')
      
      // Sign up with email and password
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            is_artist: formData.userType === 'artist'
          }
        }
      })

      if (signUpError) throw signUpError
      
      console.log('Auth signup successful:', authData)

      if (authData.user) {
        // Sign in immediately after signup
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (signInError) throw signInError
        console.log('Signed in after signup:', signInData)

        // Create profile
        console.log('Creating profile for user:', authData.user.id)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            is_artist: formData.userType === 'artist',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw new Error(`Failed to create profile: ${profileError.message}`)
        }

        console.log('Profile created successfully:', profileData)

        // If artist, create artist profile
        if (formData.userType === 'artist') {
          console.log('Creating artist profile...')
          const { data: artistData, error: artistProfileError } = await supabase
            .from('artist_profiles')
            .insert({
              id: authData.user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()

          if (artistProfileError) {
            console.error('Artist profile creation error:', artistProfileError)
            throw new Error(`Failed to create artist profile: ${artistProfileError.message}`)
          }

          console.log('Artist profile created successfully:', artistData)
          toast.success('Account created! Please complete your artist profile.')
          router.push('/artist/complete-profile')
        } else {
          // For clients, redirect to browse works
          toast.success('Account created! Welcome to Editor\'s Hub.')
          router.push('/browse-works')
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      setError(error.message || 'An unexpected error occurred')
      toast.error(error.message || 'An unexpected error occurred')
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
                onClick={() => setFormData({ ...formData, userType: 'client' })}
                className={`px-6 py-3 rounded-lg ${
                  formData.userType === 'client'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Join as Client
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, userType: 'artist' })}
                className={`px-6 py-3 rounded-lg ${
                  formData.userType === 'artist'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Join as Artist
              </button>
            </div>
            <p className="text-gray-400 text-center mt-4">
              {formData.userType === 'artist'
                ? 'Create an account to showcase your work and get hired'
                : 'Create an account to hire talented artists'}
            </p>
          </div>

          {/* Google Sign Up Button */}
          <div className="mb-6">
            <button
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-lg text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <FcGoogle className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or continue with email</span>
            </div>
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="Create a password"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full glass-button px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
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