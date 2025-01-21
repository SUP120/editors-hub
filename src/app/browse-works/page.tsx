'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Image from 'next/image'

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
  artist_id: string
  profiles: {
    id: string
    full_name: string
    email: string
    is_artist: boolean
  }
}

type SortOption = 'newest' | 'price_low' | 'price_high' | 'delivery_fast'

export default function BrowseWorks() {
  const router = useRouter()
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })

  const categories = [
    { value: 'all', label: 'All Works' },
    { value: 'video_editing', label: 'Video Editing' },
    { value: 'photo_editing', label: 'Photo Editing' },
    { value: 'thumbnail_design', label: 'Thumbnail Design' },
    { value: 'color_grading', label: 'Color Grading' },
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'delivery_fast', label: 'Fastest Delivery' },
  ]

  useEffect(() => {
    fetchWorks()

    // Subscribe to works table changes
    const worksSubscription = supabase
      .channel('works-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'works'
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            // Remove the deleted work from the state
            setWorks(prevWorks => prevWorks.filter(work => work.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            // Update the modified work in the state
            setWorks(prevWorks => prevWorks.map(work => 
              work.id === payload.new.id ? { ...work, ...payload.new } : work
            ))
          } else if (payload.eventType === 'INSERT') {
            // Add the new work to the state if it's active
            if (payload.new.status === 'active') {
              fetchWorkDetails(payload.new.id)
            }
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      worksSubscription.unsubscribe()
    }
  }, [selectedCategory])

  const fetchWorkDetails = async (workId: string) => {
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
        .eq('id', workId)
        .single()

      if (error) throw error
      
      // Add the new work to the state
      if (data) {
        setWorks(prevWorks => [...prevWorks, data])
      }
    } catch (error) {
      console.error('Error fetching work details:', error)
    }
  }

  const fetchWorks = async () => {
    try {
      let query = supabase
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
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error
      setWorks(data || [])
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const sortWorks = (works: Work[]) => {
    switch (sortBy) {
      case 'price_low':
        return [...works].sort((a, b) => a.price - b.price)
      case 'price_high':
        return [...works].sort((a, b) => b.price - a.price)
      case 'delivery_fast':
        return [...works].sort((a, b) => a.delivery_time - b.delivery_time)
      default:
        return works // 'newest' is default, already sorted by created_at in the query
    }
  }

  const filteredWorks = works
    .filter(work =>
      work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(work => work.price >= priceRange.min && work.price <= priceRange.max)

  const sortedAndFilteredWorks = sortWorks(filteredWorks)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/50 to-gray-900"></div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Discover Amazing Creative Works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 mb-8"
          >
            Find the perfect artist for your next project
          </motion.p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search works by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters Section */}
        <div className="mb-8 space-y-6">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <motion.button
                key={category.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category.value
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.label}
              </motion.button>
            ))}
          </div>

          {/* Sort and Price Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sort Options */}
            <div className="glass-card rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="glass-card rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price Range
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                  placeholder="Min"
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 0 }))}
                  placeholder="Max"
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Works Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : sortedAndFilteredWorks.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-300 mb-4">No works found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {sortedAndFilteredWorks.map((work) => (
              <motion.div
                key={work.id}
                variants={item}
                className="glass-card rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  {work.images[0] ? (
                    <>
                      <Image
                        src={work.images[0].startsWith('http') 
                          ? work.images[0] 
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${work.images[0]}`}
                        alt={work.title}
                        fill
                        className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">No thumbnail</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet-600 text-white">
                      {work.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white truncate">
                      {work.title}
                    </h3>
                    <div className="text-sm text-gray-400">
                      {work.category}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {work.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {work.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-violet-600/30 text-violet-200 px-2 py-1 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {work.tags.length > 3 && (
                      <span className="text-gray-400 text-xs">
                        +{work.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-violet-400">
                        <span className="text-2xl font-bold">₹{work.price}</span>
                      </div>
                      <div className="text-gray-400 text-sm">
                        {work.delivery_time} day{work.delivery_time > 1 ? 's' : ''} delivery
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-300 text-sm font-medium">
                        by {work.profiles?.full_name}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {work.subcategory}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/works/${work.id}`)}
                    className="w-full glass-button px-6 py-3 text-white rounded-lg text-sm font-medium"
                  >
                    Hire for Work
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
} 