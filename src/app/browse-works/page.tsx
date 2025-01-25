'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { FiSearch, FiFilter, FiClock, FiDollarSign, FiTag, FiUser, FiPackage } from 'react-icons/fi'

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
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 })
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 12

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
            setWorks(prevWorks => prevWorks.filter(work => work.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setWorks(prevWorks => prevWorks.map(work => 
              work.id === payload.new.id ? { ...work, ...payload.new } : work
            ))
          } else if (payload.eventType === 'INSERT') {
            if (payload.new.status === 'active') {
              fetchWorkDetails(payload.new.id)
            }
          }
        }
      )
      .subscribe()

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
      
      if (data) {
        setWorks(prevWorks => [...prevWorks, data])
      }
    } catch (error) {
      console.error('Error fetching work details:', error)
    }
  }

  const fetchWorks = async () => {
    try {
      console.log('Starting fetchWorks...')
      console.log('Selected category:', selectedCategory)
      console.log('Current page:', page)
      
      // First, let's check all works to understand what we have
      const { data: allWorks, error: allWorksError } = await supabase
        .from('works')
        .select('*')
      
      if (allWorksError) {
        console.error('Error fetching all works:', allWorksError)
      } else {
        console.log('Total works in database:', allWorks.length)
        console.log('Works by status:', allWorks.reduce((acc, work) => {
          acc[work.status] = (acc[work.status] || 0) + 1
          return acc
        }, {}))
      }
      
      // Now fetch the works we want to display
      let query = supabase
        .from('works')
        .select(`
          *,
          profiles!inner (
            id,
            full_name,
            email,
            is_artist
          )
        `, { count: 'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1)

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Error details:', error)
        throw error
      }
      
      console.log('Query results:', data)
      console.log('Total count of active works:', count)
      console.log('Number of works in current page:', data?.length || 0)
      
      if (!data || data.length === 0) {
        console.log('No works found in the current query')
        
        // Check if it's a category filter issue
        if (selectedCategory !== 'all') {
          const { data: categoryCheck } = await supabase
            .from('works')
            .select('category')
            .eq('status', 'active')
          
          if (categoryCheck) {
            console.log('Available categories:', [...new Set(categoryCheck.map(w => w.category))])
          }
        }
        
        // Check artist profiles
        const { data: artistCheck } = await supabase
          .from('profiles')
          .select('id, is_artist')
          .eq('is_artist', true)
        
        console.log('Number of artist profiles:', artistCheck?.length || 0)
      }
      
      setHasMore(count ? count > page * ITEMS_PER_PAGE : false)
      setWorks(prevWorks => page === 1 ? data || [] : [...prevWorks, ...(data || [])])
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
        return works
    }
  }

  const filteredWorks = works
    .filter(work =>
      work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(work => {
      // Only apply price filter if user has set custom values
      if (priceRange.min === 0 && priceRange.max === 100000) return true;
      return work.price >= priceRange.min && work.price <= priceRange.max;
    })

  const sortedAndFilteredWorks = sortWorks(filteredWorks)

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  // Add intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const sentinel = document.getElementById('sentinel')
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => observer.disconnect()
  }, [hasMore, loading])

  // Reset page when category changes
  useEffect(() => {
    setPage(1)
    setWorks([])
    fetchWorks()
  }, [selectedCategory])

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/50 to-[#0f172a]"></div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
            <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400 mb-6">
                Discover Amazing Creative Works
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Find the perfect artist for your next project
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <FiSearch className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search works by title, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-violet-500 backdrop-blur-xl"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/5 hover:bg-white/10 
                           text-gray-300 hover:text-white transition-all border border-white/10"
                >
                  <FiFilter className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-2xl blur-xl" />
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                  <div className="space-y-6">
                    {/* Category Filters */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-3">Categories</h3>
                      <div className="flex flex-wrap gap-3">
                        {categories.map((category) => (
                          <motion.button
                            key={category.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedCategory(category.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                                     ${selectedCategory === category.value
                                       ? 'bg-violet-500 text-white'
                                       : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                                     }`}
                          >
                            {category.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Sort and Price Range Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Sort Options */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-300 mb-3">Sort By</h3>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as SortOption)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white 
                                   focus:outline-none focus:ring-2 focus:ring-violet-500 backdrop-blur-sm"
                        >
                          {sortOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-gray-900">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Price Range Filter */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-300 mb-3">Price Range (₹)</h3>
                        <div className="flex items-center gap-4">
                          <input
                            type="number"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({ 
                              ...prev, 
                              min: parseInt(e.target.value) || 0,
                              max: Math.max(prev.max, parseInt(e.target.value) || 0)
                            }))}
                            placeholder="Min"
                            min="0"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white 
                                     focus:outline-none focus:ring-2 focus:ring-violet-500 backdrop-blur-sm"
                          />
                          <span className="text-gray-400">to</span>
                          <input
                            type="number"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ 
                              ...prev, 
                              max: parseInt(e.target.value) || prev.max,
                              min: Math.min(prev.min, parseInt(e.target.value) || prev.min)
                            }))}
                            placeholder="Max"
                            min="0"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white 
                                     focus:outline-none focus:ring-2 focus:ring-violet-500 backdrop-blur-sm"
                          />
                        </div>
                        <button
                          onClick={() => setPriceRange({ min: 0, max: 100000 })}
                          className="mt-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          Reset Price Range
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Works Grid */}
        {loading && page === 1 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
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
          </motion.div>
        ) : sortedAndFilteredWorks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
            <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl text-center">
              <h3 className="text-xl text-white mb-4">No works found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedAndFilteredWorks.map((work, index) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-2xl blur-xl" />
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="relative aspect-video">
                      {work.images[0] ? (
                        <>
                          <Image
                            src={work.images[0].startsWith('http') 
                              ? work.images[0] 
                              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${work.images[0]}`}
                            alt={work.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent 
                                      opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <FiPackage className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <div className="px-3 py-1 rounded-xl text-xs font-medium backdrop-blur-sm
                                    bg-violet-400/10 text-violet-300 border border-violet-400/20">
                          {work.category}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-semibold text-white group-hover:text-violet-400 transition-colors truncate">
                          {work.title}
                        </h3>
                      </div>

                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {work.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                            <FiDollarSign className="w-4 h-4" />
                            <span>Price</span>
                          </div>
                          <p className="text-white">₹{work.price}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                            <FiClock className="w-4 h-4" />
                            <span>Delivery</span>
                          </div>
                          <p className="text-white">{work.delivery_time} days</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <FiUser className="w-4 h-4" />
                          <span className="text-sm">{work.profiles?.full_name}</span>
                        </div>
                        <div className="flex gap-2">
                          {work.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-violet-400/10 text-violet-300 px-2 py-1 rounded-xl text-xs
                                       border border-violet-400/20 backdrop-blur-sm"
                            >
                              {tag}
                            </span>
                          ))}
                          {work.tags.length > 2 && (
                            <span className="text-gray-400 text-xs flex items-center">
                              +{work.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push(`/works/${work.id}`)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                                 hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all"
                      >
                        Hire for Work
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Loading sentinel for infinite scroll */}
            <div id="sentinel" className="h-20 flex items-center justify-center">
              {loading && hasMore && (
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
} 