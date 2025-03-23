'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '@/components/LoadingSpinner'
import StatusMessage from '@/components/StatusMessage'
import PaymentDetailsForm from '@/components/PaymentDetailsForm'
import { FiArrowUpRight, FiArrowDownRight, FiClock, FiDollarSign, FiCreditCard, FiUser, FiBriefcase } from 'react-icons/fi'

type Transaction = {
  id: string
  artist_id: string
  amount: number
  type: 'credit' | 'debit'
  description: string
  order_id?: string
  created_at: string
}

type PaymentDetails = {
  payment_type: 'upi' | 'bank'
  upi_id?: string
  bank_name?: string
  account_number?: string
  ifsc_code?: string
  account_holder_name?: string
}

type Wallet = {
  current_balance: number
  total_earned: number
  last_updated: string
}

export default function ArtistWallet() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    payment_type: 'upi',
    upi_id: undefined,
    bank_name: undefined,
    account_number: undefined,
    ifsc_code: undefined,
    account_holder_name: undefined
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentType, setPaymentType] = useState<'upi' | 'bank'>('upi')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    checkUser()
    // Subscribe to transaction updates
    const channel = supabase
      .channel('wallet_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transaction_history',
        },
        (payload) => {
          // Refresh transactions and wallet when there's a change
          if (user) {
            fetchTransactions(user.id)
            fetchWallet(user.id)
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

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

      setUser(user)
      await Promise.all([
        fetchWallet(user.id),
        fetchTransactions(user.id),
        fetchPaymentDetails(user.id)
      ])
    } catch (error: any) {
      console.error('Error in checkUser:', error)
      toast.error(error.message || 'Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const fetchWallet = async (userId: string) => {
    try {
      const { data: walletData, error: walletError } = await supabase
        .from('artist_wallet')
        .select('current_balance, total_earned, last_updated')
        .eq('artist_id', userId)
        .single()

      if (walletError) {
        if (walletError.code === 'PGRST116') {
          // Wallet doesn't exist yet, will be created when first payment is received
          setWallet({
            current_balance: 0,
            total_earned: 0,
            last_updated: new Date().toISOString()
          })
        } else {
          throw walletError
        }
      } else {
        setWallet(walletData)
      }
    } catch (error: any) {
      console.error('Error fetching wallet:', error)
      toast.error('Failed to load wallet data')
    }
  }

  const fetchTransactions = async (userId: string) => {
    try {
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transaction_history')
        .select('*')
        .eq('artist_id', userId)
        .order('created_at', { ascending: false })

      if (transactionsError) throw transactionsError
      setTransactions(transactionsData || [])
    } catch (error: any) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load transaction history')
    }
  }

  const fetchPaymentDetails = async (userId: string) => {
    try {
      const { data: details, error: fetchError } = await supabase
        .from('payment_details')
        .select('*')
        .eq('artist_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (details) {
        setPaymentDetails({
          payment_type: details.payment_type,
          upi_id: details.upi_id,
          bank_name: details.bank_name,
          account_number: details.account_number,
          ifsc_code: details.ifsc_code,
          account_holder_name: details.account_holder_name
        })
      }
    } catch (error: any) {
      console.error('Error fetching payment details:', error)
    }
  }

  const handleWithdrawalRequest = async () => {
    try {
      setIsSubmitting(true)
      
      if (!amount || isNaN(Number(amount))) {
        toast.error('Please enter a valid amount')
        return
      }

      if (!wallet) {
        toast.error('Unable to fetch wallet details')
        return
      }

      const withdrawalAmount = Number(amount)
      
      if (withdrawalAmount > wallet.current_balance) {
        toast.error('Withdrawal amount cannot exceed your available balance')
        return
      }

      if (withdrawalAmount < 100) {
        toast.error('Minimum withdrawal amount is ₹100')
        return
      }

      // Validate payment details
      if (paymentType === 'upi' && !paymentDetails.upi_id) {
        toast.error('Please enter UPI ID')
        return
      }

      if (paymentType === 'bank' && (!paymentDetails.account_number || !paymentDetails.ifsc_code || !paymentDetails.account_holder_name)) {
        toast.error('Please fill all bank details')
        return
      }

      // Create withdrawal request with payment details
      const { error: withdrawalError } = await supabase
        .rpc('request_withdrawal', {
          p_artist_id: user?.id,
          p_amount: withdrawalAmount,
          p_payment_type: paymentType,
          p_upi_id: paymentType === 'upi' ? paymentDetails.upi_id : null,
          p_bank_name: paymentType === 'bank' ? paymentDetails.bank_name : null,
          p_account_number: paymentType === 'bank' ? paymentDetails.account_number : null,
          p_ifsc_code: paymentType === 'bank' ? paymentDetails.ifsc_code : null,
          p_account_holder_name: paymentType === 'bank' ? paymentDetails.account_holder_name : null
        })

      if (withdrawalError) throw withdrawalError

      toast.success('Withdrawal request submitted successfully! Amount will be transferred within 24 hours.')
      setShowPaymentForm(false)
      setShowWithdrawModal(false)
      fetchWallet(user?.id)
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit withdrawal request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentDetailsSubmit = async (formData: PaymentDetails) => {
    setIsSubmitting(true)
    setError('')
    
    try {
      if (!user) throw new Error('Not authenticated')

      const { error: saveError } = await supabase
        .from('payment_details')
        .upsert({
          artist_id: user.id,
          payment_type: formData.payment_type,
          upi_id: formData.upi_id || null,
          bank_name: formData.bank_name || null,
          account_number: formData.account_number || null,
          ifsc_code: formData.ifsc_code || null,
          account_holder_name: formData.account_holder_name || null,
          updated_at: new Date().toISOString()
        })

      if (saveError) throw saveError

      setPaymentDetails(formData)
      setShowPaymentModal(false)
      toast.success('Payment details saved successfully')
      await fetchPaymentDetails(user.id)
    } catch (error: any) {
      console.error('Error saving payment details:', error)
      setError(error.message || 'Failed to save payment details')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your wallet..." />
  }

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {error && (
          <StatusMessage
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {/* Earnings Overview */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-200">Total Earned</h3>
                <FiDollarSign className="text-purple-400 text-xl" />
              </div>
              <p className="text-4xl font-bold text-white mb-2">₹{wallet?.total_earned || 0}</p>
              <div className="flex items-center text-emerald-400 text-sm">
                <FiArrowUpRight className="mr-1" />
                <span>Platform fee: ₹4 per order</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-200">Available Balance</h3>
                <FiDollarSign className="text-indigo-400 text-xl" />
              </div>
              <p className="text-4xl font-bold text-white mb-2">₹{wallet?.current_balance || 0}</p>
              <div className="flex items-center text-gray-400 text-sm">
                <FiArrowDownRight className="mr-1" />
                <span>Min: ₹200 | Max: ₹10,000</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-200">Quick Actions</h3>
                <FiClock className="text-pink-400 text-xl" />
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Last updated: {wallet?.last_updated 
                  ? new Date(wallet.last_updated).toLocaleDateString()
                  : 'No transactions yet'}
              </p>
              <button
                onClick={() => {
                  if (!paymentDetails) {
                    setShowPaymentModal(true)
                  } else {
                    setShowWithdrawModal(true)
                  }
                }}
                disabled={!wallet || wallet.current_balance < 200}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium
                          hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                Request Payout
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
              Transaction History
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({transactions.length} transactions)
              </span>
            </h2>
            
            <AnimatePresence>
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group hover:bg-white/10 p-4 rounded-xl transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${
                          transaction.type === 'credit' 
                            ? 'bg-emerald-400/10 text-emerald-400' 
                            : 'bg-red-400/10 text-red-400'
                        }`}>
                          {transaction.type === 'credit' 
                            ? <FiArrowUpRight className="text-xl" />
                            : <FiArrowDownRight className="text-xl" />
                          }
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-white group-hover:text-purple-400 transition-colors">
                            {transaction.description}
                          </h3>
                          <p className="text-gray-400">
                            {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                            {new Date(transaction.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${
                          transaction.type === 'credit' 
                            ? 'text-emerald-400' 
                            : 'text-red-400'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          ₹{transaction.amount}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {transactions.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <p className="text-gray-400">No transactions yet</p>
                  </motion.div>
                )}
              </div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Payment Details Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1f36] rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Payment Details</h3>
              <PaymentDetailsForm
                onSubmit={handlePaymentDetailsSubmit}
                onCancel={() => setShowPaymentModal(false)}
                isSubmitting={isSubmitting}
                initialData={paymentDetails}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1f36] rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Request Payout</h3>
              {showPaymentForm ? (
                <div className="relative max-w-2xl mx-auto mt-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-semibold text-white mb-6">Request Withdrawal</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Amount (₹)</label>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                        <div className="flex gap-4">
                          <button
                            onClick={() => setPaymentType('upi')}
                            className={`flex-1 px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2
                                      ${paymentType === 'upi' 
                                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' 
                                        : 'bg-white/5 text-gray-400 border border-white/10'}`}
                          >
                            <FiCreditCard className="w-4 h-4" />
                            UPI
                          </button>
                          <button
                            onClick={() => setPaymentType('bank')}
                            className={`flex-1 px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2
                                      ${paymentType === 'bank'
                                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                                        : 'bg-white/5 text-gray-400 border border-white/10'}`}
                          >
                            <FiBriefcase className="w-4 h-4" />
                            Bank Transfer
                          </button>
                        </div>
                      </div>

                      {paymentType === 'upi' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">UPI ID</label>
                          <input
                            type="text"
                            value={paymentDetails.upi_id || ''}
                            onChange={(e) => {
                              const newDetails = { ...paymentDetails }
                              if (e.target.value) {
                                newDetails.upi_id = e.target.value
                              } else {
                                delete newDetails.upi_id
                              }
                              setPaymentDetails(newDetails)
                            }}
                            placeholder="Enter UPI ID"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-500"
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Account Holder Name</label>
                            <input
                              type="text"
                              value={paymentDetails.account_holder_name || ''}
                              onChange={(e) => {
                                const newDetails = { ...paymentDetails }
                                if (e.target.value) {
                                  newDetails.account_holder_name = e.target.value
                                } else {
                                  delete newDetails.account_holder_name
                                }
                                setPaymentDetails(newDetails)
                              }}
                              placeholder="Enter account holder name"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Bank Name</label>
                            <input
                              type="text"
                              value={paymentDetails.bank_name || ''}
                              onChange={(e) => {
                                const newDetails = { ...paymentDetails }
                                if (e.target.value) {
                                  newDetails.bank_name = e.target.value
                                } else {
                                  delete newDetails.bank_name
                                }
                                setPaymentDetails(newDetails)
                              }}
                              placeholder="Enter bank name"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Account Number</label>
                            <input
                              type="text"
                              value={paymentDetails.account_number || ''}
                              onChange={(e) => {
                                const newDetails = { ...paymentDetails }
                                if (e.target.value) {
                                  newDetails.account_number = e.target.value
                                } else {
                                  delete newDetails.account_number
                                }
                                setPaymentDetails(newDetails)
                              }}
                              placeholder="Enter account number"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">IFSC Code</label>
                            <input
                              type="text"
                              value={paymentDetails.ifsc_code || ''}
                              onChange={(e) => {
                                const newDetails = { ...paymentDetails }
                                if (e.target.value) {
                                  newDetails.ifsc_code = e.target.value
                                } else {
                                  delete newDetails.ifsc_code
                                }
                                setPaymentDetails(newDetails)
                              }}
                              placeholder="Enter IFSC code"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-500"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4 mt-6">
                        <button
                          onClick={() => setShowPaymentForm(false)}
                          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 font-medium
                                    hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleWithdrawalRequest}
                          disabled={isSubmitting}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                                    hover:from-purple-600 hover:to-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                    flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Request Withdrawal'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                              hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all
                              flex items-center gap-2"
                  >
                    <FiDollarSign className="w-5 h-5" />
                    Request Payout
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 