'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser, FiCheck, FiX } from 'react-icons/fi'
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email'

export default function SignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'client' as 'client' | 'artist'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    number: false,
    special: false,
    uppercase: false
  })

  // Add state for dynamic giraffe messages
  const [giraffeMessage, setGiraffeMessage] = useState("Hi! I'm Geoffrey, I'll help you create a secure account! 🦒")
  
  useEffect(() => {
    const messages = [
      "Hi! I'm Geoffrey, I'll help you create a secure account! 🦒",
      "Choose a strong password to keep your account safe! 🔐",
      "I'll guide you through the signup process! ✨",
      "Almost there! Just fill in your details! 🌟",
      "Ready to join our creative community? Let's go! 🎨"
    ]
    
    const interval = setInterval(() => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      setGiraffeMessage(randomMessage)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setPasswordStrength({
      length: formData.password.length >= 8,
      number: /\d/.test(formData.password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
      uppercase: /[A-Z]/.test(formData.password)
    })
  }, [formData.password])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // First check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingUser) {
        setError('An account with this email already exists. Please sign in instead.')
        return
      }

      // Sign up with email and password
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      })

      if (signUpError) throw signUpError
      
      if (authData.user) {
        // Create base profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            is_artist: formData.userType === 'artist',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw profileError
        }

        // If artist, create artist profile
        if (formData.userType === 'artist') {
          const { error: artistProfileError } = await supabase
            .from('artist_profiles')
            .insert({
              id: authData.user.id,
              specialty: [],
              skills: [],
              hourly_rate: 0,
              years_of_experience: 0,
              rating: 0,
              total_reviews: 0,
              portfolio_urls: [],
              education: [],
              certifications: [],
              languages: [],
              social_links: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (artistProfileError) {
            console.error('Artist profile creation error:', artistProfileError)
            throw artistProfileError
          }

          // Send welcome email
          try {
            await sendWelcomeEmail(formData.email, '', formData.userType === 'artist')
            console.log('Welcome email sent to artist:', formData.email)
          } catch (emailError) {
            console.error('Error sending welcome email:', emailError)
            // Don't block signup process if email fails
          }

          // Send verification email
          try {
            await sendVerificationEmail(formData.email)
            console.log('Verification email sent to artist:', formData.email)
          } catch (verifyError) {
            console.error('Error sending verification email:', verifyError)
            // Don't block signup process if email fails
          }

          // Redirect artist to verify email page
          toast.success('Account created! Please check your email to verify your account.')
          router.push('/auth/verify')
        } else {
          // Send welcome email
          try {
            await sendWelcomeEmail(formData.email, '', formData.userType === 'artist')
            console.log('Welcome email sent to client:', formData.email)
          } catch (emailError) {
            console.error('Error sending welcome email:', emailError)
            // Don't block signup process if email fails
          }

          // Send verification email
          try {
            await sendVerificationEmail(formData.email)
            console.log('Verification email sent to client:', formData.email)
          } catch (verifyError) {
            console.error('Error sending verification email:', verifyError)
            // Don't block signup process if email fails
          }

          // Redirect client to verify email page
          toast.success('Account created! Please check your email to verify your account.')
          router.push('/auth/verify')
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

  const PasswordStrengthIndicator = ({ label, met }: { label: string; met: boolean }) => (
    <div className="flex items-center space-x-2 text-sm">
      {met ? (
        <FiCheck className="text-green-400" />
      ) : (
        <FiX className="text-gray-400" />
      )}
      <span className={met ? 'text-green-400' : 'text-gray-400'}>{label}</span>
    </div>
  )

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
              Create Account
            </motion.h2>
            <p className="mt-2 text-blue-200">Join as an artist or client</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setFormData({ ...formData, userType: 'client' })}
                className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                  formData.userType === 'client'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/50'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FiUser />
                  <span>Join as Client</span>
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setFormData({ ...formData, userType: 'artist' })}
                className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                  formData.userType === 'artist'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/50'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FiUser />
                  <span>Join as Artist</span>
                </div>
              </motion.button>
            </div>
            <p className="text-blue-200 text-center mt-4">
              {formData.userType === 'artist'
                ? 'Create an account to showcase your work and get hired'
                : 'Create an account to hire talented artists'}
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
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
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="block w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-violet-700/50 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                  placeholder="Create a password"
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
              
              <AnimatePresence>
                {focusedField === 'password' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 p-3 bg-gray-800/30 rounded-lg space-y-2"
                  >
                    <PasswordStrengthIndicator label="At least 8 characters 📏" met={passwordStrength.length} />
                    <PasswordStrengthIndicator label="Contains a number 1️⃣" met={passwordStrength.number} />
                    <PasswordStrengthIndicator label="Contains a special character #️⃣" met={passwordStrength.special} />
                    <PasswordStrengthIndicator label="Contains uppercase letter 🔠" met={passwordStrength.uppercase} />
                  </motion.div>
                )}
              </AnimatePresence>
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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </span>
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-200">
              Already have an account?{' '}
              <Link 
                href="/auth/signin" 
                className="text-violet-400 hover:text-violet-300 relative group"
              >
                Sign in
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 