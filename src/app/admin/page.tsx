'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

type AdminCredentials = {
  id: string
  password: string
}

const ADMIN_CREDENTIALS: AdminCredentials = {
  id: '6204322166',
  password: '#!Supriyam'
}

type User = {
  id: string
  email: string
  full_name: string
  display_name: string
  is_artist: boolean
  created_at: string
}

type Artist = User & {
  total_earned: number
  pending_amount: number
  last_payout_date: string | null
}

type PayoutRequest = {
  id: string
  artist_id: string
  artist_name: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
  payment_details: any
}

export default function AdminPanel() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminId, setAdminId] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'artists' | 'clients' | 'payouts'>('artists')
  const [artists, setArtists] = useState<Artist[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
      fetchData()
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminId === ADMIN_CREDENTIALS.id && adminPassword === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true)
      localStorage.setItem('adminAuth', 'true')
      fetchData()
    } else {
      setError('Invalid credentials')
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      // First fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')

      if (profilesError) throw profilesError

      // Separate artists and clients
      const artistProfiles = profilesData.filter(p => p.is_artist)
      const clientProfiles = profilesData.filter(p => !p.is_artist)

      // Fetch earnings for artists
      const { data: earningsData, error: earningsError } = await supabase
        .from('artist_earnings')
        .select('*')
        .in('artist_id', artistProfiles.map(a => a.id))

      if (earningsError && earningsError.code !== 'PGRST116') {
        throw earningsError
      }

      // Map earnings to artists
      const artistsWithEarnings = artistProfiles.map(artist => {
        const earnings = earningsData?.find(e => e.artist_id === artist.id)
        return {
          ...artist,
          total_earned: earnings?.total_earned || 0,
          pending_amount: earnings?.pending_amount || 0,
          last_payout_date: earnings?.last_payout_date || null
        }
      })

      // Fetch pending payout requests
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })

      if (payoutsError) throw payoutsError

      // Fetch payment details for all artists with pending payouts
      const { data: paymentDetailsData, error: paymentDetailsError } = await supabase
        .from('payment_details')
        .select('*')
        .in('artist_id', payoutsData.map(p => p.artist_id))

      if (paymentDetailsError) throw paymentDetailsError

      // Map artist names and payment details to payout requests
      const payoutRequests = payoutsData.map(payout => {
        const artist = artistProfiles.find(a => a.id === payout.artist_id)
        const paymentDetails = paymentDetailsData?.find(pd => pd.artist_id === payout.artist_id)
        return {
          ...payout,
          artist_name: artist?.full_name || 'Unknown Artist',
          payment_details: paymentDetails || null
        }
      })

      setArtists(artistsWithEarnings)
      setClients(clientProfiles)
      setPayoutRequests(payoutRequests)
    } catch (error: any) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, isArtist: boolean) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      // Delete user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) throw profileError

      if (isArtist) {
        // Delete artist specific data
        await Promise.all([
          supabase.from('artist_profiles').delete().eq('id', userId),
          supabase.from('artist_earnings').delete().eq('artist_id', userId),
          supabase.from('payment_requests').delete().eq('artist_id', userId),
          supabase.from('payment_details').delete().eq('artist_id', userId)
        ])
      }

      toast.success('User deleted successfully')
      fetchData()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const handlePayoutAction = async (payoutId: string, action: 'approve' | 'reject') => {
    try {
      const { error: updateError } = await supabase
        .from('payment_requests')
        .update({ 
          status: action === 'approve' ? 'approved' : 'rejected',
          processed_at: new Date().toISOString()
        })
        .eq('id', payoutId)

      if (updateError) throw updateError

      if (action === 'approve') {
        // Update artist earnings
        const payout = payoutRequests.find(p => p.id === payoutId)
        if (payout) {
          const { error: earningsError } = await supabase
            .from('artist_earnings')
            .update({
              pending_amount: 0, // We'll update this in a separate query
              last_payout_date: new Date().toISOString()
            })
            .eq('artist_id', payout.artist_id)

          if (earningsError) throw earningsError

          // Update pending amount using a separate query
          const { error: updateAmountError } = await supabase
            .rpc('update_pending_amount', {
              artist_id: payout.artist_id,
              amount: payout.amount
            })

          if (updateAmountError) throw updateAmountError
        }
      }

      toast.success(`Payout ${action}d successfully`)
      fetchData()
    } catch (error: any) {
      console.error('Error processing payout:', error)
      toast.error('Failed to process payout')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-8"
          >
            <h2 className="text-3xl font-bold text-white text-center mb-8">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Admin ID"
                  required
                  className="input-field"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  required
                  className="input-field"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full glass-button py-3 text-white font-medium rounded-lg"
              >
                Login
              </button>
              {error && (
                <div className="text-red-500 text-center">{error}</div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchData}
              className="glass-button px-4 py-2 text-white rounded-lg"
            >
              Refresh Data
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('adminAuth')
                setIsAuthenticated(false)
              }}
              className="glass-button px-4 py-2 text-white rounded-lg bg-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 mb-8">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('artists')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'artists'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Artists ({artists.length})
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'clients'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Clients ({clients.length})
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'payouts'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Payout Requests ({payoutRequests.length})
            </button>
          </div>

          {activeTab === 'artists' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="py-4 px-4 text-gray-300">Name</th>
                    <th className="py-4 px-4 text-gray-300">Email</th>
                    <th className="py-4 px-4 text-gray-300">Total Earned</th>
                    <th className="py-4 px-4 text-gray-300">Pending Amount</th>
                    <th className="py-4 px-4 text-gray-300">Last Payout</th>
                    <th className="py-4 px-4 text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {artists.map((artist) => (
                    <tr key={artist.id} className="text-gray-300">
                      <td className="py-4 px-4">{artist.full_name}</td>
                      <td className="py-4 px-4">{artist.email}</td>
                      <td className="py-4 px-4">₹{artist.total_earned}</td>
                      <td className="py-4 px-4">₹{artist.pending_amount}</td>
                      <td className="py-4 px-4">
                        {artist.last_payout_date
                          ? new Date(artist.last_payout_date).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleDeleteUser(artist.id, true)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="py-4 px-4 text-gray-300">Name</th>
                    <th className="py-4 px-4 text-gray-300">Email</th>
                    <th className="py-4 px-4 text-gray-300">Joined</th>
                    <th className="py-4 px-4 text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {clients.map((client) => (
                    <tr key={client.id} className="text-gray-300">
                      <td className="py-4 px-4">{client.full_name}</td>
                      <td className="py-4 px-4">{client.email}</td>
                      <td className="py-4 px-4">
                        {new Date(client.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleDeleteUser(client.id, false)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="py-4 px-4 text-gray-300">Artist</th>
                    <th className="py-4 px-4 text-gray-300">Amount</th>
                    <th className="py-4 px-4 text-gray-300">Requested</th>
                    <th className="py-4 px-4 text-gray-300">Payment Method</th>
                    <th className="py-4 px-4 text-gray-300">Details</th>
                    <th className="py-4 px-4 text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {payoutRequests.map((request) => (
                    <tr key={request.id} className="text-gray-300">
                      <td className="py-4 px-4">{request.artist_name}</td>
                      <td className="py-4 px-4">₹{request.amount}</td>
                      <td className="py-4 px-4">
                        {new Date(request.requested_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        {request.payment_details.payment_type === 'upi' ? 'UPI' : 'Bank Transfer'}
                      </td>
                      <td className="py-4 px-4">
                        {request.payment_details.payment_type === 'upi' ? (
                          <span>{request.payment_details.upi_id}</span>
                        ) : (
                          <span>
                            {request.payment_details.bank_name} - 
                            {request.payment_details.account_number}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 space-x-4">
                        <button
                          onClick={() => handlePayoutAction(request.id, 'approve')}
                          className="text-green-400 hover:text-green-300"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handlePayoutAction(request.id, 'reject')}
                          className="text-red-400 hover:text-red-300"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 