'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    isArtist: false
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    setIsLoading(true)
    setError('')

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            is_artist: formData.isArtist
          }
        }
      })

      if (signInError) {
        throw signInError
      }

      // Store artist status in localStorage as backup
      if (formData.isArtist) {
        localStorage.setItem('isArtist', 'true')
      }

      setEmailSent(true)
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message || 'Failed to send login link')
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="glass-card rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Check your email
            </h2>
            <p className="text-gray-300 mb-4">
              We've sent a magic link to {formData.email}.<br />
              Click the link in the email to sign in.
            </p>
            <p className="text-gray-400 text-sm">
              {formData.isArtist ? 
                "After signing in, you'll be automatically redirected to complete your artist profile." :
                "After signing in, you'll be automatically redirected to your dashboard."
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="glass-card rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                required
                className="input-field"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
              
              <div className="flex items-center">
                <input
                  id="is-artist"
                  type="checkbox"
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-700 rounded bg-gray-800"
                  checked={formData.isArtist}
                  onChange={e => setFormData({...formData, isArtist: e.target.checked})}
                />
                <label htmlFor="is-artist" className="ml-2 block text-sm text-gray-300">
                  I want to sell my editing services
                </label>
              </div>

              <div className="text-sm text-gray-400">
                We'll send you a magic link to sign in - no password needed!
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full glass-button py-3 text-white font-medium rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Sending magic link...' : 'Get magic link'}
            </button>

            {error && (
              <div className="text-red-500 text-center mt-2">
                {error}
              </div>
            )}

            <div className="text-center text-sm">
              <Link href="/auth/signin" className="text-violet-400 hover:text-violet-300">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 