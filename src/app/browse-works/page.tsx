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
  const [numBackgroundElements, setNumBackgroundElements] = useState(10)
  const [backgroundElementSizes, setBackgroundElementSizes] = useState<Array<{ width: number, height: number }>>([])
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
        .eq('is_deleted', false)
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
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const loadingTrigger = document.getElementById('loading-trigger');
    if (loadingTrigger) {
      observer.observe(loadingTrigger);
    }

    return () => {
      if (loadingTrigger) {
        observer.unobserve(loadingTrigger);
      }
    };
  }, [hasMore, loading]);

  // Reset page when category changes
  useEffect(() => {
    setPage(1)
    setWorks([])
    fetchWorks()
  }, [selectedCategory])

  // Add useEffect for background elements
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateBackgroundElements = () => {
      const isLargeScreen = window.innerWidth > 768;
      const count = isLargeScreen ? 20 : 10;
      setNumBackgroundElements(count);
      
      const sizes = Array(count).fill(null).map(() => ({
        width: Math.random() * (isLargeScreen ? 300 : 150) + 50,
        height: Math.random() * (isLargeScreen ? 300 : 150) + 50
      }));
      setBackgroundElementSizes(sizes);
    };

    updateBackgroundElements();
    window.addEventListener('resize', updateBackgroundElements);
    return () => window.removeEventListener('resize', updateBackgroundElements);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-violet-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(numBackgroundElements)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-gradient-to-r from-violet-200/20 to-violet-400/20 rounded-full mix-blend-multiply filter blur-xl"
            animate={{
              x: [Math.random() * 100, Math.random() * 100],
              y: [Math.random() * 100, Math.random() * 100],
            }}
            style={{
              width: backgroundElementSizes[i]?.width || 50,
              height: backgroundElementSizes[i]?.height || 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 md:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 mb-2 sm:mb-4">
            Discover Amazing Works
          </h1>
          <p className="text-blue-200 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Explore a curated collection of stunning works from talented artists around the world
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <div className="mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-violet-500/20"
          >
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center">
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search works..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-800/50 border border-violet-700/50 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                />
              </div>

              {/* Category Selector */}
              <div className="flex-shrink-0 w-full md:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-violet-700/50 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Selector */}
              <div className="flex-shrink-0 w-full md:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-violet-700/50 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base w-full md:w-auto justify-center"
              >
                <FiFilter />
                <span>Filters</span>
              </motion.button>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-700"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-blue-200 mb-2">
                        Price Range
                      </label>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                          className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-violet-700/50 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm sm:text-base"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                          className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-violet-700/50 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Works Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px] sm:min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : sortedAndFilteredWorks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 sm:py-12"
          >
            <div className="text-gray-400 text-sm sm:text-lg">No works found matching your criteria</div>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setPriceRange({ min: 0, max: 100000 })
              }}
              className="mt-4 text-violet-400 hover:text-violet-300 transition-colors duration-200 text-sm sm:text-base"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sortedAndFilteredWorks.map((work, index) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative"
              >
                <div className="glass-card overflow-hidden rounded-xl border border-violet-500/20 transition-all duration-300 group-hover:border-violet-500/40 group-hover:shadow-lg group-hover:shadow-violet-500/10">
                  {/* Work Image */}
                  <div className="relative aspect-video overflow-hidden">
                    {work.images && work.images[0] ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${work.images[0]}`}
                        alt={work.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <FiPackage className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Work Details */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2 line-clamp-2">
                      {work.title}
                    </h3>
                    <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                      {work.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                      {work.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 sm:py-1 rounded-full bg-violet-400/10 text-violet-300 border border-violet-400/20"
                        >
                          {tag}
                        </span>
                      ))}
                      {work.tags.length > 3 && (
                        <span className="text-xs px-2 py-0.5 sm:py-1 rounded-full bg-violet-400/10 text-violet-300 border border-violet-400/20">
                          +{work.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Work Info */}
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-1 sm:gap-2 text-violet-400">
                        <FiDollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>₹{work.price}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-blue-400">
                        <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{work.delivery_time} days</span>
                      </div>
                    </div>

                    {/* Artist Info */}
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700 flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-violet-400/20 flex items-center justify-center">
                        <FiUser className="w-3 h-3 sm:w-4 sm:h-4 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-white text-xs sm:text-sm font-medium">
                          {work.profiles.full_name || 'Anonymous Artist'}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {work.category}
                        </p>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push(`/works/${work.id}`)}
                      className="mt-3 sm:mt-4 w-full py-1.5 sm:py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors duration-200 text-xs sm:text-sm"
                    >
                      View Details
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="mt-6 sm:mt-8 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadMore}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors duration-200 text-sm sm:text-base"
            >
              Load More Works
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
} 