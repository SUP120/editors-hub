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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-violet-900 py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements - reduce on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(window.innerWidth > 768 ? 15 : 8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/5 rounded-full"
            style={{
              width: Math.random() * (window.innerWidth > 768 ? 300 : 150) + 50,
              height: Math.random() * (window.innerWidth > 768 ? 300 : 150) + 50,
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

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 md:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 mb-2 sm:mb-4">
            My Orders
          </h1>
          <p className="text-blue-200 text-sm sm:text-base max-w-2xl mx-auto">
            Track and manage all your orders in one place
          </p>
        </motion.div>

        <div className="flex justify-end mb-4 sm:mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchOrders(supabase.auth.getUser().then(({ data }) => data.user?.id || ''))}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800/50 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors duration-200 text-xs sm:text-sm"
          >
            <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Refresh</span>
          </motion.button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px] sm:min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 bg-red-400/10 rounded-lg p-3 sm:p-4 border border-red-400/20 text-sm sm:text-base">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 sm:py-12"
          >
            <div className="text-gray-400 text-sm sm:text-lg">You don't have any orders yet</div>
            <button
              onClick={() => router.push('/browse-works')}
              className="mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors duration-200 text-xs sm:text-sm"
            >
              Browse Works
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="glass-card backdrop-blur-sm rounded-xl border border-violet-500/20 overflow-hidden transition-all duration-300 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Order Image */}
                  <div className="relative w-full sm:w-48 h-40 sm:h-auto">
                    {order.work.images && order.work.images[0] ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${order.work.images[0]}`}
                        alt={order.work.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <FiPackage className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-0">
                        {order.work.title}
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span
                          className={`text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${
                            order.status === 'completed'
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : order.status === 'in_progress'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : order.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}
                        >
                          {order.status === 'pending'
                            ? 'Pending'
                            : order.status === 'in_progress'
                            ? 'In Progress'
                            : order.status === 'completed'
                            ? 'Completed'
                            : 'Cancelled'}
                        </span>
                        <span
                          className={`text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${
                            order.payment_status === 'paid'
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}
                        >
                          {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                      {order.work.description}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400">
                        <FiUser className="w-3 h-3 sm:w-4 sm:h-4 text-violet-400" />
                        <span>{order.artist.full_name}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400">
                        <FiClock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400">
                        <FiDollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        <span>₹{order.total_amount}</span>
                      </div>
                    </div>

                    <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors duration-200 text-xs sm:text-sm"
                      >
                        <span>View Details</span>
                        <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.button>
                      {order.payment_status === 'unpaid' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => router.push(`/orders/${order.id}?pay=true`)}
                          className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-xs sm:text-sm"
                        >
                          <FiCreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Pay Now</span>
                        </motion.button>
                      )}
                      {order.status === 'completed' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => router.push(`/orders/${order.id}?review=true`)}
                          className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-xs sm:text-sm"
                        >
                          <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Leave Review</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 