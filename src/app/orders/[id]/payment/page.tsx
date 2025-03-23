'use client'

import React, { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<any>(null)
  const resolvedParams = use(params)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (orderError) throw orderError

      // Check if the user is the client of this order
      if (orderData.client_id !== user.id) {
        router.push('/orders')
        return
      }

      setOrder(orderData)
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
    }
  }

  const simulatePayment = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Authentication required')

      // Update order status to 'accepted' after successful payment
      const { error } = await supabase
        .from('orders')
        .update({ status: 'pending', payment_status: 'completed' })
        .eq('id', resolvedParams.id)
        .eq('client_id', user.id) // Extra security check

      if (error) throw error

      // Show success message and redirect
      router.push(`/orders/${resolvedParams.id}?payment=success`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-8 max-w-md w-full space-y-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Complete Payment</h1>
          <p className="text-gray-300">This is a simulated payment page for testing purposes.</p>
        </div>

        <div className="space-y-4 border border-gray-700 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Order Amount</span>
            <span className="text-white">₹{order.total_amount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Payment Method</span>
            <span className="text-white">Simulated Payment</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Status</span>
            <span className="text-green-400">Ready to Process</span>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 rounded-lg text-sm font-medium bg-gray-800 text-white hover:bg-gray-700"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={simulatePayment}
            disabled={loading}
            className="flex-1 glass-button px-6 py-3 rounded-lg text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Pay Now (Simulate)'}
          </motion.button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          This is a test payment page. No real transactions will be processed.
        </p>
      </motion.div>
    </div>
  )
} 