'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiCreditCard, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { supabase } from '@/lib/db'
import { toast } from 'react-hot-toast'

export default function PaymentSimulatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [amount, setAmount] = useState('204')
  const [order, setOrder] = useState<any>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const id = searchParams.get('orderId')
    const amtParam = searchParams.get('amount')
    
    if (id) setOrderId(id)
    if (amtParam) setAmount(amtParam)
    
    if (id) {
      fetchOrderDetails(id)
    } else {
      setInitialLoading(false)
      setError('No order ID provided in URL')
    }
  }, [searchParams])

  const fetchOrderDetails = async (id: string) => {
    if (!id) return
    
    try {
      console.log('Fetching order details for simulation:', id)
      
      // First fetch the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*, work:work_id(title, price), client:client_id(full_name, email)')
        .eq('id', id)
        .limit(1)

      if (orderError) {
        console.error('Error fetching order:', orderError)
        setError(`Error fetching order: ${orderError.message}`)
        setInitialLoading(false)
        return
      }
      
      if (!orderData || orderData.length === 0) {
        console.error('Order not found, creating dummy order for simulation')
        // Create a dummy order object for simulation purposes
        setOrder({
          id: id,
          work: {
            title: 'Test Service',
            price: parseFloat(amount) - 4
          },
          total_amount: parseFloat(amount),
          platform_fee: 4
        })
        setInitialLoading(false)
        return
      }

      const order = orderData[0]
      
      console.log('Order details retrieved:', { 
        id: order.id, 
        work: order.work?.title,
        amount: order.total_amount
      })

      setOrder(order)
    } catch (error: any) {
      console.error('Error in payment simulation:', error)
      // Create dummy data for simulation
      setOrder({
        id: id,
        work: {
          title: 'Test Service',
          price: parseFloat(amount) - 4
        },
        total_amount: parseFloat(amount),
        platform_fee: 4
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const simulatePayment = async () => {
    setLoading(true)
    try {
      // Prepare payment data
      const totalAmount = order?.total_amount || parseFloat(amount)
      
      const paymentData = {
        orderId,
        orderAmount: totalAmount.toString(),
        referenceId: `ref_${Date.now()}`,
        txStatus: 'SUCCESS',
        paymentMode: 'simulate',
        txMsg: 'Payment Successful',
        txTime: new Date().toISOString(),
        signature: 'simulated_signature' // In production, this would be verified
      }

      console.log('Simulating payment with data:', {
        orderId,
        amount: totalAmount
      })

      // Send to our callback API
      const response = await fetch('/api/payment/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      })

      const data = await response.json()

      if (!response.ok) {
        // If the error is "Order not found", we'll create a dummy success response for testing
        if (response.status === 404 || data.error?.includes('not found')) {
          console.log('Order not found in database, simulating success response')
          setSuccess(true)
          toast.success('Payment simulated successfully!')
          
          // Redirect to order page after 3 seconds
          setTimeout(() => {
            router.push(`/orders`)
          }, 3000)
          return
        }
        
        throw new Error(data.error || 'Payment verification failed')
      }

      setSuccess(true)
      toast.success('Payment successful!')
      
      // Redirect to order page after 3 seconds
      setTimeout(() => {
        router.push(`/orders/${orderId}`)
      }, 3000)
    } catch (error: any) {
      console.error('Error simulating payment:', error)
      setError(error.message)
      toast.error(error.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
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
        className="backdrop-blur-lg bg-white/10 rounded-xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Payment Simulation</h1>
          <p className="text-gray-300 mt-2">This is a test payment page for the Cashfree integration.</p>
        </div>

        {success ? (
          <div className="text-center mb-6">
            <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white">Payment Successful!</h2>
            <p className="text-gray-300 mt-2">Redirecting to your order...</p>
          </div>
        ) : error ? (
          <div className="text-center mb-6">
            <FiXCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white">Payment Failed</h2>
            <p className="text-red-400 mt-2">{error}</p>
            <button
              onClick={() => setError('')}
              className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="border border-gray-700 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Order ID:</span>
                <span className="text-white font-mono">{orderId}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Service:</span>
                <span className="text-white">{order?.work?.title || 'Test Service'}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white font-semibold">₹{order?.total_amount || amount}</span>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Payment Method</h3>
              <div className="bg-gray-800/50 rounded-lg p-4 flex items-center">
                <div className="bg-violet-600 p-2 rounded-md mr-3">
                  <FiCreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white">Simulated Payment</p>
                  <p className="text-gray-400 text-sm">Test Mode</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={simulatePayment}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 px-4 py-3 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCreditCard className="w-5 h-5" />
                    Pay ₹{order?.total_amount || amount}
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/orders`)}
                className="w-full bg-gray-800 px-4 py-3 rounded-lg text-sm font-medium text-white hover:bg-gray-700 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
            
            <p className="text-xs text-gray-400 text-center mt-6">
              This is a simulation for testing purposes. No actual payments will be processed.
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
} 