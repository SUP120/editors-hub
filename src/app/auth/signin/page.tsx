'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi'

export default function SignIn() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [giraffeMessage, setGiraffeMessage] = useState("Welcome! I'm Geoffrey, your friendly guide! 🦒")

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
            router.push('/artist/profile')
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

  useEffect(() => {
    const messages = [
      "Welcome! I'm Geoffrey, your friendly guide! 🦒",
      "Need help signing in? Just ask me! 🌟",
      "Great to see you again! Let's get you logged in! ✨",
      "Security tip: Make sure you're on the right website! 🔒",
      "Don't worry, I'll keep your details safe! 🛡️"
    ]
    
    const interval = setInterval(() => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      setGiraffeMessage(randomMessage)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/5 rounded-full"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="max-w-md mx-auto relative">
        {/* Giraffe Assistant - Adjusted positioning and z-index */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed right-8 top-1/2 transform -translate-y-1/2 w-32 h-32 pointer-events-none z-10"
        >
          <div className="relative">
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-32 h-32"
            >
              <div className="relative">
                {/* Giraffe Body */}
                <div className="absolute bottom-0 w-24 h-28 bg-gradient-to-b from-[#FFC947] to-[#FFA000] rounded-3xl transform -rotate-6">
                  <div className="absolute inset-0 bg-[#FFB74D] opacity-50 mix-blend-overlay rounded-3xl" />
                  <div className="absolute top-0 right-0 w-10 h-10 bg-[#795548] rounded-full transform translate-x-1 -translate-y-1" /> {/* Spots */}
                  <div className="absolute bottom-4 left-2 w-8 h-8 bg-[#795548] rounded-full" /> {/* Spots */}
                  <div className="absolute top-8 left-4 w-6 h-6 bg-[#795548] rounded-full" /> {/* Additional spot */}
                </div>
                {/* Giraffe Neck */}
                <div className="absolute bottom-24 left-10 w-10 h-24 bg-gradient-to-b from-[#FFC947] to-[#FFA000] rounded-t-xl transform -rotate-12">
                  <div className="absolute inset-0 bg-[#FFB74D] opacity-50 mix-blend-overlay rounded-t-xl" />
                  <div className="absolute top-2 right-0 w-6 h-6 bg-[#795548] rounded-full" /> {/* Spots */}
                  <div className="absolute bottom-4 left-0 w-6 h-6 bg-[#795548] rounded-full" /> {/* Spots */}
                  <div className="absolute top-10 right-2 w-5 h-5 bg-[#795548] rounded-full" /> {/* Additional spot */}
                </div>
                {/* Giraffe Head */}
                <div className="absolute bottom-44 left-4 w-14 h-20 bg-gradient-to-b from-[#FFC947] to-[#FFA000] rounded-t-xl transform rotate-12">
                  <div className="absolute inset-0 bg-[#FFB74D] opacity-50 mix-blend-overlay rounded-t-xl" />
                  <div className="absolute top-0 left-1/2 w-3 h-5 bg-[#795548] rounded-full transform -translate-x-1/2 -translate-y-3" /> {/* Horn */}
                  <div className="absolute top-0 left-1/2 w-3 h-5 bg-[#795548] rounded-full transform -translate-x-1/2 translate-x-4 -translate-y-2 rotate-30" /> {/* Second Horn */}
                  <div className="absolute top-4 right-2 w-4 h-4 bg-[#4A148C] rounded-full shadow-inner" /> {/* Eye */}
                  <div className="absolute top-4 right-3 w-2 h-2 bg-white rounded-full" /> {/* Eye highlight */}
                  <div className="absolute top-8 right-1 w-8 h-3 bg-[#795548] rounded-full" /> {/* Mouth */}
                </div>
              </div>
            </motion.div>
            {/* Speech Bubble - Adjusted positioning */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -left-48 top-0 bg-white rounded-xl p-4 shadow-lg min-w-[200px] pointer-events-none"
            >
              <p className="text-sm text-gray-800 font-medium">{giraffeMessage}</p>
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-l-[16px] border-l-white border-b-8 border-b-transparent" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-violet-500/20 relative z-20"
        >
          <div className="text-center mb-8">
            <motion.h2 
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              Welcome Back
            </motion.h2>
            <p className="mt-2 text-blue-200">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label 
                htmlFor="email" 
                className={`block text-sm font-medium transition-colors duration-200 ${
                  focusedField === 'email' ? 'text-violet-400' : 'text-blue-200'
                }`}
              >
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className={`h-5 w-5 transition-colors duration-200 ${
                    focusedField === 'email' ? 'text-violet-400' : 'text-gray-500'
                  }`} />
                </div>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-800/50 border border-violet-700/50 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="relative">
              <label 
                htmlFor="password" 
                className={`block text-sm font-medium transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-violet-400' : 'text-blue-200'
                }`}
              >
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className={`h-5 w-5 transition-colors duration-200 ${
                    focusedField === 'password' ? 'text-violet-400' : 'text-gray-500'
                  }`} />
                </div>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="block w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-violet-700/50 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-500 hover:text-violet-300 transition-colors duration-200" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-500 hover:text-violet-300 transition-colors duration-200" />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded-lg border border-red-400/20"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full relative px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50 overflow-hidden group bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-300"
            >
              <span className="relative z-10">
                {isLoading ? 'Signing in...' : 'Sign in'}
              </span>
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-200">
              Don't have an account?{' '}
              <Link 
                href="/auth/signup" 
                className="text-violet-400 hover:text-violet-300 relative group"
              >
                Sign up
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 