'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import { toast } from 'react-hot-toast'

type Violation = {
  artist_id: string
  order_id: string
  reason: string
  created_at: string
  profiles: {
    full_name: string
    email: string
  }
}

type FlaggedArtist = {
  id: string
  full_name: string
  email: string
  violation_count: number
  violations: Array<{
    order_id: string
    reason: string
    created_at: string
  }>
}

type PaymentRequest = {
  id: string
  artist_id: string
  artist_name: string
  amount: number
  status: string
  requested_at: string
  payment_type: 'upi' | 'bank'
  payment_details: {
    upi_id?: string
    bank_name?: string
    account_number?: string
    ifsc_code?: string
    account_holder_name?: string
  }
}

type Artist = {
  id: string
  full_name: string
  email: string
  created_at: string
  is_artist: boolean
  total_earnings?: number
  total_orders?: number
  rating?: number
}

type Client = {
  id: string
  full_name: string
  email: string
  created_at: string
  total_orders?: number
}

type Issue = {
  id: string
  artist_id: string
  order_id: string
  incident_type: string
  description: string
  reported_at: string
  resolved: boolean
  artist: {
    full_name: string
    email: string
  }
}

type DatabasePayoutRequest = {
  id: string;
  artist_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  payment_type: 'upi' | 'bank';
  profiles: {
    full_name: string;
  };
};

type PayoutRequest = {
  id: string;
  artist_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  payment_type: 'upi' | 'bank';
  profiles: Array<{
    full_name: string;
  }>;
  payment_details: Array<{
    upi_id?: string;
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    account_holder_name?: string;
  }>;
};

export default function AdminDashboard() {
  const router = useRouter()
  const [flaggedArtists, setFlaggedArtists] = useState<FlaggedArtist[]>([])
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [artists, setArtists] = useState<Artist[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [activeTab, setActiveTab] = useState('artists')

  // Add new state for admin users
  const [adminUsers, setAdminUsers] = useState<Array<{id: string, email: string, full_name: string}>>([])

  useEffect(() => {
    checkAdmin()
    fetchData()
    fetchAdminUsers()
  }, [])

  const checkAdmin = async () => {
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
        .single()

      if (profileError) throw profileError

      if (!profile?.is_admin) {
        router.push('/')
        return
      }

      await Promise.all([
        fetchFlaggedArtists(),
        fetchPaymentRequests()
      ])
    } catch (error: any) {
      console.error('Error checking admin:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchFlaggedArtists = async () => {
    try {
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
        .order('created_at', { ascending: false })

      if (violationsError) throw violationsError

      // Group violations by artist
      const artistViolations = (violations as any[]).reduce<{ [key: string]: FlaggedArtist }>((acc, violation) => {
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
    } catch (error: any) {
      console.error('Error fetching flagged artists:', error)
      setError(error.message)
    }
  }

  const fetchPaymentRequests = async () => {
    try {
      const { data: requests, error: requestsError } = await supabase
        .from('payment_requests')
        .select(`
          id,
          artist_id,
          amount,
          status,
          requested_at,
          payment_type,
          profiles!inner (
            full_name
          ),
          payment_details!payment_requests_id_fkey (
            upi_id,
            bank_name,
            account_number,
            ifsc_code,
            account_holder_name
          )
        `)
        .order('requested_at', { ascending: false })

      if (requestsError) throw requestsError

      const transformedRequests = requests.map((request: PayoutRequest): PaymentRequest => ({
        id: request.id,
        artist_id: request.artist_id,
        artist_name: request.profiles[0]?.full_name || 'Unknown Artist',
        amount: request.amount,
        status: request.status,
        requested_at: request.requested_at,
        payment_type: request.payment_type,
        payment_details: request.payment_details?.[0] || {}
      }))

      setPaymentRequests(transformedRequests)
      console.log('Payment requests:', transformedRequests) // Debug log
    } catch (error: any) {
      console.error('Error fetching payment requests:', error)
      setError(error.message)
    }
  }

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
    } catch (error: any) {
      console.error('Error handling payment action:', error)
      setError(error.message)
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
    } catch (error: any) {
      console.error('Error banning artist:', error)
      setError(error.message)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch artists with their stats
      const { data: artistsData, error: artistsError } = await supabase
        .from('profiles')
        .select(`
          *,
          artist_wallet(current_balance, total_earned),
          orders(id),
          artist_profiles(rating)
        `)
        .eq('is_artist', true)

      if (artistsError) throw artistsError

      // Fetch clients with their orders
      const { data: clientsData, error: clientsError } = await supabase
        .from('profiles')
        .select('*, orders(id)')
        .eq('is_artist', false)

      if (clientsError) throw clientsError

      // Fetch unresolved issues
      const { data: issuesData, error: issuesError } = await supabase
        .from('artist_incidents')
        .select(`
          *,
          artist:profiles!artist_id(
            full_name,
            email
          )
        `)
        .eq('resolved', false)
        .order('reported_at', { ascending: false })

      if (issuesError) throw issuesError

      // Process artists data
      const processedArtists = artistsData?.map(artist => ({
        ...artist,
        total_earnings: artist.artist_wallet?.[0]?.total_earned || 0,
        total_orders: artist.orders?.length || 0,
        rating: artist.artist_profiles?.[0]?.rating || 0
      })) || []

      // Process clients data
      const processedClients = clientsData?.map(client => ({
        ...client,
        total_orders: client.orders?.length || 0
      })) || []

      // Fetch payout requests
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('payout_requests')
        .select('id, artist_id, amount, status, requested_at, payment_type, profiles')
        .eq('status', 'pending')

      if (payoutsError) throw payoutsError

      // Fetch payment details
      const { data: paymentDetailsData, error: paymentDetailsError } = await supabase
        .from('payment_details')
        .select('id, artist_id, upi_id, bank_name, account_number, ifsc_code, account_holder_name')
        .eq('artist_id', payoutsData.map(payout => payout.artist_id))

      if (paymentDetailsError) throw paymentDetailsError

      // Process payout requests
      const payoutRequests = (payoutsData as DatabasePayoutRequest[]).map(payout => {
        const paymentDetails = paymentDetailsData?.find(pd => pd.artist_id === payout.artist_id);
        return {
          id: payout.id,
          artist_id: payout.artist_id,
          artist_name: payout.profiles?.full_name || 'Unknown Artist',
          amount: payout.amount,
          status: payout.status,
          requested_at: payout.requested_at,
          payment_type: payout.payment_type,
          payment_details: {
            upi_id: paymentDetails?.upi_id,
            bank_name: paymentDetails?.bank_name,
            account_number: paymentDetails?.account_number,
            ifsc_code: paymentDetails?.ifsc_code,
            account_holder_name: paymentDetails?.account_holder_name
          }
        };
      });

      setArtists(processedArtists)
      setClients(processedClients)
      setIssues(issuesData || [])
      setPaymentRequests(payoutRequests)
    } catch (error: any) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const resolveIssue = async (issueId: string) => {
    try {
      const { error } = await supabase
        .from('artist_incidents')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', issueId)

      if (error) throw error

      toast.success('Issue marked as resolved')
      fetchData()
    } catch (error: any) {
      console.error('Error resolving issue:', error)
      toast.error('Failed to resolve issue')
    }
  }

  // Add new function to fetch admin users
  const fetchAdminUsers = async () => {
    try {
      const { data: admins, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('is_admin', true)

      if (error) throw error
      setAdminUsers(admins || [])
    } catch (error: any) {
      console.error('Error fetching admin users:', error)
      toast.error('Failed to fetch admin users')
    }
  }

  // Add function to grant admin access
  const grantAdminAccess = async (email: string) => {
    try {
      // First find the user by email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (userError) throw userError

      if (!user) {
        toast.error('User not found')
        return
      }

      // Update the user's admin status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', user.id)

      if (updateError) throw updateError

      toast.success('Admin access granted successfully')
      fetchAdminUsers() // Refresh the admin users list
    } catch (error: any) {
      console.error('Error granting admin access:', error)
      toast.error('Failed to grant admin access')
    }
  }

  // Add function to revoke admin access
  const revokeAdminAccess = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: false })
        .eq('id', userId)

      if (error) throw error

      toast.success('Admin access revoked successfully')
      fetchAdminUsers() // Refresh the admin users list
    } catch (error: any) {
      console.error('Error revoking admin access:', error)
      toast.error('Failed to revoke admin access')
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading admin dashboard..." />
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

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6">
          {['artists', 'clients', 'issues', 'admins'].map((tabName) => (
            <button
              key={tabName}
              onClick={() => setActiveTab(tabName)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeTab === tabName
                  ? 'bg-white text-purple-900'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
            >
              {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {activeTab === 'artists' && (
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Artists ({artists.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Earnings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {artists.map((artist) => (
                    <tr key={artist.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{artist.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{artist.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">₹{artist.total_earnings}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{artist.total_orders}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{artist.rating?.toFixed(1)} ⭐</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(artist.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Clients ({clients.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{client.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{client.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{client.total_orders}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(client.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Unresolved Issues ({issues.length})</h2>
            <div className="space-y-4">
              {issues.map((issue) => (
                <div key={issue.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-medium">{issue.incident_type}</h3>
                      <p className="text-gray-300 text-sm mt-1">{issue.description}</p>
                      <div className="mt-2 text-sm text-gray-400">
                        <p>Artist: {issue.artist.full_name} ({issue.artist.email})</p>
                        <p>Reported: {new Date(issue.reported_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => resolveIssue(issue.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-500"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
              {issues.length === 0 && (
                <p className="text-gray-400 text-center py-4">No unresolved issues</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Admin Management</h2>
            
            {/* Grant Admin Access Form */}
            <div className="mb-8 bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Grant Admin Access</h3>
              <form onSubmit={async (e) => {
                e.preventDefault()
                const email = (e.target as any).email.value
                await grantAdminAccess(email)
                ;(e.target as any).email.value = ''
              }} className="flex gap-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter user email"
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-600 text-white placeholder-gray-400 border border-gray-500 focus:outline-none focus:border-purple-500"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                >
                  Grant Access
                </button>
              </form>
            </div>

            {/* Admin Users List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {adminUsers.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{admin.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{admin.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => revokeAdminAccess(admin.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Revoke Access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {adminUsers.length === 0 && (
                <p className="text-gray-400 text-center py-4">No admin users found</p>
              )}
            </div>
          </div>
        )}

        {/* Payment Requests Section */}
        <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">Payment Requests</h2>
          <div className="space-y-4">
            {paymentRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group hover:bg-white/10 p-6 rounded-xl transition-all duration-200 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white group-hover:text-purple-400 transition-colors">
                      {request.artist_name}
                    </h3>
                    <p className="text-gray-400">
                      Requested on {new Date(request.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">₹{request.amount}</p>
                    <p className={`text-sm ${
                      request.status === 'pending' ? 'text-yellow-400' :
                      request.status === 'approved' ? 'text-green-400' :
                      'text-red-400'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </p>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-black/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-400">Payment Method:</span>
                    <span className="text-white">{request.payment_type === 'upi' ? 'UPI' : 'Bank Transfer'}</span>
                  </div>
                  
                  {request.payment_type === 'upi' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400">UPI ID:</span>
                      <span className="text-white">{request.payment_details.upi_id}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400">Account Holder:</span>
                        <span className="text-white">{request.payment_details.account_holder_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400">Bank Name:</span>
                        <span className="text-white">{request.payment_details.bank_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400">Account Number:</span>
                        <span className="text-white">{request.payment_details.account_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400">IFSC Code:</span>
                        <span className="text-white">{request.payment_details.ifsc_code}</span>
                      </div>
                    </div>
                  )}
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handlePaymentAction(request.id, 'approved')}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium
                                hover:from-green-600 hover:to-emerald-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handlePaymentAction(request.id, 'rejected')}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white font-medium
                                hover:from-red-600 hover:to-pink-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </motion.div>
            ))}

            {paymentRequests.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No payment requests</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 