'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import FileUpload from '@/components/FileUpload'
import { userGuidance } from '@/lib/userGuidance'
import LoadingSpinner from '@/components/LoadingSpinner'
import StatusMessage from '@/components/StatusMessage'
import { toast } from 'react-hot-toast'
import { FiCheck, FiCreditCard, FiDollarSign, FiUser, FiPackage } from 'react-icons/fi'

type Message = {
  id: string
  order_id: string
  sender_id: string
  content: string
  created_at: string
  sender: {
    full_name: string
  }
}

type OrderDetails = {
  id: string
  work_id: string
  client_id: string
  artist_id: string
  status: string
  payment_status: string
  requirements: string
  project_files_link?: string
  completed_work_link?: string
  created_at: string
  total_amount: number
  platform_fee: number
  review?: {
    rating: number
    comment: string
    created_at: string
  }
  work: {
    title: string
    description: string
    images: string[]
    price: number
  }
  artist: {
    full_name: string
    email: string
  }
  client: {
    full_name: string
    email: string
  }
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [projectLink, setProjectLink] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const orderId = params.id
  const [rating, setRating] = useState<number>(0)
  const [review, setReview] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (orderId) {
      checkUser()
    }
  }, [orderId])

  const checkUser = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      if (!user) {
        router.push('/auth/signin')
        return
      }

      setUser(user)
      await fetchOrderDetails()
      await fetchMessages()
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
    }
  }

  const fetchOrderDetails = async () => {
    try {
      // First fetch the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError) throw orderError

      // Then fetch the work details
      const { data: workData, error: workError } = await supabase
        .from('works')
        .select('title, description, images, price')
        .eq('id', orderData.work_id)
        .single()

      if (workError) throw workError

      // Then fetch artist and client profiles
      const { data: artistData, error: artistError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', orderData.artist_id)
        .single()

      if (artistError) throw artistError

      const { data: clientData, error: clientError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', orderData.client_id)
        .single()

      if (clientError) throw clientError

      // Combine all the data
      const completeOrder: OrderDetails = {
        ...orderData,
        work: workData,
        artist: artistData,
        client: clientData
      }

      setOrder(completeOrder)
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      // First fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      // Then fetch sender details for each message
      const messagesWithSenders = await Promise.all(
        messagesData.map(async (message) => {
          const { data: senderData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', message.sender_id)
            .single()

          return {
            ...message,
            sender: senderData
          }
        })
      )

      setMessages(messagesWithSenders)
      scrollToBottom()
    } catch (error: any) {
      console.error('Error:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !order) return

    try {
      // First create the message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          order_id: orderId,
          sender_id: user.id,
          content: newMessage.trim(),
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (messageError) {
        console.error('Error sending message:', messageError)
        throw messageError
      }

      // Then fetch the sender's name
      const { data: senderData, error: senderError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (senderError) {
        console.error('Error fetching sender:', senderError)
        throw senderError
      }

      // Combine message and sender data
      const completeMessage = {
        ...messageData,
        sender: senderData
      }

      // Update messages state immediately for better UX
      setMessages(prev => [...prev, completeMessage])
      setNewMessage('')
      scrollToBottom()
    } catch (error: any) {
      console.error('Error sending message:', error)
      setError(error.message)
      setTimeout(() => setError(''), 3000) // Clear error after 3 seconds
    }
  }

  const submitProjectLink = async () => {
    if (!projectLink.trim() || !order) return

    try {
      console.log('Submitting project link:', {
        orderId,
        isClient: user.id === order.client_id,
        projectLink
      })

      const updateData = user.id === order.client_id
        ? { project_files_link: projectLink }
        : { completed_work_link: projectLink }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (error) {
        console.error('Error updating order:', error)
        throw error
      }

      console.log('Successfully updated order with link')
      setProjectLink('')
      await fetchOrderDetails()
    } catch (error: any) {
      console.error('Error submitting link:', error)
      setError(error.message)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Add this function to handle Enter key in chat
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e as any)
    }
  }

  // Add project completion verification
  const verifyProjectCompletion = async () => {
    try {
      // Show confirmation dialog for artist
      if (!confirm('Are you sure this project is completed?')) return

      const { error } = await supabase
        .from('orders')
        .update({
          status: 'pending_client_verification',
          completion_verified_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error

      // Send a system message about the verification request
      await supabase
        .from('messages')
        .insert({
          order_id: orderId,
          sender_id: user.id,
          content: '🔔 Artist has marked this project as completed. Waiting for client verification.',
          created_at: new Date().toISOString(),
          is_system_message: true
        })

      await fetchOrderDetails()
      await fetchMessages()
    } catch (error: any) {
      console.error('Error verifying completion:', error)
      toast.error(error.message || 'Failed to verify completion')
      setError(error.message || 'Failed to verify completion')
    }
  }

  const clientVerifyCompletion = async (isCompleted: boolean) => {
    try {
      if (!order || !user) {
        setError('Order or user not found')
        return
      }

      // Show loading state
      setLoading(true)

      const timestamp = new Date().toISOString()

      if (isCompleted) {
        // Update order status
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'completed',
            payment_status: 'completed',
            completion_verified_by_client: true,
            completed_at: timestamp
          })
          .eq('id', orderId)
          .eq('client_id', user.id)
          .eq('status', 'pending_client_verification')

        if (updateError) {
          console.error('Order update error:', updateError)
          throw new Error('Failed to update order status: ' + updateError.message)
        }

        // Calculate the amount
        const amount = order.total_amount - (order.platform_fee || 4)

        // First get current wallet balance
        const { data: wallet } = await supabase
          .from('artist_wallet')
          .select('current_balance, total_earned')
          .eq('artist_id', order.artist_id)
          .single()

        if (wallet) {
          // Update existing wallet
          const { error: updateWalletError } = await supabase
            .from('artist_wallet')
            .update({
              current_balance: Number(wallet.current_balance) + amount,
              total_earned: Number(wallet.total_earned) + amount,
              last_updated: timestamp
            })
            .eq('artist_id', order.artist_id)

          if (updateWalletError) {
            console.error('Wallet update error:', updateWalletError)
            toast.error('Order completed but there was an issue updating the artist wallet')
          }
        } else {
          // Create new wallet
          const { error: insertWalletError } = await supabase
            .from('artist_wallet')
            .insert({
              artist_id: order.artist_id,
              current_balance: amount,
              total_earned: amount,
              last_updated: timestamp
            })

          if (insertWalletError) {
            console.error('Wallet creation error:', insertWalletError)
            toast.error('Order completed but there was an issue creating the artist wallet')
          }
        }

        // Record transaction
        const { error: transactionError } = await supabase
          .from('transaction_history')
          .insert({
            artist_id: order.artist_id,
            amount: amount,
            type: 'credit',
            description: 'Order completion payment',
            order_id: orderId,
            created_at: timestamp
          })

        if (transactionError) {
          console.error('Transaction record error:', transactionError)
          toast.error('Order completed but there was an issue recording the transaction')
        }

        // Send congratulatory message
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            order_id: orderId,
            sender_id: user.id,
            content: '🎉 Project completed successfully! Congratulations to both parties!',
            created_at: timestamp,
            is_system_message: true
          })

        if (messageError) {
          console.error('Message error:', messageError)
          toast.error('Failed to send completion message, but order was completed successfully')
        } else {
          toast.success('Project completed successfully!')
        }
      } else {
        // Handle revision request
        const issues = prompt('Please describe the issues with the work:')
        if (!issues) {
          setLoading(false)
          return
        }

        // Update order status for revision
        const { error: revisionError } = await supabase
          .from('orders')
          .update({
            status: 'revision_needed',
            client_feedback: issues,
            has_completion_issues: true
          })
          .eq('id', orderId)
          .eq('client_id', user.id)
          .eq('status', 'pending_client_verification')

        if (revisionError) {
          console.error('Revision update error:', revisionError)
          throw new Error('Failed to request revision')
        }

        // Record the incident
        const { error: incidentError } = await supabase
          .from('artist_incidents')
          .insert([{
            artist_id: order.artist_id,
            order_id: orderId,
            incident_type: 'false_completion',
            description: issues,
            reported_at: timestamp
          }])

        if (incidentError) {
          console.error('Incident record error:', incidentError)
          // Don't throw since the revision is already recorded
          toast.error('Failed to record incident, but revision was requested successfully')
        }

        // Send system message about issues
        const { error: messageError } = await supabase
          .from('messages')
          .insert([{
            order_id: orderId,
            sender_id: user.id,
            content: `⚠️ Client reported issues with the work: ${issues}`,
            created_at: timestamp,
            is_system_message: true
          }])

        if (messageError) {
          console.error('Message error:', messageError)
          // Don't throw since the revision is already recorded
          toast.error('Failed to send message, but revision was requested successfully')
        } else {
          toast.success('Revision requested successfully')
        }
      }

      // Refresh data
      await Promise.all([
        fetchOrderDetails(),
        fetchMessages()
      ])
    } catch (error: any) {
      console.error('Error in client verification:', error)
      toast.error(error.message || 'Failed to verify completion')
      setError(error.message || 'Failed to verify completion')
    } finally {
      setLoading(false)
    }
  }

  const submitReview = async () => {
    if (!rating || !order) {
      setError('Please provide a rating')
      return
    }

    setSubmittingReview(true)
    try {
      // Insert the review
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          order_id: params.id,
          artist_id: order.artist_id,
          client_id: user.id, // Use the current user's ID instead of order.client_id
          rating,
          comment: review,
          created_at: new Date().toISOString()
        })

      if (reviewError) throw reviewError

      // Update artist's average rating
      const { data: artistReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('artist_id', order.artist_id)

      if (reviewsError) throw reviewsError

      const avgRating = artistReviews.reduce((acc, curr) => acc + curr.rating, 0) / artistReviews.length

      const { error: updateError } = await supabase
        .from('artist_profiles')
        .update({ 
          rating: avgRating,
          total_reviews: artistReviews.length
        })
        .eq('id', order.artist_id)

      if (updateError) throw updateError

      setSuccessMessage('Review submitted successfully!')
      await fetchOrderDetails()
    } catch (error: any) {
      console.error('Error submitting review:', error)
      setError(error.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  // Add useEffect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (loading) {
    return <LoadingSpinner fullScreen text={userGuidance.loading.orders} />
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!order) {
    return <div>Order not found</div>
  }

  const isClient = user?.id === order.client_id
  const isArtist = user?.id === order.artist_id

  const getStatusMessage = () => {
    if (!order) return ''
    const role = order.client_id === user?.id ? 'client' : 'artist'
    const status = order.status as keyof typeof userGuidance.orderStatus
    return userGuidance.orderStatus[status]?.[role] || ''
  }

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
            <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl text-center">
              <p className="text-red-400 mb-4">Error: {error}</p>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                         hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all"
              >
                Try Again
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : order ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Order Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
            <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                    Order Details
                  </h1>
                  <p className="text-gray-400 mt-2">Order ID: {order.id}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm flex items-center gap-2
                               ${order.status === 'pending'
                                 ? 'bg-yellow-400/10 text-yellow-300 border border-yellow-400/20'
                                 : order.status === 'accepted'
                                 ? 'bg-green-400/10 text-green-300 border border-green-400/20'
                                 : order.status === 'completed'
                                 ? 'bg-blue-400/10 text-blue-300 border border-blue-400/20'
                                 : 'bg-red-400/10 text-red-300 border border-red-400/20'
                               }`}
                  >
                    {order.status === 'completed' && <FiCheck className="w-4 h-4" />}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm flex items-center gap-2
                               ${order.payment_status === 'pending'
                                 ? 'bg-yellow-400/10 text-yellow-300 border border-yellow-400/20'
                                 : order.payment_status === 'completed'
                                 ? 'bg-green-400/10 text-green-300 border border-green-400/20'
                                 : 'bg-red-400/10 text-red-300 border border-red-400/20'
                               }`}
                  >
                    <FiCreditCard className="w-4 h-4" />
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Work Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-white mb-4">Work Details</h2>
                  <div className="flex flex-col md:flex-row gap-6">
                    {order.work.images?.[0] ? (
                      <div className="relative w-full md:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={order.work.images[0].startsWith('http') 
                            ? order.work.images[0] 
                            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${order.work.images[0]}`}
                          alt={order.work.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 192px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full md:w-48 h-48 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                        <FiPackage className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white mb-2">{order.work.title}</h3>
                      <p className="text-gray-400 mb-4">{order.work.description}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                            <FiDollarSign className="w-4 h-4" />
                            <span>Price</span>
                          </div>
                          <p className="text-white">₹{order.work.price}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                            <FiUser className="w-4 h-4" />
                            <span>Artist</span>
                          </div>
                          <p className="text-white">{order.artist.full_name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Requirements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-white mb-4">Project Requirements</h2>
                  <p className="text-gray-300 whitespace-pre-wrap">{order.requirements || 'No specific requirements provided.'}</p>
                </div>
              </motion.div>

              {/* Messages */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-white mb-4">Messages</h2>
                  <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex flex-col ${message.sender_id === user?.id ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[80%] p-3 rounded-xl backdrop-blur-sm
                                    ${message.sender_id === user?.id
                                      ? 'bg-violet-500/10 border border-violet-500/20 text-violet-300'
                                      : 'bg-white/5 border border-white/10 text-gray-300'
                                    }`}
                        >
                          <p className="text-xs text-gray-400 mb-1">{message.sender.full_name}</p>
                          <p className="break-words">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-violet-500 backdrop-blur-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                               hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              {/* Order Summary */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-gray-300">
                      <span>Subtotal</span>
                      <span>₹{order.total_amount}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                      <span>Platform Fee</span>
                      <span>₹{order.platform_fee}</span>
                    </div>
                    <div className="border-t border-white/10 pt-4 flex justify-between items-center text-white font-medium">
                      <span>Total</span>
                      <span>₹{order.total_amount + order.platform_fee}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Files */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-white mb-4">Project Files</h2>
                  {user?.id === order.client_id ? (
                    <>
                      <input
                        type="text"
                        value={projectLink}
                        onChange={(e) => setProjectLink(e.target.value)}
                        placeholder="Enter project files link..."
                        className="w-full px-4 py-2 mb-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400
                                 focus:outline-none focus:ring-2 focus:ring-violet-500 backdrop-blur-sm"
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={submitProjectLink}
                        disabled={!projectLink.trim()}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                                 hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Project Files
                      </motion.button>
                    </>
                  ) : (
                    <div className="text-gray-300">
                      {order.project_files_link ? (
                        <a
                          href={order.project_files_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          View Project Files
                        </a>
                      ) : (
                        'Waiting for client to provide project files...'
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Review Section */}
              {order.status === 'completed' && user?.id === order.client_id && !order.review && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-semibold text-white mb-4">Leave a Review</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Review</label>
                        <textarea
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          placeholder="Write your review..."
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400
                                   focus:outline-none focus:ring-2 focus:ring-violet-500 backdrop-blur-sm resize-none h-32"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={submitReview}
                        disabled={submittingReview || !rating || !review.trim()}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                                 hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      ) : null}
    </div>
  )
} 