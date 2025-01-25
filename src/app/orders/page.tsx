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
      <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl text-center">
            <p className="text-red-400 mb-4">Error: {error}</p>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                       hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all"
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/50 to-[#0f172a]"></div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
            <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                    My Orders
                  </h1>
                  <p className="text-gray-400 mt-2">Track and manage your creative projects</p>
                </div>
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/browse-works')}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                             hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all"
                  >
                    Order New Work
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setLoading(true)
                      checkUser()
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-all
                             border border-white/10 backdrop-blur-sm flex items-center gap-2"
                  >
                    <FiRefreshCw className="w-5 h-5" />
                    Refresh
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence>
          {orders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl text-center">
                <div className="mb-6">
                  <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">You haven't placed any orders yet.</p>
                  <p className="text-gray-400 text-sm mt-2">Start by browsing our talented artists' works.</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/browse-works')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                           hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all"
                >
                  Browse Works
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="relative group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-2xl blur-xl" />
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl
                               hover:bg-white/10 transition-all duration-300">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                      {order.work.images?.[0] ? (
                        <div className="relative w-full md:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                          <Image
                            src={order.work.images[0].startsWith('http') 
                              ? order.work.images[0] 
                              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${order.work.images[0]}`}
                            alt={order.work.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 128px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="w-full md:w-32 h-32 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                          <FiPackage className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                          <div>
                            <h2 className="text-xl font-semibold text-white group-hover:text-violet-400 transition-colors">
                              {order.work.title}
                            </h2>
                            <div className="flex items-center gap-2 text-gray-400 mt-1">
                              <FiUser className="w-4 h-4" />
                              <span>{order.artist.full_name}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className={`px-3 py-1 rounded-xl text-xs font-medium backdrop-blur-sm flex items-center gap-2
                                        ${order.status === 'pending'
                                          ? 'bg-yellow-400/10 text-yellow-300 border border-yellow-400/20'
                                          : order.status === 'accepted'
                                          ? 'bg-green-400/10 text-green-300 border border-green-400/20'
                                          : order.status === 'completed'
                                          ? 'bg-blue-400/10 text-blue-300 border border-blue-400/20'
                                          : 'bg-red-400/10 text-red-300 border border-red-400/20'
                                        }`}
                            >
                              {order.status === 'completed' && <FiCheck className="w-3 h-3" />}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </div>
                            <div className={`px-3 py-1 rounded-xl text-xs font-medium backdrop-blur-sm flex items-center gap-2
                                        ${order.payment_status === 'pending'
                                          ? 'bg-yellow-400/10 text-yellow-300 border border-yellow-400/20'
                                          : order.payment_status === 'completed'
                                          ? 'bg-green-400/10 text-green-300 border border-green-400/20'
                                          : 'bg-red-400/10 text-red-300 border border-red-400/20'
                                        }`}
                            >
                              <FiCreditCard className="w-3 h-3" />
                              {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                              <FiDollarSign className="w-4 h-4" />
                              <span>Total Amount</span>
                            </div>
                            <p className="text-white">₹{order.total_amount}</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                              <FiClock className="w-4 h-4" />
                              <span>Ordered On</span>
                            </div>
                            <p className="text-white">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10 flex items-center justify-between">
                            <span className="text-gray-300">View Details</span>
                            <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-400 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 