'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { FiRefreshCw, FiClock, FiDollarSign, FiPackage, FiUser, FiChevronRight, FiCheck, FiCreditCard } from 'react-icons/fi'

type Work = {
  title: string
  images: string[]
  price: number
  description: string
}

type Artist = {
  id: string
  full_name: string
  email: string
}

type Order = {
  id: string
  work_id: string
  client_id: string
  artist_id: string
  status: string
  payment_status: string
  requirements: string
  total_amount: number
  created_at: string
  work: Work
  artist: Artist
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

      await fetchOrders(user.id)
    } catch (error: any) {
      console.error('Error checking user:', error)
      setError(error.message)
    }
  }

  const fetchOrders = async (userId: string) => {
    try {
      // First fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', userId)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Then fetch related data for each order
      const transformedOrders = await Promise.all(
        ordersData.map(async (order) => {
          // Fetch work details
          const { data: workData } = await supabase
            .from('works')
            .select('title, images, price, description')
            .eq('id', order.work_id)
            .single()

          // Fetch artist details
          const { data: artistData } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('id', order.artist_id)
            .single()

          return {
            ...order,
            work: {
              title: workData?.title || 'Untitled Work',
              images: workData?.images || [],
              price: workData?.price || 0,
              description: workData?.description || ''
            },
            artist: {
              id: artistData?.id || '',
              full_name: artistData?.full_name || 'Unknown Artist',
              email: artistData?.email || ''
            }
          }
        })
      )

      setOrders(transformedOrders)
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="glass-card rounded-xl p-6 text-center">
          <p className="text-red-500">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 glass-button px-4 py-2 rounded-lg text-sm font-medium text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">My Orders</h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setLoading(true)
              checkUser()
            }}
            className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </motion.button>
        </div>

        {orders.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-center">
            <p className="text-gray-300">You haven't placed any orders yet.</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/browse-works')}
              className="mt-4 glass-button px-4 py-2 rounded-lg text-sm font-medium text-white"
            >
              Browse Works
            </motion.button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{order.work.title}</h2>
                    <p className="text-gray-400">Artist: {order.artist.full_name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'pending'
                        ? 'bg-yellow-500'
                        : order.status === 'accepted'
                        ? 'bg-green-500'
                        : order.status === 'completed'
                        ? 'bg-blue-500'
                        : 'bg-red-500'
                    } text-white`}>
                      {order.status.toUpperCase()}
                    </span>
                    {order.payment_status === 'completed' && (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-500 text-white">
                        PAID
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-violet-400">₹{order.total_amount}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-white"
                  >
                    View Details
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 