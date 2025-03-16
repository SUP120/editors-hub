'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function VerifySuccess() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // If not authenticated, redirect to sign in
        router.push('/auth/signin')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h2 className="text-3xl font-bold text-white">Email Verified!</h2>
            <p className="mt-4 text-gray-300">
              Your email has been successfully verified. You can now access all features of the Artist Hiring Platform.
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-gray-300 text-center">
              <p>You now have full access to:</p>
              <ul className="mt-2 space-y-2">
                <li>✓ Commission artists</li>
                <li>✓ Showcase your work</li>
                <li>✓ Communicate with clients</li>
                <li>✓ Manage your orders</li>
              </ul>
            </div>

            <div className="text-center space-y-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/browse-works"
                  className="block w-full py-3 px-4 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
                >
                  Browse Artists
                </Link>
              </motion.div>
              
              <p className="text-gray-400">
                Join our Discord community for support and updates:
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a
                  href="https://discord.com/invite/YWFD72HV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 px-4 rounded-lg bg-[#5865F2] text-white font-medium hover:bg-[#4752C4] transition-colors"
                >
                  Join Discord
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 