'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [authMethod, setAuthMethod] = useState<'password' | 'magic'>('password')

  useEffect(() => {
    // Check for error in URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    if (errorParam === 'callback_failed') {
      setError('Sign in failed. Please try again.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      if (authMethod === 'password') {
        // Password-based sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        // Redirect to dashboard on success
        router.push('/artist/dashboard')
      } else {
        // Magic link sign in
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error

        setMessage('Check your email for the magic link!')
      }
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
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
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Sign In
          </h2>

          <div className="mb-6 flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAuthMethod('password')}
              className={`px-4 py-2 rounded-lg ${
                authMethod === 'password'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Password
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAuthMethod('magic')}
              className={`px-4 py-2 rounded-lg ${
                authMethod === 'magic'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Magic Link
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {authMethod === 'password' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="w-full glass-button px-6 py-3 text-white rounded-lg disabled:opacity-50"
            >
              {isLoading
                ? 'Signing in...'
                : authMethod === 'password'
                ? 'Sign In'
                : 'Send Magic Link'}
            </motion.button>

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
              <button
                type="button"
                onClick={() => router.push('/auth/signup')}
                className="text-violet-400 hover:text-violet-300"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
} 