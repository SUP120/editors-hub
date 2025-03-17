'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { FiMenu, FiX } from 'react-icons/fi'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isArtist, setIsArtist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [hasCompletedProfile, setHasCompletedProfile] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkUser()
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        const user = session?.user
        if (user) {
          setUser(user)
          checkArtistStatus(user.id)
          checkProfileCompletion(user.id)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsArtist(false)
        setHasCompletedProfile(true)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [router])

  const checkProfileCompletion = async (userId: string) => {
    try {
      const { data: artistProfile } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      setHasCompletedProfile(!!artistProfile)
    } catch (error) {
      console.error('Error checking profile completion:', error)
      setHasCompletedProfile(false)
    }
  }

  const checkUser = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      if (user) {
        setUser(user)
        // Get user profile with is_artist field
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_artist')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError
        
        const isUserArtist = profile?.is_artist || false
        setIsArtist(isUserArtist)

        if (isUserArtist) {
          // Check if artist has completed their profile by checking artist_profiles table
          const { data: artistProfile, error: artistProfileError } = await supabase
            .from('artist_profiles')
            .select('id, specialty, skills, hourly_rate')
            .eq('id', user.id)
            .single()

          // If no artist profile exists or it's incomplete, set hasCompletedProfile to false
          setHasCompletedProfile(
            !!artistProfile && 
            !!artistProfile.specialty?.length && 
            !!artistProfile.skills?.length && 
            !!artistProfile.hourly_rate
          )

          // Fetch pending orders
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <nav className="bg-gray-900/50 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white">
              Artist Hiring Platform
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/about"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-800"
            >
              About
            </Link>
            <Link 
              href="/services"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-800"
            >
              Services
            </Link>
            <Link 
              href="/contact"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-800"
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link 
                      href="/browse-works"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-800"
                    >
                      Browse Works
                    </Link>

                    <Link
                      href="/orders"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      My Orders
                    </Link>

                    {isArtist && (
                      <>
                        {!hasCompletedProfile && (
                          <Link 
                            href="/artist/complete-profile"
                            className="text-yellow-400 hover:text-yellow-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-800 animate-pulse"
                          >
                            Complete Your Artist Profile
                          </Link>
                        )}
                        <Link 
                          href="/artist/profile" 
                          className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium"
                        >
                          Artist Profile
                        </Link>
                        <Link 
                          href="/artist/wallet" 
                          className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium"
                        >
                          Wallet
                        </Link>
                        <Link 
                          href="/artist/notifications" 
                          className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium relative"
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

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white p-2 rounded-md"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden bg-gray-900/90 backdrop-blur-lg border-b border-gray-800"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href="/about"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              About
            </Link>
            <Link 
              href="/services"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Services
            </Link>
            <Link 
              href="/contact"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Contact
            </Link>
            
            {!loading && user && (
              <>
                <Link 
                  href="/browse-works"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                >
                  Browse Works
                </Link>
                <Link
                  href="/orders"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                >
                  My Orders
                </Link>

                {isArtist && (
                  <>
                    {!hasCompletedProfile && (
                      <Link 
                        href="/artist/complete-profile"
                        className="text-yellow-400 hover:text-yellow-300 block px-3 py-2 rounded-md text-base font-medium animate-pulse"
                      >
                        Complete Your Artist Profile
                      </Link>
                    )}
                    <Link 
                      href="/artist/profile" 
                      className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    >
                      Artist Profile
                    </Link>
                    <Link 
                      href="/artist/wallet" 
                      className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    >
                      Wallet
                    </Link>
                    <Link 
                      href="/artist/notifications" 
                      className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium relative"
                    >
                      Notifications
                      {pendingOrders > 0 && (
                        <span className="absolute top-2 ml-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {pendingOrders}
                        </span>
                      )}
                    </Link>
                  </>
                )}
              </>
            )}

            {!loading && (
              <div className="pt-4 pb-3 border-t border-gray-700">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <button className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">
                        Sign In
                      </button>
                    </Link>
                    <Link href="/auth/signup">
                      <button className="glass-button block px-3 py-2 rounded-md text-base font-medium text-white mt-2 w-full text-left">
                        Sign Up
                      </button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  )
} 