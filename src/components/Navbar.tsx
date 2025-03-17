'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { FiMenu, FiX, FiBell, FiUser, FiShoppingBag, FiLogOut, FiHome, FiInfo, FiPhone, FiPackage, FiDollarSign } from 'react-icons/fi'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isArtist, setIsArtist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [hasCompletedProfile, setHasCompletedProfile] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

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
    setProfileMenuOpen(false)
  }, [pathname])

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
    if (profileMenuOpen) setProfileMenuOpen(false)
  }

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen)
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50 shadow-lg shadow-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
                ArtistHire
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isActive('/') 
                  ? 'bg-violet-600/20 text-violet-300 border-b-2 border-violet-500' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <FiHome className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            <Link 
              href="/browse-works"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isActive('/browse-works') 
                  ? 'bg-violet-600/20 text-violet-300 border-b-2 border-violet-500' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <FiPackage className="h-4 w-4" />
              <span>Browse Works</span>
            </Link>
            
            <Link 
              href="/about"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isActive('/about') 
                  ? 'bg-violet-600/20 text-violet-300 border-b-2 border-violet-500' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <FiInfo className="h-4 w-4" />
              <span>About</span>
            </Link>
            
            <Link 
              href="/contact"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isActive('/contact') 
                  ? 'bg-violet-600/20 text-violet-300 border-b-2 border-violet-500' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <FiPhone className="h-4 w-4" />
              <span>Contact</span>
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center">
                    {/* Orders Button */}
                    <Link
                      href="/orders"
                      className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                        isActive('/orders') 
                          ? 'bg-violet-600/20 text-violet-300' 
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <FiShoppingBag className="h-5 w-5" />
                    </Link>
                    
                    {/* Notifications - Only for artists */}
                    {isArtist && (
                      <Link 
                        href="/artist/notifications" 
                        className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 relative ${
                          isActive('/artist/notifications') 
                            ? 'bg-violet-600/20 text-violet-300' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <FiBell className="h-5 w-5" />
                        {pendingOrders > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border border-gray-900">
                            {pendingOrders}
                          </span>
                        )}
                      </Link>
                    )}
                    
                    {/* Profile Menu Button */}
                    <div className="relative ml-2">
                      <button
                        onClick={toggleProfileMenu}
                        className="flex items-center justify-center h-8 w-8 rounded-full bg-violet-600/20 hover:bg-violet-600/40 transition-colors duration-200 border border-violet-500/30"
                        aria-expanded={profileMenuOpen}
                        aria-label="User menu"
                      >
                        <FiUser className="h-4 w-4 text-violet-300" />
                      </button>
                      
                      {/* Profile Dropdown */}
                      <AnimatePresence>
                        {profileMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 py-1 z-50"
                          >
                            {isArtist && (
                              <>
                                {!hasCompletedProfile && (
                                  <Link 
                                    href="/artist/complete-profile"
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700 w-full text-left"
                                  >
                                    <FiUser className="h-4 w-4" />
                                    <span>Complete Profile</span>
                                  </Link>
                                )}
                                <Link 
                                  href="/artist/profile" 
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                                >
                                  <FiUser className="h-4 w-4" />
                                  <span>Artist Profile</span>
                                </Link>
                                <Link 
                                  href="/artist/wallet" 
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                                >
                                  <FiDollarSign className="h-4 w-4" />
                                  <span>Wallet</span>
                                </Link>
                              </>
                            )}
                            <button
                              onClick={handleSignOut}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                            >
                              <FiLogOut className="h-4 w-4" />
                              <span>Sign Out</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth/signin">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-800/50"
                      >
                        Sign In
                      </motion.button>
                    </Link>
                    <Link href="/auth/signup">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-4 py-1.5 rounded-lg text-sm font-medium text-white shadow-md shadow-violet-900/20 transition-all duration-200"
                      >
                        Sign Up
                      </motion.button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
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

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-gray-900/90 backdrop-blur-lg border-b border-gray-800/50 shadow-lg shadow-black/10"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                href="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') 
                    ? 'bg-violet-600/20 text-violet-300 border-l-4 border-violet-500 pl-2' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <FiHome className="h-5 w-5" />
                <span>Home</span>
              </Link>
              
              <Link 
                href="/browse-works"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/browse-works') 
                    ? 'bg-violet-600/20 text-violet-300 border-l-4 border-violet-500 pl-2' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <FiPackage className="h-5 w-5" />
                <span>Browse Works</span>
              </Link>
              
              <Link 
                href="/about"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/about') 
                    ? 'bg-violet-600/20 text-violet-300 border-l-4 border-violet-500 pl-2' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <FiInfo className="h-5 w-5" />
                <span>About</span>
              </Link>
              
              <Link 
                href="/contact"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/contact') 
                    ? 'bg-violet-600/20 text-violet-300 border-l-4 border-violet-500 pl-2' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <FiPhone className="h-5 w-5" />
                <span>Contact</span>
              </Link>
              
              {!loading && user && (
                <>
                  <Link
                    href="/orders"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/orders') 
                        ? 'bg-violet-600/20 text-violet-300 border-l-4 border-violet-500 pl-2' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <FiShoppingBag className="h-5 w-5" />
                    <span>My Orders</span>
                  </Link>

                  {isArtist && (
                    <>
                      {!hasCompletedProfile && (
                        <Link 
                          href="/artist/complete-profile"
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-yellow-400 hover:bg-gray-800/50 border-l-4 border-yellow-500 pl-2"
                        >
                          <FiUser className="h-5 w-5" />
                          <span>Complete Your Profile</span>
                        </Link>
                      )}
                      <Link 
                        href="/artist/profile" 
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                          isActive('/artist/profile') 
                            ? 'bg-violet-600/20 text-violet-300 border-l-4 border-violet-500 pl-2' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <FiUser className="h-5 w-5" />
                        <span>Artist Profile</span>
                      </Link>
                      <Link 
                        href="/artist/wallet" 
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                          isActive('/artist/wallet') 
                            ? 'bg-violet-600/20 text-violet-300 border-l-4 border-violet-500 pl-2' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <FiDollarSign className="h-5 w-5" />
                        <span>Wallet</span>
                      </Link>
                      <Link 
                        href="/artist/notifications" 
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium relative ${
                          isActive('/artist/notifications') 
                            ? 'bg-violet-600/20 text-violet-300 border-l-4 border-violet-500 pl-2' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <FiBell className="h-5 w-5" />
                        <span>Notifications</span>
                        {pendingOrders > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 w-full text-left"
                    >
                      <FiLogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/auth/signin">
                        <button className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 w-full text-left">
                          <FiUser className="h-5 w-5" />
                          <span>Sign In</span>
                        </button>
                      </Link>
                      <Link href="/auth/signup">
                        <button className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white w-full text-left">
                          <FiUser className="h-5 w-5" />
                          <span>Sign Up</span>
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
} 