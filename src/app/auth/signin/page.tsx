'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import Navbar from '@/components/Navbar'

export default function SignIn() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (signInError) throw signInError

      if (data.user) {
        // Get user profile to check type
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_artist')
          .eq('id', data.user.id)
          .single()

        if (profileError) throw profileError

        toast.success('Welcome back!')
        
        // Redirect based on user type
        if (profile.is_artist) {
          // Check if artist has completed their profile
          const { data: artistProfile } = await supabase
            .from('artist_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (!artistProfile) {
            router.push('/artist/complete-profile')
          } else {
            router.push('/artist/dashboard')
          }
        } else {
          router.push('/browse-works')
        }
      }
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
              <p className="mt-2 text-gray-300">Sign in to your account</p>
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
                  placeholder="Enter your email address"
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="Enter your password"
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
                {isLoading ? 'Signing In...' : 'Sign In'}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-violet-400 hover:text-violet-300">
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
} 