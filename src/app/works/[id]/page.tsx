'use client'

import React, { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

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

export default function WorkDetails({ params }: { params: Promise<{ id: string }> }) {
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
  const resolvedParams = use(params)

  useEffect(() => {
    fetchWorkDetails()
    checkUser()
  }, [resolvedParams.id])

  const fetchWorkDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('works')
        .select(`
          *,
          profiles!artist_id (
            id,
            full_name,
            email,
            is_artist
          )
        `)
        .eq('id', resolvedParams.id)
        .single()

      if (error) throw error
      setWork(data)
      if (data?.images?.[0]) {
        setSelectedImage(data.images[0])
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
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            work_id: work.id,
            client_id: user.id,
            artist_id: work.artist_id,
            price: work.price,
            platform_fee: 4,
            total_amount: work.price + 4,
            status: 'pending',
            requirements: orderRequirements,
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Send email notification (we'll implement this next)
      
      router.push(`/orders/${data.id}`)
    } catch (error: any) {
      console.error('Error creating order:', error)
      setOrderError(error.message)
    } finally {
      setOrderLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  if (error || !work) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl text-white mb-4">Error Loading Work</h1>
        <p className="text-red-400">{error || 'Work not found'}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/browse-works')}
          className="mt-6 glass-button px-6 py-3 text-white rounded-lg text-sm font-medium"
        >
          Back to Browse
        </motion.button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div className="space-y-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl glass-card">
              <Image
                src={selectedImage?.startsWith('http')
                  ? selectedImage
                  : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${selectedImage}`}
                alt={work.title}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Thumbnail Grid */}
            <div className="grid grid-cols-4 gap-4">
              {work.images.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(image)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === image ? 'border-violet-500' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image.startsWith('http')
                      ? image
                      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${image}`}
                    alt={`${work.title} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-white">{work.title}</h1>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-violet-600 text-white">
                  {work.category}
                </span>
              </div>
              <p className="text-gray-300">{work.description}</p>
            </div>

            <div className="glass-card rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Price</p>
                  <p className="text-3xl font-bold text-violet-400">₹{work.price}</p>
                  <p className="text-sm text-gray-400">+ ₹4 platform fee</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Delivery Time</p>
                  <p className="text-xl text-white">{work.delivery_time} days</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Revisions</p>
                  <p className="text-xl text-white">{work.revisions}</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOrder}
                className="w-full glass-button py-4 text-white rounded-lg text-lg font-medium"
              >
                Continue with Order (₹{work.price + 4})
              </motion.button>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">About the Artist</h2>
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden bg-violet-600">
                  <div className="absolute inset-0 flex items-center justify-center text-2xl text-white">
                    {work.profiles.full_name[0]}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{work.profiles.full_name}</h3>
                  <p className="text-gray-400">{work.subcategory} Specialist</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>
              <p className="text-gray-300">{work.requirements || 'No specific requirements provided.'}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {work.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-violet-600/30 text-violet-200 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal - Moved outside the main content */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl p-6 max-w-lg w-full space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">Complete Your Order</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Service Price</span>
                <span className="text-white">₹{work.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Platform Fee</span>
                <span className="text-white">₹4</span>
              </div>
              <div className="flex justify-between text-base font-semibold border-t border-gray-700 pt-2">
                <span className="text-gray-300">Total Amount</span>
                <span className="text-violet-400">₹{work.price + 4}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Requirements
              </label>
              <textarea
                value={orderRequirements}
                onChange={(e) => setOrderRequirements(e.target.value)}
                placeholder="Describe your project requirements, specifications, and any other details the artist should know..."
                rows={6}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {orderError && (
              <p className="text-red-400 text-sm">{orderError}</p>
            )}

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowOrderModal(false)}
                className="flex-1 px-6 py-3 rounded-lg text-sm font-medium bg-gray-800 text-white hover:bg-gray-700"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={submitOrder}
                disabled={orderLoading}
                className="flex-1 glass-button px-6 py-3 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              >
                {orderLoading ? 'Processing...' : `Place Order (₹${work.price + 4})`}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 