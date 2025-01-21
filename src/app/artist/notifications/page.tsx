'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

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
      if (authError) {
        console.error('Auth error:', authError)
        throw authError
      }

      if (!user) {
        console.log('No user found, redirecting to signin')
        router.push('/auth/signin')
        return
      }

      // Check if user is an artist
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_artist')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        throw profileError
      }

      if (!profile?.is_artist) {
        console.log('User is not an artist, redirecting to home')
        router.push('/')
        return
      }

      console.log('Fetching notifications for artist:', user.id)
      await fetchNotifications(user.id)
    } catch (error: any) {
      console.error('Error in checkUser:', error)
      setError(error.message)
    }
  }

  const fetchNotifications = async (userId: string) => {
    try {
      console.log('Starting fetchNotifications for user:', userId)
      
      // First fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('artist_id', userId)
        .order('created_at', { ascending: false })

      if (ordersError) {
        console.error('Orders query error:', ordersError)
        throw ordersError
      }

      console.log('Fetched orders:', ordersData)

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

      console.log('Transformed notifications:', transformedData)

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
      console.error('Error in fetchNotifications:', error)
      setError(error.message || 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (orderId: string, action: 'accepted' | 'rejected') => {
    try {
      console.log(`Handling ${action} action for order:`, orderId)
      const { error } = await supabase
        .from('orders')
        .update({ status: action })
        .eq('id', orderId)

      if (error) {
        console.error('Update error:', error)
        throw error
      }

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
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
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

        <div className="space-y-8">
          {Object.keys(notifications).length === 0 ? (
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-gray-300">No notifications at the moment.</p>
            </div>
          ) : (
            Object.entries(notifications).map(([clientId, { clientName, notifications: clientNotifications }]) => (
              <div key={clientId} className="glass-card rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Orders from {clientName}</h2>
                <div className="space-y-4">
                  {clientNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{notification.work.title}</h3>
                          <p className="text-gray-400">₹{notification.total_amount}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            notification.status === 'pending'
                              ? 'bg-yellow-500'
                              : notification.status === 'accepted'
                              ? 'bg-green-500'
                              : notification.status === 'completed'
                              ? 'bg-blue-500'
                              : 'bg-red-500'
                          } text-white`}>
                            {notification.status.toUpperCase()}
                          </span>
                          {notification.payment_status === 'completed' && (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-500 text-white">
                              PAID
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-400">
                          {new Date(notification.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>

                        <div className="flex space-x-4">
                          {notification.status === 'pending' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAction(notification.id, 'accepted')}
                                className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-white"
                              >
                                Accept
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAction(notification.id, 'rejected')}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600"
                              >
                                Reject
                              </motion.button>
                            </>
                          )}
                          {notification.status === 'accepted' && notification.payment_status === 'completed' && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => router.push(`/orders/${notification.id}`)}
                              className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-white"
                            >
                              View Order
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 