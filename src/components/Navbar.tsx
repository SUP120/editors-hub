'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isArtist, setIsArtist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pendingOrders, setPendingOrders] = useState(0)

  useEffect(() => {
    checkUser()
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        const user = session?.user
        if (user) {
          setUser(user)
          checkArtistStatus(user.id)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsArtist(false)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      if (user) {
        setUser(user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_artist')
          .eq('id', user.id)
          .single()

        setIsArtist(profile?.is_artist || false)

        // If user is an artist, fetch pending orders count
        if (profile?.is_artist) {
          const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('artist_id', user.id)
            .eq('status', 'pending')

          setPendingOrders(count || 0)

          // Subscribe to changes in orders
          const channel = supabase
            .channel('orders')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'orders',
                filter: `artist_id=eq.${user.id}`,
              },
              () => {
                // Refresh pending orders count
                fetchPendingOrdersCount(user.id)
              }
            )
            .subscribe()

          return () => {
            channel.unsubscribe()
          }
        }
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingOrdersCount = async (userId: string) => {
    try {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', userId)
        .eq('status', 'pending')

      setPendingOrders(count || 0)
    } catch (error) {
      console.error('Error fetching pending orders:', error)
    }
  }

  const checkArtistStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_artist')
        .eq('id', userId)
        .single()

      if (error) throw error
      setIsArtist(data?.is_artist || false)
    } catch (error) {
      console.error('Error checking artist status:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="bg-gray-900/50 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white">
              Editor's Hub
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              href="/browse-works"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-800"
            >
              Browse Works
            </Link>

            {user && (
              <Link
                href="/orders"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                My Orders
              </Link>
            )}

            {!loading && (
              <>
                {user ? (
                  <>
                    {isArtist && (
                      <>
                        <Link href="/artist/profile" className="text-gray-300 hover:text-white">
                          Artist Profile
                        </Link>
                        <Link href="/artist/earnings" className="text-gray-300 hover:text-white">
                          Earnings
                        </Link>
                        <Link 
                          href="/artist/notifications" 
                          className="text-gray-300 hover:text-white relative"
                        >
                          Notifications
                          {pendingOrders > 0 && (
                            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              {pendingOrders}
                            </span>
                          )}
                        </Link>
                      </>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSignOut}
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-800"
                    >
                      Sign Out
                    </motion.button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-800"
                      >
                        Sign In
                      </motion.button>
                    </Link>
                    <Link href="/auth/signup">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-white"
                      >
                        Sign Up
                      </motion.button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 