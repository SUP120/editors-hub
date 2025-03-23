'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function VerifyEmail() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Check Your Email</h2>
            <p className="mt-4 text-gray-300">
              We've sent you a verification link to your email address. Please check your inbox and click the link to verify your account.
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-gray-300 text-center">
              <p>Once verified, you can</p>
              <ul className="mt-2 space-y-2">
                <li>✓ Sign in to your account</li>
                <li>✓ Access all features</li>
                <li>✓ Start using the platform</li>
              </ul>
            </div>

            <div className="text-center">
              <Link
                href="/auth/signin"
                className="text-violet-400 hover:text-violet-300 font-medium"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 