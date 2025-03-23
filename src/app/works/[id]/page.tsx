'use client'

import React, { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { sendOrderNotification } from '@/lib/email'
import { FiClock, FiDollarSign, FiRepeat, FiList, FiUser, FiMail, FiTag, FiX } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

type WorkDetails = {
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
  artist_id: string
  requirements: string
  revisions: number
  profiles: {
    id: string
    full_name: string
    email: string
    is_artist: boolean
  }
}

type OrderDetails = {
  work_id: string
  client_id: string
  artist_id: string
  price: number
  platform_fee: number
  total_amount: number
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  requirements: string
  created_at: string
}

export default function WorkDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [work, setWork] = useState<WorkDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [orderRequirements, setOrderRequirements] = useState('')
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderError, setOrderError] = useState('')

  useEffect(() => {
    fetchWorkDetails()
    checkUser()
  }, [params.id])

  const fetchWorkDetails = async () => {
    setLoading(true)
    try {
      const { data: work, error: workError } = await supabase
        .from('works')
        .select(`
          *,
          profiles!inner (
            id,
            full_name,
            avatar_url,
            is_artist
          )
        `)
        .eq('id', params.id)
        .eq('is_deleted', false)
        .single()

      if (workError) throw workError
      if (!work) throw new Error('Work not found or has been deleted')

      setWork(work)
      if (work?.images?.[0]) {
        setSelectedImage(work.images[0])
      }
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleOrder = async () => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    setShowOrderModal(true)
  }

  const submitOrder = async () => {
    if (!user || !work) return

    setOrderLoading(true)
    setOrderError('')

    try {
      const orderId = uuidv4()
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          work_id: work.id,
          client_id: user.id,
          artist_id: work.artist_id,
          requirements: orderRequirements,
          status: 'pending',
          payment_status: 'pending',
          price: work.price,
          platform_fee: Math.round(work.price * 0.02), // 2% platform fee
          total_amount: work.price + Math.round(work.price * 0.02),
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error creating order:', orderError)
        toast.error('Failed to create order. Please try again.')
        return
      }

      // Show success message first
      toast.success('Order created successfully!')

      // Try to send email notifications, but don't block on failure
      try {
        await sendOrderNotification({
          orderId,
          artistId: work.artist_id,
          clientId: user.id,
          workTitle: work.title,
          requirements: orderRequirements
        })
      } catch (emailError: any) {
        // Log email error but don't fail the order creation
        console.error('Error sending order notifications:', {
          error: emailError.message,
          stack: emailError.stack,
          orderId
        })
        // Show warning about email
        toast.warning('Order created but notification emails could not be sent. Our team will handle this.')
      }

      router.push(`/orders/${orderId}`)
    } catch (error: any) {
      console.error('Error in order submission:', error)
      toast.error(error.message || 'Failed to create order. Please try again.')
    } finally {
      setOrderLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  if (error || !work) {
    return (
      <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl text-center">
            <h1 className="text-2xl text-white mb-4">Error Loading Work</h1>
            <p className="text-red-400 mb-6">{error || 'Work not found'}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/browse-works')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                       hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all"
            >
              Back to Browse
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-2xl blur-xl" />
              <div className="relative aspect-video w-full overflow-hidden rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl">
                <Image
                  src={selectedImage?.startsWith('http')
                    ? selectedImage
                    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${selectedImage}`}
                  alt={work.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            
            {/* Thumbnail Grid */}
            <div className="grid grid-cols-4 gap-4">
              {work.images.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(image)}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-xl blur-lg" />
                  <div className={`relative aspect-square rounded-xl overflow-hidden backdrop-blur-xl bg-white/5 border-2 
                                ${selectedImage === image 
                                  ? 'border-violet-500 shadow-lg shadow-violet-500/20' 
                                  : 'border-white/10'}`}
                  >
                    <Image
                      src={image.startsWith('http')
                        ? image
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${image}`}
                      alt={`${work.title} thumbnail ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-2xl blur-xl" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                    {work.title}
                  </h1>
                  <div className="px-3 py-1 rounded-xl text-xs font-medium backdrop-blur-sm
                              bg-violet-400/10 text-violet-300 border border-violet-400/20">
                    {work.category}
                  </div>
                </div>
                <p className="text-gray-300">{work.description}</p>
                
                <div className="mt-6 flex flex-wrap gap-2">
                  {work.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-violet-400/10 text-violet-300 px-2 py-1 rounded-xl text-xs
                               border border-violet-400/20 backdrop-blur-sm flex items-center gap-1"
                    >
                      <FiTag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-2xl blur-xl" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl">
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <FiDollarSign className="w-4 h-4" />
                      <span>Price</span>
                    </div>
                    <p className="text-2xl font-bold text-white">₹{work.price}</p>
                    <p className="text-xs text-violet-400">+ ₹4 platform fee</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <FiClock className="w-4 h-4" />
                      <span>Delivery</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{work.delivery_time}</p>
                    <p className="text-xs text-gray-400">days</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <FiRepeat className="w-4 h-4" />
                      <span>Revisions</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{work.revisions}</p>
                    <p className="text-xs text-gray-400">included</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOrder}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white text-lg font-medium
                           hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all"
                >
                  Continue with Order (₹{work.price + 4})
                </motion.button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-2xl blur-xl" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <FiUser className="w-5 h-5" />
                  About the Artist
                </h2>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10">
                    <div className="absolute inset-0 flex items-center justify-center text-2xl text-white">
                      {work.profiles.full_name[0]}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{work.profiles.full_name}</h3>
                    <p className="text-gray-400 flex items-center gap-2">
                      <FiMail className="w-4 h-4" />
                      {work.profiles.email}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiList className="w-4 h-4" />
                    Requirements
                  </h3>
                  <p className="text-gray-400 text-sm whitespace-pre-wrap">{work.requirements}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Order Modal */}
      <AnimatePresence>
        {showOrderModal && (
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
              className="relative w-full max-w-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-2xl blur-xl" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Order Details</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowOrderModal(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </motion.button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Requirements for the Artist
                    </label>
                    <textarea
                      rows={6}
                      value={orderRequirements}
                      onChange={(e) => setOrderRequirements(e.target.value)}
                      placeholder="Describe your requirements in detail..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 
                               focus:outline-none focus:ring-2 focus:ring-violet-500 backdrop-blur-sm"
                    />
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                      <span>Service Price</span>
                      <span>₹{work.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                      <span>Platform Fee</span>
                      <span>₹4</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-medium text-white">
                      <span>Total</span>
                      <span>₹{work.price + 4}</span>
                    </div>
                  </div>

                  {orderError && (
                    <div className="text-red-400 text-sm text-center">
                      {orderError}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowOrderModal(false)}
                      className="flex-1 px-6 py-3 rounded-xl text-gray-300 font-medium backdrop-blur-sm
                               bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={submitOrder}
                      disabled={orderLoading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                               hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {orderLoading ? 'Processing...' : 'Place Order'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 