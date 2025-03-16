'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const sendTestEmail = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Call the test email API
      const response = await fetch(`/api/test-email-gmail?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      setResult(data)
      
      if (data.success) {
        toast.success('Test email sent! Please check your inbox and spam folder.')
      } else {
        toast.error('Failed to send test email. See details below.')
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      setResult({ error: 'Failed to send test email', details: error })
      toast.error('Error sending test email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Email Delivery Test</h1>
            <p className="mt-2 text-gray-300">
              Test email delivery to your Gmail account
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Your Gmail Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={sendTestEmail}
              disabled={loading}
              className="w-full glass-button px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Test Email'}
            </motion.button>

            {result && (
              <div className="mt-6 p-4 rounded-lg bg-gray-800 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-2">Result:</h3>
                <pre className="text-sm text-gray-300 overflow-auto max-h-60">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            <div className="text-gray-400 text-sm">
              <p>Troubleshooting tips:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Check your spam/junk folder</li>
                <li>Verify the email address is correct</li>
                <li>Add onboarding@resend.dev to your contacts</li>
                <li>Check the Resend dashboard for delivery status</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 