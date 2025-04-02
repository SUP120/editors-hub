'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function PaymentCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [orderID, setOrderID] = useState<string | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get orderId from searchParams
        const orderId = searchParams.get('orderId')
        const txStatus = searchParams.get('txStatus')
        
        if (!orderId) {
          throw new Error('Order ID not found in callback parameters')
        }
        
        // Save the order ID for potential navigation
        setOrderID(orderId)
        
        // Get all URL parameters
        const params: Record<string, string> = {}
        searchParams.forEach((value, key) => {
          params[key] = value
        })
        
        // Send to our callback API
        const response = await fetch('/api/payment/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params)
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Payment verification failed')
        }

        // Handle different payment statuses
        if (txStatus === 'SUCCESS' || data.status === 'completed') {
          setStatus('success')
          setMessage('Payment successful! Redirecting to your order...')
          toast.success('Payment successful!')
          
          // Redirect to order details page after 2 seconds
          setTimeout(() => {
            router.push(`/orders/${orderId}/details`)
          }, 2000)
        } else if (txStatus === 'FAILED' || data.status === 'failed') {
          setStatus('error')
          setMessage('Payment failed. Please try again.')
          toast.error('Payment failed!')
          
          // Redirect back to payment page with error
          setTimeout(() => {
            router.push(`/orders/${orderId}/payment?error=failed`)
          }, 2000)
        } else if (txStatus === 'CANCELLED' || data.status === 'cancelled') {
          setStatus('error')
          setMessage('Payment was cancelled.')
          toast.error('Payment cancelled')
          
          // Redirect back to payment page with cancelled status
          setTimeout(() => {
            router.push(`/orders/${orderId}/payment?error=cancelled`)
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Payment status unknown. Please contact support.')
          toast.error('Payment status unknown')
          
          // Redirect back to payment page with unknown error
          setTimeout(() => {
            router.push(`/orders/${orderId}/payment?error=unknown`)
          }, 2000)
        }
      } catch (error: any) {
        console.error('Payment verification error:', error)
        setStatus('error')
        setMessage(error.message || 'Payment verification failed')
        toast.error(error.message || 'Payment verification failed')
        
        // On error, redirect back to payment page
        if (orderID) {
          setTimeout(() => {
            router.push(`/orders/${orderID}/payment?error=verification_failed`)
          }, 2000)
        }
      }
    }

    verifyPayment()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-violet-900 py-12">
      <div className="max-w-lg mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center"
        >
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
              <h2 className="text-xl font-semibold text-white mt-4">Verifying Payment</h2>
              <p className="text-gray-300 mt-2">Please wait while we verify your payment...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h2 className="text-xl font-semibold text-white mt-4">Payment Successful!</h2>
              <p className="text-gray-300 mt-2">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <FiXCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-semibold text-white mt-4">Payment Failed</h2>
              <p className="text-gray-300 mt-2">{message}</p>
              <div className="flex gap-2 mt-4 justify-center">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Go Back
                </button>
                {orderID && (
                  <button
                    onClick={() => router.push(`/orders/${orderID}/payment`)}
                    className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
} 