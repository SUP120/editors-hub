'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

type FlaggedArtist = {
  id: string
  full_name: string
  email: string
  violation_count: number
  violations: {
    order_id: string
    reason: string
    created_at: string
  }[]
}

type PaymentRequest = {
  id: string
  artist_id: string
  artist_name: string
  amount: number
  status: string
  requested_at: string
}

type SupabaseError = {
  message: string
  details: string
  hint: string
  code: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [flaggedArtists, setFlaggedArtists] = useState<FlaggedArtist[]>([])
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchFlaggedArtists = async () => {
    try {
      type ViolationResponse = {
        artist_id: string
        order_id: string
        reason: string
        created_at: string
        profiles: {
          full_name: string
          email: string
        } | null
      }

      // Get all violations grouped by artist
      const { data: violations, error: violationsError } = await supabase
        .from('artist_violations')
        .select(`
          artist_id,
          order_id,
          reason,
          created_at,
          profiles!artist_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false }) as { data: ViolationResponse[] | null, error: SupabaseError | null }

      if (violationsError) throw violationsError
      if (!violations) return

      // Group violations by artist
      const artistViolations = violations.reduce((acc: Record<string, FlaggedArtist>, violation) => {
        const artistId = violation.artist_id
        if (!acc[artistId]) {
          acc[artistId] = {
            id: artistId,
            full_name: violation.profiles?.full_name || 'Unknown Artist',
            email: violation.profiles?.email || '',
            violation_count: 0,
            violations: []
          }
        }
        acc[artistId].violation_count++
        acc[artistId].violations.push({
          order_id: violation.order_id,
          reason: violation.reason,
          created_at: violation.created_at
        })
        return acc
      }, {})

      setFlaggedArtists(Object.values(artistViolations))
    } catch (error) {
      console.error('Error fetching flagged artists:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }

  const fetchPaymentRequests = async () => {
    try {
      type RequestResponse = {
        id: string
        artist_id: string
        amount: number
        status: string
        requested_at: string
        profiles: {
          full_name: string
        } | null
      }

      const { data: requests, error: requestsError } = await supabase
        .from('payment_requests')
        .select(`
          id,
          artist_id,
          amount,
          status,
          requested_at,
          profiles!artist_id (
            full_name
          )
        `)
        .order('requested_at', { ascending: false }) as { data: RequestResponse[] | null, error: SupabaseError | null }

      if (requestsError) throw requestsError
      if (!requests) return

      const transformedRequests = requests.map(request => ({
        id: request.id,
        artist_id: request.artist_id,
        artist_name: request.profiles?.full_name || 'Unknown Artist',
        amount: request.amount,
        status: request.status,
        requested_at: request.requested_at
      }))

      setPaymentRequests(transformedRequests)
    } catch (error) {
      console.error('Error fetching payment requests:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }

  const checkAdmin = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Check if user is an admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single() as { data: { is_admin: boolean } | null, error: SupabaseError | null }

      if (profileError) throw profileError

      if (!profile?.is_admin) {
        router.push('/')
        return
      }

      await Promise.all([
        fetchFlaggedArtists(),
        fetchPaymentRequests()
      ])
    } catch (error) {
      console.error('Error checking admin:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    checkAdmin()
  }, [checkAdmin])

  const handlePaymentAction = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({ 
          status: action,
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) throw error

      // Refresh payment requests
      await fetchPaymentRequests()
    } catch (error) {
      console.error('Error handling payment action:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }

  const banArtist = async (artistId: string) => {
    try {
      // Update profile to mark as banned
      const { error: banError } = await supabase
        .from('profiles')
        .update({ 
          is_banned: true,
          banned_at: new Date().toISOString()
        })
        .eq('id', artistId)

      if (banError) throw banError

      // Refresh flagged artists
      await fetchFlaggedArtists()
    } catch (error) {
      console.error('Error banning artist:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
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
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setLoading(true)
              checkAdmin()
            }}
            className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </motion.button>
        </div>

        {/* Flagged Artists Section */}
        <div className="glass-card rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Flagged Artists</h2>
          {flaggedArtists.length === 0 ? (
            <p className="text-gray-400">No flagged artists at the moment.</p>
          ) : (
            <div className="space-y-6">
              {flaggedArtists.map((artist) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{artist.full_name}</h3>
                      <p className="text-gray-400">{artist.email}</p>
                      <p className="text-red-400 mt-1">
                        {artist.violation_count} violation{artist.violation_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => banArtist(artist.id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600"
                    >
                      Ban Artist
                    </motion.button>
                  </div>

                  <div className="space-y-2">
                    {artist.violations.map((violation, index) => (
                      <div key={index} className="text-sm text-gray-400">
                        <p className="text-gray-300">Order: {violation.order_id}</p>
                        <p>{violation.reason}</p>
                        <p className="text-xs">
                          {new Date(violation.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Requests Section */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-6">Payment Requests</h2>
          {paymentRequests.length === 0 ? (
            <p className="text-gray-400">No payment requests at the moment.</p>
          ) : (
            <div className="space-y-4">
              {paymentRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{request.artist_name}</h3>
                      <p className="text-violet-400">₹{request.amount}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(request.requested_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex space-x-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePaymentAction(request.id, 'approved')}
                          className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-white"
                        >
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePaymentAction(request.id, 'rejected')}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600"
                        >
                          Reject
                        </motion.button>
                      </div>
                    )}

                    {request.status !== 'pending' && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        request.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                      } text-white`}>
                        {request.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 