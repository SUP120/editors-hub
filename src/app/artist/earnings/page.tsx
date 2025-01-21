'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '@/components/LoadingSpinner'
import StatusMessage from '@/components/StatusMessage'
import { userGuidance } from '@/lib/userGuidance'

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
  account_number: string
  ifsc_code: string
  account_holder_name: string
}

type OrderResponse = {
  id: string
  work_id: string
  total_amount: number
  status: string
  completed_at: string | null
  payment_status: string
  work: {
    title: string | null
  } | null
  client: {
    full_name: string | null
  } | null
}

type Wallet = {
  current_balance: number
  total_earned: number
  last_updated: string
}

type Transaction = {
  id: string
  amount: number
  type: 'credit' | 'debit'
  description: string
  created_at: string
  order_id?: string
}

export default function ArtistEarnings() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [submittingPayment, setSubmittingPayment] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')

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

      setUser(user)
      await Promise.all([
        fetchProfile(user.id),
        fetchWallet(user.id),
        fetchTransactions(user.id),
        fetchPaymentDetails(user.id)
      ])
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async (userId: string) => {
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

      if (artistError) throw artistError
      setArtistProfile(artistData)
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      setError(error.message)
    }
  }

  const fetchWallet = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('artist_wallet')
        .select('*')
        .eq('artist_id', userId)
        .single()

      if (error) throw error
      setWallet(data)
    } catch (error: any) {
      console.error('Error fetching wallet:', error)
      setError(error.message)
    }
  }

  const fetchTransactions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('transaction_history')
        .select('*')
        .eq('artist_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error: any) {
      console.error('Error fetching transactions:', error)
      setError(error.message)
    }
  }

  const fetchPaymentDetails = async (userId: string) => {
    try {
      const { data: details, error: fetchError } = await supabase
        .from('payment_details')
        .select('*')
        .eq('artist_id', userId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw fetchError
      }

      if (details) {
        // Determine payment type from the saved details
        const formattedDetails: PaymentDetails = {
          account_number: details.account_number || '',
          ifsc_code: details.ifsc_code || '',
          account_holder_name: details.account_holder_name || ''
        }
        setPaymentDetails(formattedDetails)
      }
    } catch (error: any) {
      console.error('Error fetching payment details:', error)
    }
  }

  const handleWithdrawSubmit = async () => {
    if (!paymentDetails) {
      setShowPaymentModal(true)
      return
    }

    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amount > (wallet?.current_balance || 0)) {
      setError('Insufficient balance')
      return
    }

    try {
      // Create withdrawal request
      const { error: withdrawError } = await supabase
        .from('payment_requests')
        .insert({
          artist_id: user.id,
          amount: amount,
          status: 'pending',
          requested_at: new Date().toISOString()
        })

      if (withdrawError) throw withdrawError

      // Add transaction record
      const { error: transactionError } = await supabase
        .from('transaction_history')
        .insert({
          artist_id: user.id,
          amount: amount,
          type: 'debit',
          description: 'Withdrawal request',
          created_at: new Date().toISOString()
        })

      if (transactionError) throw transactionError

      // Update wallet
      const { error: walletError } = await supabase
        .from('artist_wallet')
        .update({
          current_balance: (wallet?.current_balance || 0) - amount,
          last_updated: new Date().toISOString()
        })
        .eq('artist_id', user.id)

      if (walletError) throw walletError

      // Refresh data
      await Promise.all([
        fetchWallet(user.id),
        fetchTransactions(user.id)
      ])

      setShowWithdrawModal(false)
      setWithdrawAmount('')
      toast.success('Withdrawal request submitted successfully')
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
    }
  }

  const handlePaymentDetailsSubmit = async () => {
    setSubmittingPayment(true)
    setError('') // Clear any previous errors
    
    try {
      // Validate required fields based on payment type
      if (!paymentDetails) {
        setError('Please fill all payment details')
        setSubmittingPayment(false)
        return
      }

      // Insert new record directly using upsert
      const { error: saveError } = await supabase
        .from('payment_details')
        .upsert({
          artist_id: user.id,
          account_number: paymentDetails.account_number,
          ifsc_code: paymentDetails.ifsc_code,
          account_holder_name: paymentDetails.account_holder_name,
          updated_at: new Date().toISOString()
        })

      if (saveError) {
        console.error('Database error:', saveError)
        throw new Error('Failed to save payment details. Please try again.')
      }

      // Update local state
      setPaymentDetails(paymentDetails)
      setShowPaymentModal(false)
      toast.success('Payment details saved successfully')

    } catch (error: any) {
      console.error('Error saving payment details:', error)
      setError(error.message || 'Failed to save payment details. Please try again.')
    } finally {
      setSubmittingPayment(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen text={userGuidance.loading.initial} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {error && (
          <StatusMessage
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {/* Wallet Overview */}
        <div className="glass-card rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Earnings Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300 mb-2">Current Balance</h3>
              <p className="text-3xl font-bold text-white">₹{wallet?.current_balance?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="glass-card p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300 mb-2">Total Earned</h3>
              <p className="text-3xl font-bold text-white">₹{wallet?.total_earned?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="glass-card p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-300 mb-2">Last Updated</h3>
              <p className="text-lg text-white">
                {wallet?.last_updated ? new Date(wallet.last_updated).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowWithdrawModal(true)}
              disabled={!wallet?.current_balance}
              className="glass-button px-6 py-3 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            >
              Withdraw Earnings
            </motion.button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="glass-card rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Transaction History</h2>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="glass-card p-4 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className={`text-lg font-medium ${
                  transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}

            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No transactions yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Withdraw Earnings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount to Withdraw
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="0"
                  max={wallet?.current_balance}
                  step="0.01"
                  className="input-field"
                  placeholder="Enter amount"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWithdrawSubmit}
                  className="glass-button px-6 py-2 rounded-lg text-white"
                >
                  Withdraw
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Payment Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Account Number</label>
                <input
                  type="text"
                  value={paymentDetails?.account_number || ''}
                  onChange={(e) => setPaymentDetails(prev => prev ? {
                    ...prev,
                    account_number: e.target.value
                  } : {
                    account_number: e.target.value,
                    ifsc_code: '',
                    account_holder_name: ''
                  })}
                  className="w-full bg-gray-800 text-white rounded px-3 py-2"
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={paymentDetails?.ifsc_code || ''}
                  onChange={(e) => setPaymentDetails(prev => prev ? {
                    ...prev,
                    ifsc_code: e.target.value
                  } : {
                    account_number: '',
                    ifsc_code: e.target.value,
                    account_holder_name: ''
                  })}
                  className="w-full bg-gray-800 text-white rounded px-3 py-2"
                  placeholder="Enter IFSC code"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={paymentDetails?.account_holder_name || ''}
                  onChange={(e) => setPaymentDetails(prev => prev ? {
                    ...prev,
                    account_holder_name: e.target.value
                  } : {
                    account_number: '',
                    ifsc_code: '',
                    account_holder_name: e.target.value
                  })}
                  className="w-full bg-gray-800 text-white rounded px-3 py-2"
                  placeholder="Enter account holder name"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePaymentDetailsSubmit}
                disabled={submittingPayment}
                className="glass-button px-6 py-2 rounded-lg text-white disabled:opacity-50"
              >
                {submittingPayment ? 'Saving...' : 'Save Details'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 