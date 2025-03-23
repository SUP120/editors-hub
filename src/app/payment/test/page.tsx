'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FiDollarSign, FiCreditCard, FiUser, FiMail, FiPhone } from 'react-icons/fi'

export default function TestCashfreePage() {
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState(() => {
    // Generate a proper UUID v4 format
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  })
  const [amount, setAmount] = useState('204')
  const [customerName, setCustomerName] = useState('Test Customer')
  const [customerEmail, setCustomerEmail] = useState('test@example.com')
  const [customerPhone, setCustomerPhone] = useState('9876543210')

  const handleTestPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Initiating test payment with Cashfree:', { 
        orderId, amount, customerName, customerEmail, customerPhone 
      })

      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          customerName,
          customerEmail,
          customerPhone
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to initiate payment')
      }

      const data = await response.json()

      if (!data.paymentLink) {
        throw new Error('No payment link received')
      }

      console.log('Payment initiated successfully:', { 
        orderId, 
        paymentLink: !!data.paymentLink, 
        sessionId: data.paymentSessionId 
      })

      toast.success('Payment initiated! Redirecting to Cashfree...')
      
      // Redirect to the payment link
      window.location.href = data.paymentLink
    } catch (error: any) {
      console.error('Error initiating payment:', error)
      toast.error(error.message || 'Failed to initiate payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-violet-900 py-12">
      <div className="max-w-lg mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Test Cashfree Payment</h1>
            <p className="text-gray-300 mt-2">Use this form to test the real Cashfree payment integration</p>
          </div>

          <form onSubmit={handleTestPayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Order ID</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FiDollarSign />
                </span>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="bg-gray-800 text-white w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Amount (₹)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FiCreditCard />
                </span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-800 text-white w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Customer Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FiUser />
                </span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-gray-800 text-white w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Customer Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FiMail />
                </span>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="bg-gray-800 text-white w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Customer Phone</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FiPhone />
                </span>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="bg-gray-800 text-white w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FiCreditCard className="mr-2" />
                  Test Cashfree Payment
                </>
              )}
            </motion.button>
          </form>

          <p className="text-xs text-gray-400 mt-6 text-center">
            This will initiate a real test payment with Cashfree. You will be redirected to the Cashfree payment page.
          </p>
        </motion.div>
      </div>
    </div>
  )
} 