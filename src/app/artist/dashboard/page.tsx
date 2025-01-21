'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Image from 'next/image'

type Profile = {
  full_name: string
  display_name: string
  avatar_url: string
  bio: string
  email: string
  location: string
  is_artist: boolean
}

type ArtistProfile = {
  specialty: string[]
  hourly_rate: number
  years_of_experience: number
  rating: number
  total_reviews: number
  portfolio_urls: string[]
  languages: string[]
  availability_status: string
}

type Work = {
  id: string
  title: string
  description: string
  price: number
  delivery_time: number
  category: string
  subcategory: string
  images: string[]
  tags: string[]
  status: string
  created_at: string
}

type Earnings = {
  total_earned: number
  pending_amount: number
  last_payout_date: string | null
}

type CompletedWork = {
  id: string
  title: string
  price: number
  completed_at: string
  client_name: string
  transferred: boolean
}

type PaymentDetails = {
  upi_id: string
  bank_name: string
  account_number: string
  ifsc_code: string
  account_holder_name: string
}

export default function ArtistDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null)
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [earnings, setEarnings] = useState<Earnings>({
    total_earned: 0,
    pending_amount: 0,
    last_payout_date: null
  })
  const [completedWorks, setCompletedWorks] = useState<CompletedWork[]>([])
  const [requestingPayout, setRequestingPayout] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    upi_id: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: ''
  })
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank'>('upi')
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0)
  const router = useRouter()

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
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_artist')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      if (!profileData?.is_artist) {
        router.push('/')
        return
      }

      await Promise.all([
        fetchData(user.id),
        fetchEarnings(user.id),
        fetchCompletedWorks(user.id)
      ])
    } catch (error: any) {
      console.error('Error checking user:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async (userId: string) => {
    try {
      // Fetch basic profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Fetch artist profile
      const { data: artistData, error: artistError } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (artistError && artistError.code !== 'PGRST116') throw artistError
      setArtistProfile(artistData)

      // Fetch works
      const { data: worksData, error: worksError } = await supabase
        .from('works')
        .select('*')
        .eq('artist_id', userId)
        .order('created_at', { ascending: false })

      if (worksError) throw worksError
      setWorks(worksData || [])
    } catch (error: any) {
      console.error('Error fetching data:', error)
      setError(error.message)
    }
  }

  const fetchEarnings = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get earnings data
      const { data: earningsData, error: earningsError } = await supabase
        .from('artist_earnings')
        .select('*')
        .eq('artist_id', user.id)
        .single()

      if (earningsError && earningsError.code !== 'PGRST116') throw earningsError

      if (!earningsData) {
        // Calculate earnings from completed orders
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('artist_id', user.id)
          .eq('status', 'completed')

        if (ordersError) throw ordersError

        const totalEarned = orders?.reduce((sum, order) => sum + (order.total_amount - 4), 0) || 0

        // Create initial earnings record using RPC
        const { data: newEarnings, error: insertError } = await supabase
          .rpc('initialize_artist_earnings', {
            p_artist_id: user.id,
            p_total_earned: totalEarned
          })

        if (insertError) throw insertError

        setEarnings({
          total_earned: totalEarned,
          pending_amount: totalEarned,
          last_payout_date: null
        })
      } else {
        setEarnings({
          total_earned: earningsData.total_earned,
          pending_amount: earningsData.pending_amount,
          last_payout_date: earningsData.last_payout_date
        })
      }
    } catch (error: any) {
      console.error('Error fetching earnings:', error)
      setError(error.message)
    }
  }

  const fetchCompletedWorks = async (userId: string) => {
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, work_id, client_id, total_amount, created_at, transferred')
        .eq('artist_id', userId)
        .eq('status', 'completed')

      if (ordersError) throw ordersError

      const completedWorks = await Promise.all(
        orders.map(async (order) => {
          const { data: work } = await supabase
            .from('works')
            .select('title')
            .eq('id', order.work_id)
            .single()

          const { data: client } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', order.client_id)
            .single()

          return {
            id: order.id,
            title: work?.title || 'Untitled Work',
            price: order.total_amount - 4,
            completed_at: order.created_at,
            client_name: client?.full_name || 'Unknown Client',
            transferred: order.transferred || false
          }
        })
      )

      setCompletedWorks(completedWorks)
    } catch (error: any) {
      console.error('Error fetching completed works:', error)
      setError(error.message)
    }
  }

  const requestPayout = async () => {
    try {
      setRequestingPayout(true)
      setError('') // Clear any previous errors
      setSuccessMessage('') // Clear any previous success messages

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('Auth error:', authError)
        throw new Error('Authentication failed')
      }
      if (!user) throw new Error('Not authenticated')

      // Verify pending amount
      const { data: currentEarnings, error: earningsError } = await supabase
        .from('artist_earnings')
        .select('pending_amount')
        .eq('artist_id', user.id)
        .single()
      
      if (earningsError) {
        console.error('Earnings fetch error:', earningsError)
        throw new Error('Failed to verify pending amount')
      }
      
      if (!currentEarnings || currentEarnings.pending_amount <= 0) {
        throw new Error('No pending amount available for payout')
      }

      console.log('Creating payment request for amount:', currentEarnings.pending_amount)

      // Create payment request
      const { data: paymentRequest, error: requestError } = await supabase
        .from('payment_requests')
        .insert({
          artist_id: user.id,
          amount: currentEarnings.pending_amount,
          status: 'pending',
          requested_at: new Date().toISOString()
        })
        .select()
        .single()

      if (requestError) {
        console.error('Payment request creation error:', requestError)
        throw new Error('Failed to create payment request')
      }

      console.log('Payment request created:', paymentRequest)

      // Update pending amount to 0
      const { error: updateError } = await supabase
        .from('artist_earnings')
        .update({ 
          pending_amount: 0,
          updated_at: new Date().toISOString()
        })
        .eq('artist_id', user.id)

      if (updateError) {
        console.error('Earnings update error:', updateError)
        throw new Error('Failed to update pending amount')
      }

      // Refresh earnings data
      await fetchEarnings(user.id)
      
      // Update success message instead of error
      setSuccessMessage('Payout request submitted successfully!')
    } catch (error: any) {
      console.error('Error requesting payout:', error)
      setError(error.message || 'Failed to request payout. Please try again.')
      setSuccessMessage('') // Clear any success message on error
    } finally {
      setRequestingPayout(false)
    }
  }

  const handlePaymentDetailsSubmit = async () => {
    try {
      setRequestingPayout(true)
      setError('')
      setSuccessMessage('')

      // Validate withdrawal amount
      if (withdrawalAmount < 200) {
        throw new Error('Minimum withdrawal amount is ₹200')
      }
      if (withdrawalAmount > 50000) {
        throw new Error('Maximum withdrawal amount is ₹50,000')
      }
      if (withdrawalAmount > earnings.pending_amount) {
        throw new Error('Withdrawal amount cannot exceed your pending earnings')
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) throw new Error('Not authenticated')

      // Save payment details
      const { error: detailsError } = await supabase
        .from('payment_details')
        .upsert({
          artist_id: user.id,
          ...paymentDetails,
          updated_at: new Date().toISOString()
        })

      if (detailsError) throw detailsError

      // Create payment request with specific amount
      const { data: paymentRequest, error: requestError } = await supabase
        .from('payment_requests')
        .insert({
          artist_id: user.id,
          amount: withdrawalAmount,
          status: 'pending',
          requested_at: new Date().toISOString()
        })
        .select()
        .single()

      if (requestError) throw requestError

      // Update pending amount
      const { error: updateError } = await supabase
        .from('artist_earnings')
        .update({ 
          pending_amount: earnings.pending_amount - withdrawalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('artist_id', user.id)

      if (updateError) throw updateError

      // Refresh earnings data
      await fetchEarnings(user.id)
      setShowPaymentModal(false)
      setSuccessMessage('Congo! Your Earnings are on way to reach you wait 1-2 days')
    } catch (error: any) {
      console.error('Error saving payment details:', error)
      setError(error.message || 'Failed to save payment details')
    } finally {
      setRequestingPayout(false)
    }
  }

  const handleTransfer = async (workId: string, amount: number) => {
    try {
      setError('')
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) throw new Error('Not authenticated')

      // Update the order to mark it as transferred
      const { error: orderError } = await supabase
        .from('orders')
        .update({ transferred: true })
        .eq('id', workId)

      if (orderError) throw orderError

      // Update artist earnings
      const { data: currentEarnings, error: earningsError } = await supabase
        .from('artist_earnings')
        .select('*')
        .eq('artist_id', user.id)
        .single()

      if (earningsError && earningsError.code !== 'PGRST116') throw earningsError

      if (!currentEarnings) {
        // Create new earnings record
        const { error: insertError } = await supabase
          .from('artist_earnings')
          .insert({
            artist_id: user.id,
            total_earned: amount,
            pending_amount: amount
          })

        if (insertError) throw insertError
      } else {
        // Update existing earnings
        const { error: updateError } = await supabase
          .from('artist_earnings')
          .update({
            total_earned: currentEarnings.total_earned + amount,
            pending_amount: currentEarnings.pending_amount + amount
          })
          .eq('artist_id', user.id)

        if (updateError) throw updateError
      }

      // Update local state
      setEarnings(prev => ({
        ...prev,
        total_earned: prev.total_earned + amount,
        pending_amount: prev.pending_amount + amount
      }))

      // Update completed works to disable the transferred button
      setCompletedWorks(prev =>
        prev.map(work =>
          work.id === workId ? { ...work, transferred: true } : work
        )
      )

      setSuccessMessage('Amount transferred successfully!')
    } catch (error: any) {
      console.error('Error transferring amount:', error)
      setError(error.message || 'Failed to transfer amount')
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
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
        {successMessage && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg">
            <p className="text-green-400">{successMessage}</p>
          </div>
        )}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Artist Dashboard</h1>
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

        {/* Earnings Section */}
        <div className="glass-card rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">Earnings Overview</h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  fetchEarnings(user.id);
                }
              }}
              className="glass-button px-3 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh Earnings
            </motion.button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 mb-2">Total Earned</p>
              <p className="text-2xl font-bold text-white">₹{earnings.total_earned}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 mb-2">Pending Amount</p>
              <p className="text-2xl font-bold text-white">₹{earnings.pending_amount}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 mb-2">Last Payout</p>
              <p className="text-2xl font-bold text-white">
                {earnings.last_payout_date 
                  ? new Date(earnings.last_payout_date).toLocaleDateString('en-IN')
                  : 'No payouts yet'}
              </p>
            </div>
          </div>
          {earnings.pending_amount > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPaymentModal(true)}
              disabled={requestingPayout}
              className="mt-6 glass-button px-6 py-3 rounded-lg text-sm font-medium text-white w-full md:w-auto"
            >
              {requestingPayout ? 'Processing...' : 'Request Payout'}
            </motion.button>
          )}
        </div>

        {/* Completed Works Section */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-6">Completed Works</h2>
          {completedWorks.length === 0 ? (
            <p className="text-gray-400">No completed works yet.</p>
          ) : (
            <div className="space-y-4">
              {completedWorks.map((work) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{work.title}</h3>
                      <p className="text-gray-400">Client: {work.client_name}</p>
                      <p className="text-violet-400">₹{work.price}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-sm text-gray-400">
                        {new Date(work.completed_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {!work.transferred && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTransfer(work.id, work.price)}
                          className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-white"
                        >
                          Transfer to Earnings
                        </motion.button>
                      )}
                      {work.transferred && (
                        <span className="text-green-400 text-sm">Transferred ✓</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Withdrawal Request</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Withdrawal Amount (₹200 - ₹50,000)
                </label>
                <input
                  type="number"
                  min={200}
                  max={50000}
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                  className="w-full p-2 rounded bg-gray-800 text-white"
                  placeholder="Enter amount"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Available: ₹{earnings.pending_amount}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setPaymentMethod('upi')}
                className={`flex-1 p-2 rounded ${paymentMethod === 'upi' ? 'bg-violet-500' : 'bg-gray-700'}`}
              >
                UPI
              </button>
              <button
                onClick={() => setPaymentMethod('bank')}
                className={`flex-1 p-2 rounded ${paymentMethod === 'bank' ? 'bg-violet-500' : 'bg-gray-700'}`}
              >
                Bank Transfer
              </button>
            </div>

            {paymentMethod === 'upi' ? (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="UPI ID"
                  value={paymentDetails.upi_id}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, upi_id: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Account Holder Name"
                  value={paymentDetails.account_holder_name}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, account_holder_name: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white"
                />
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={paymentDetails.bank_name}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, bank_name: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white"
                />
                <input
                  type="text"
                  placeholder="Account Number"
                  value={paymentDetails.account_number}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, account_number: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white"
                />
                <input
                  type="text"
                  placeholder="IFSC Code"
                  value={paymentDetails.ifsc_code}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, ifsc_code: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 text-white"
                />
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 p-2 rounded bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentDetailsSubmit}
                disabled={withdrawalAmount < 200 || withdrawalAmount > 50000 || withdrawalAmount > earnings.pending_amount}
                className="flex-1 p-2 rounded bg-violet-500 hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 