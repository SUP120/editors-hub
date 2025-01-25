'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { FiRefreshCw, FiClock, FiDollarSign, FiPackage, FiUser, FiCheck, FiX, FiEye } from 'react-icons/fi'

type Work = {
  title: string
  images: string[]
  price: number
  description: string
}

type Client = {
  id: string
  full_name: string
  email: string
}

type Notification = {
  id: string
  work_id: string
  client_id: string
  artist_id: string
  status: string
  created_at: string
  payment_status: string
  total_amount: number
  work: Work
  client: Client
}

type GroupedNotifications = {
  [clientId: string]: {
    clientName: string
    notifications: Notification[]
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<GroupedNotifications>({})
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

      // Check if user is an artist
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_artist')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      if (!profile?.is_artist) {
        router.push('/')
        return
      }

      await fetchNotifications(user.id)
    } catch (error: any) {
      console.error('Error checking user:', error)
      setError(error.message)
    }
  }

  const fetchNotifications = async (userId: string) => {
    try {
      // First fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('artist_id', userId)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Then fetch related data for each order
      const transformedData = await Promise.all(
        ordersData.map(async (order) => {
          // Fetch work details
          const { data: workData } = await supabase
            .from('works')
            .select('title, images, price, description')
            .eq('id', order.work_id)
            .single()

          // Fetch client details
          const { data: clientData } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('id', order.client_id)
            .single()

          return {
            ...order,
            work: {
              title: workData?.title || 'Untitled Work',
              images: workData?.images || [],
              price: workData?.price || 0,
              description: workData?.description || ''
            },
            client: {
              id: clientData?.id || '',
              full_name: clientData?.full_name || 'Unknown Client',
              email: clientData?.email || ''
            }
          }
        })
      )

      // Group by client
      const grouped = transformedData.reduce((acc: GroupedNotifications, notification: Notification) => {
        const clientId = notification.client_id
        if (!acc[clientId]) {
          acc[clientId] = {
            clientName: notification.client.full_name,
            notifications: []
          }
        }
        acc[clientId].notifications.push(notification)
        return acc
      }, {})

      setNotifications(grouped)
    } catch (error: any) {
      console.error('Error fetching notifications:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (orderId: string, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: action })
        .eq('id', orderId)

      if (error) throw error

      // Refresh notifications
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await fetchNotifications(user.id)
      }
    } catch (error: any) {
      console.error('Error in handleAction:', error)
      setError(error.message)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                Notifications
              </h1>
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
        </motion.div>

        <AnimatePresence>
          {Object.keys(notifications).length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl text-center">
                <p className="text-gray-300">No notifications at the moment.</p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {Object.entries(notifications).map(([clientId, { clientName, notifications: clientNotifications }], index) => (
                <motion.div
                  key={clientId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-2xl blur-xl" />
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-2xl font-semibold text-white bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400 mb-6">
                      Orders from {clientName}
                    </h2>
                    <div className="space-y-4">
                      {clientNotifications.map((notification, notificationIndex) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: notificationIndex * 0.05 }}
                          className="relative group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-indigo-400/5 rounded-xl blur-lg" />
                          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl
                                      hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-start gap-6">
                              {notification.work.images?.[0] ? (
                                <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                                  <Image
                                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${notification.work.images[0]}`}
                                    alt={notification.work.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-32 h-32 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                  <FiPackage className="w-8 h-8 text-gray-400" />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h3 className="text-xl font-semibold text-white group-hover:text-violet-400 transition-colors">
                                      {notification.work.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-gray-400 mt-1">
                                      <FiUser className="w-4 h-4" />
                                      <span>{notification.client.full_name}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-xl text-xs font-medium backdrop-blur-sm
                                                ${notification.status === 'pending'
                                                  ? 'bg-yellow-400/10 text-yellow-300 border border-yellow-400/20'
                                                  : notification.status === 'accepted'
                                                  ? 'bg-green-400/10 text-green-300 border border-green-400/20'
                                                  : notification.status === 'completed'
                                                  ? 'bg-blue-400/10 text-blue-300 border border-blue-400/20'
                                                  : 'bg-red-400/10 text-red-300 border border-red-400/20'
                                                }`}>
                                      {notification.status.toUpperCase()}
                                    </div>
                                    {notification.payment_status === 'completed' && (
                                      <div className="bg-emerald-400/10 text-emerald-300 px-3 py-1 rounded-xl text-xs font-medium
                                                    border border-emerald-400/20 backdrop-blur-sm flex items-center gap-1">
                                        <FiCheck className="w-3 h-3" />
                                        PAID
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                  <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                      <FiClock className="w-4 h-4" />
                                      <span>Order Date</span>
                                    </div>
                                    <p className="text-white">
                                      {new Date(notification.created_at).toLocaleDateString('en-IN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      })}
                                    </p>
                                  </div>
                                  <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                      <FiDollarSign className="w-4 h-4" />
                                      <span>Amount</span>
                                    </div>
                                    <p className="text-white">₹{notification.total_amount}</p>
                                  </div>
                                  <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                      <FiUser className="w-4 h-4" />
                                      <span>Client</span>
                                    </div>
                                    <p className="text-white">{notification.client.full_name}</p>
                                  </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                  {notification.status === 'pending' && (
                                    <>
                                      <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAction(notification.id, 'accepted')}
                                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium
                                                 hover:from-green-600 hover:to-emerald-600 transform hover:-translate-y-0.5 transition-all
                                                 flex items-center gap-2"
                                      >
                                        <FiCheck className="w-4 h-4" />
                                        Accept
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAction(notification.id, 'rejected')}
                                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl text-white font-medium
                                                 hover:from-red-600 hover:to-rose-600 transform hover:-translate-y-0.5 transition-all
                                                 flex items-center gap-2"
                                      >
                                        <FiX className="w-4 h-4" />
                                        Reject
                                      </motion.button>
                                    </>
                                  )}
                                  {notification.status === 'accepted' && notification.payment_status === 'completed' && (
                                    <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => router.push(`/orders/${notification.id}`)}
                                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                                               hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all
                                               flex items-center gap-2"
                                    >
                                      <FiEye className="w-4 h-4" />
                                      View Order
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
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