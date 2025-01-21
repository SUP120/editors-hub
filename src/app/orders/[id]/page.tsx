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
      setError(error.message)
    }
  }

  const clientVerifyCompletion = async (isCompleted: boolean) => {
    try {
      if (!order) {
        setError('Order not found')
        return
      }

      if (!isCompleted) {
        // Open feedback modal for issues
        const issues = prompt('Please describe the issues with the work:')
        if (!issues) return

        await supabase
          .from('orders')
          .update({
            status: 'revision_needed',
            client_feedback: issues,
            has_completion_issues: true
          })
          .eq('id', orderId)

        // Record the incident
        await supabase
          .from('artist_incidents')
          .insert({
            artist_id: order.artist_id,
            order_id: orderId,
            incident_type: 'false_completion',
            description: issues,
            reported_at: new Date().toISOString()
          })

        // Send system message about the issues
        await supabase
          .from('messages')
          .insert({
            order_id: orderId,
            sender_id: user.id,
            content: `⚠️ Client reported issues with the work: ${issues}`,
            created_at: new Date().toISOString(),
            is_system_message: true
          })
      } else {
        // Complete the order successfully
        await supabase
          .from('orders')
          .update({
            status: 'completed',
            completion_verified_by_client: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', orderId)

        // Send congratulatory message
        await supabase
          .from('messages')
          .insert({
            order_id: orderId,
            sender_id: user.id,
            content: '🎉 Project completed successfully! Congratulations to both parties!',
            created_at: new Date().toISOString(),
            is_system_message: true
          })
      }

      await fetchOrderDetails()
      await fetchMessages()
    } catch (error: any) {
      console.error('Error in client verification:', error)
      setError(error.message)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-4xl mx-auto">
        {error && (
          <StatusMessage
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {/* Order Status Message */}
        {getStatusMessage() && (
          <StatusMessage
            type={order.status === 'completed' ? 'success' : 'info'}
            message={getStatusMessage()}
            className="mb-6"
          />
        )}

        {/* Payment Status Message */}
        {order.payment_status !== 'completed' && (
          <StatusMessage
            type="warning"
            message={userGuidance.payment[order.payment_status as keyof typeof userGuidance.payment] || userGuidance.payment.pending}
            className="mb-6"
          />
        )}

        {/* Main Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{order?.work?.title || 'Loading...'}</h1>
              <p className="text-gray-400 text-sm">Order #{orderId}</p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  await Promise.all([
                    fetchOrderDetails(),
                    fetchMessages()
                  ])
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Refresh
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/chat/${orderId}`)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-white hover:bg-gray-700"
              >
                View Chat
              </motion.button>
            </div>
          </div>
          
          {/* Order Status */}
          <div className="mb-6">
            <span className={`px-3 py-1 rounded-full text-sm ${
              order.status === 'pending' ? 'bg-yellow-500' :
              order.status === 'accepted' ? 'bg-green-500' :
              order.status === 'completed' ? 'bg-blue-500' :
              'bg-red-500'
            } text-white`}>
              {order.status.toUpperCase()}
            </span>
            {order.payment_status === 'completed' && (
              <span className="ml-2 px-3 py-1 rounded-full text-sm bg-green-500 text-white">
                PAID
              </span>
            )}
          </div>

          {/* Order Summary */}
          <div className="glass-card rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Price</span>
                <span className="text-white">₹{order.work.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Platform Fee</span>
                <span className="text-white">₹4</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2">
                <span className="text-gray-300">Total Amount</span>
                <span className="text-violet-400">₹{order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Payment Button - Only show if order is accepted and not paid */}
          {isClient && order.status === 'accepted' && order.payment_status !== 'completed' && (
            <div className="mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/orders/${order.id}/payment`)}
                className="w-full glass-button px-4 py-3 rounded-lg text-sm font-medium text-white"
              >
                Complete Payment
              </motion.button>
            </div>
          )}

          {/* Project Files Section - Only show after payment */}
          {order.status === 'accepted' && order.payment_status === 'completed' && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Project Files</h2>
              
              {/* Client's Project Files */}
              {isClient && (
                <div className="mb-4">
                  <h3 className="text-lg text-gray-300 mb-2">Submit Your Project Files</h3>
                  {order.project_files_link ? (
                    <div>
                      <p className="text-gray-300">Your submitted files: <a href={order.project_files_link} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Download Link</a></p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={projectLink}
                        onChange={(e) => setProjectLink(e.target.value)}
                        placeholder="Paste your project files link (Google Drive, Dropbox, etc.)"
                        className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2"
                      />
                      <button
                        onClick={submitProjectLink}
                        className="glass-button px-4 py-2 rounded-lg text-white"
                      >
                        Submit Link
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Artist's Completed Work */}
              {isArtist && order.project_files_link && (
                <div className="mb-4">
                  <h3 className="text-lg text-gray-300 mb-2">Submit Completed Work</h3>
                  {order.completed_work_link ? (
                    <div>
                      <p className="text-gray-300">Your submitted work: <a href={order.completed_work_link} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Download Link</a></p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={projectLink}
                        onChange={(e) => setProjectLink(e.target.value)}
                        placeholder="Paste your completed work link (Google Drive, Dropbox, etc.)"
                        className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2"
                      />
                      <button
                        onClick={submitProjectLink}
                        className="glass-button px-4 py-2 rounded-lg text-white"
                      >
                        Submit Link
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* View Links Section */}
              {!isClient && order.project_files_link && (
                <div className="mb-4">
                  <p className="text-gray-300">Client's project files: <a href={order.project_files_link} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Download Link</a></p>
                </div>
              )}
              {!isArtist && order.completed_work_link && (
                <div className="mb-4">
                  <p className="text-gray-300">Artist's completed work: <a href={order.completed_work_link} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Download Link</a></p>
                </div>
              )}
            </div>
          )}

          {/* Project Completion Verification */}
          {isArtist && order.project_files_link && order.completed_work_link && order.status === 'accepted' && (
            <div className="mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={verifyProjectCompletion}
                className="w-full glass-button px-4 py-3 rounded-lg text-sm font-medium text-white"
              >
                Mark Project as Completed
              </motion.button>
            </div>
          )}

          {/* Client Verification */}
          {isClient && order.status === 'pending_client_verification' && (
            <div className="mt-4 space-y-4">
              <p className="text-white">The artist has marked this project as completed. Is everything done to your satisfaction?</p>
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => clientVerifyCompletion(true)}
                  className="flex-1 glass-button px-4 py-3 rounded-lg text-sm font-medium text-white bg-green-600"
                >
                  Yes, Everything is Perfect
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => clientVerifyCompletion(false)}
                  className="flex-1 glass-button px-4 py-3 rounded-lg text-sm font-medium text-white bg-red-600"
                >
                  No, There Are Issues
                </motion.button>
              </div>
            </div>
          )}

          {/* Completion Messages */}
          {order.status === 'completed' && (
            <div className="mt-4">
              <div className="bg-green-600/20 border border-green-500 rounded-lg p-4">
                <p className="text-green-400 text-center">
                  🎉 Project completed successfully! Thank you for using our platform.
                </p>
              </div>
            </div>
          )}

          {order.status === 'revision_needed' && (
            <div className="mt-4">
              <div className="bg-red-600/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-400">
                  ⚠️ Issues reported with the work. Please check the chat for details and work on the required revisions.
                </p>
              </div>
            </div>
          )}

          {/* Chat Section - Show when order is accepted and paid */}
          {order.status === 'accepted' && order.payment_status === 'completed' && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Chat</h2>
              <div className="bg-gray-800/50 rounded-lg p-4 h-96 overflow-y-auto mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${message.sender_id === user?.id ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`inline-block rounded-lg px-4 py-2 max-w-[70%] ${
                        message.sender_id === user?.id
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">{message.sender.full_name}</p>
                      <p>{message.content}</p>
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
                  className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2"
                  onKeyDown={handleKeyPress}
                />
                <button
                  type="submit"
                  className="glass-button px-4 py-2 rounded-lg text-white"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* Add review section after order completion */}
          {order?.status === 'completed' && !order.review && isClient && (
            <div className="glass-card rounded-xl p-6 mt-6">
              <h3 className="text-xl font-semibold text-white mb-4">Leave a Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${
                          star <= rating ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Review</label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your experience working with this artist..."
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    rows={4}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={submitReview}
                  disabled={submittingReview}
                  className="glass-button px-6 py-3 rounded-lg text-sm font-medium text-white w-full disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </motion.button>
              </div>
            </div>
          )}

          {order?.review && (
            <div className="glass-card rounded-xl p-6 mt-6">
              <h3 className="text-xl font-semibold text-white mb-4">Your Review</h3>
              <div className="space-y-2">
                <div className="flex text-yellow-400 text-xl">
                  {Array.from({ length: order.review.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-gray-300">{order.review.comment}</p>
                <p className="text-sm text-gray-400">
                  Posted on {new Date(order.review.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Communication Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-8 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Communication</h2>
          <StatusMessage
            type="info"
            message={order.client_id === user?.id 
              ? userGuidance.communication.messageArtist 
              : userGuidance.communication.messageClient}
            className="mb-4"
          />
          {/* ... existing messages section ... */}
        </motion.div>

        {/* Reviews Section - Show only for completed orders */}
        {order.status === 'completed' && !order.review && isClient && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-8"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Leave a Review</h2>
            <StatusMessage
              type="info"
              message={userGuidance.reviews.leaveReview}
              className="mb-4"
            />
            {/* ... existing review form ... */}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          {/* ... existing action buttons ... */}
        </div>
      </div>
    </div>
  )
} 