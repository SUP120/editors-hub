'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import FeaturedWorks from '@/components/portfolio/FeaturedWorks'
import BeforeAfterComparison from '@/components/portfolio/BeforeAfterComparison'
import VideoPlayer from '@/components/portfolio/VideoPlayer'
import type { Work, Profile, ArtistProfile } from '@/types'
import { toast } from 'react-hot-toast'
import { FiEdit3, FiPlus, FiRefreshCw, FiStar, FiAward, FiClock, FiMapPin, FiPhone, FiMail, FiUser, FiEye, FiTrash2, FiPackage, FiGlobe, FiTwitter, FiInstagram, FiDollarSign, FiCalendar, FiEdit } from 'react-icons/fi'
import { FiMessageCircle } from 'react-icons/fi'

export default function ArtistProfile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null)
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('works')
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      if (!user) {
        router.push('/auth/signin')
        return
      }

      setUser(user)
      await Promise.all([
        fetchProfile(user.id),
        fetchWorks(user.id),
        fetchReviews(user.id)
      ])
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      // Fetch basic profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Fetch artist profile
      const { data: artistData, error: artistError } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (artistError) throw artistError
      setArtistProfile(artistData)
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      setError(error.message)
    }
  }

  const fetchWorks = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .eq('artist_id', userId)
        .neq('status', 'deleted')
        .order('created_at', { ascending: false })

      if (error) throw error
      setWorks(data || [])
    } catch (error: any) {
      console.error('Error fetching works:', error)
      setError(error.message)
    }
  }

  const fetchReviews = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('artist_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (error: any) {
      console.error('Error fetching reviews:', error)
      setError(error.message)
    }
  }

  const handleEditProfile = () => {
    router.push('/artist/edit-profile')
  }

  const handleAddWork = () => {
    if (!profile?.is_artist) {
      toast.error('Only artists can add works')
      return
    }
    router.push('/artist/works/new')
  }

  const handleEditWork = async (workId: string) => {
    router.push(`/artist/works/edit/${workId}`)
  }

  const handleDeleteWork = async (workId: string) => {
    if (!confirm('Are you sure you want to delete this work? This action cannot be undone.')) {
      return
    }

    setIsDeleting(workId)
    try {
      const { error } = await supabase
        .from('works')
        .update({ is_deleted: true, status: 'deleted' })
        .eq('id', workId)
        .eq('artist_id', user.id)

      if (error) throw error

      // Remove the work from the local state
      setWorks(prevWorks => prevWorks.filter(w => w.id !== workId))
      toast.success('Work deleted successfully')
    } catch (error: any) {
      console.error('Error deleting work:', error)
      toast.error(error.message || 'Failed to delete work')
    } finally {
      setIsDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'works', label: 'Works' },
    { id: 'about', label: 'About' },
    { id: 'reviews', label: 'Reviews' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-violet-900 py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements - reduce on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(window.innerWidth > 768 ? 15 : 8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/5 rounded-full"
            style={{
              width: Math.random() * (window.innerWidth > 768 ? 300 : 150) + 50,
              height: Math.random() * (window.innerWidth > 768 ? 300 : 150) + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 items-center md:items-start mb-6 sm:mb-8 md:mb-12">
          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-violet-500/30 shadow-lg shadow-violet-500/20"
          >
            {profile?.avatar_url ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`}
                alt={profile?.full_name || 'Artist'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-violet-800/50 flex items-center justify-center">
                <FiUser className="w-12 h-12 sm:w-16 sm:h-16 text-violet-300" />
              </div>
            )}
          </motion.div>

          {/* Profile Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            className="text-center md:text-left flex-1"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 mb-1 sm:mb-2">
              {profile?.full_name || 'Artist'}
              </h1>
            <p className="text-blue-200 text-sm sm:text-base mb-2 sm:mb-3">
              {profile?.bio || 'No bio available'}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="glass-card px-3 sm:px-4 py-1 sm:py-2 rounded-full border border-violet-500/20 flex items-center gap-1 sm:gap-2">
                <FiPackage className="w-3 h-3 sm:w-4 sm:h-4 text-violet-400" />
                <span className="text-white text-xs sm:text-sm">{works.length} Works</span>
                    </div>
              <div className="glass-card px-3 sm:px-4 py-1 sm:py-2 rounded-full border border-violet-500/20 flex items-center gap-1 sm:gap-2">
                <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                <span className="text-white text-xs sm:text-sm">{artistProfile?.rating || '0'} Rating</span>
              </div>
              <div className="glass-card px-3 sm:px-4 py-1 sm:py-2 rounded-full border border-violet-500/20 flex items-center gap-1 sm:gap-2">
                <FiClock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                <span className="text-white text-xs sm:text-sm">Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            {/* Contact & Social */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3">
              {profile?.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-1.5 sm:p-2 rounded-full border border-violet-500/20 hover:border-violet-500/50 transition-colors duration-200"
                >
                  <FiGlobe className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-400" />
                </a>
              )}
              {profile?.twitter && (
                <a
                  href={`https://twitter.com/${profile.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-1.5 sm:p-2 rounded-full border border-violet-500/20 hover:border-violet-500/50 transition-colors duration-200"
                >
                  <FiTwitter className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-400" />
                </a>
              )}
              {profile?.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-1.5 sm:p-2 rounded-full border border-violet-500/20 hover:border-violet-500/50 transition-colors duration-200"
                >
                  <FiInstagram className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-pink-400" />
                </a>
              )}
              {user?.id === profile?.id && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/artist/edit-profile')}
                  className="glass-card px-3 sm:px-4 py-1 sm:py-2 rounded-full border border-violet-500/20 hover:border-violet-500/50 transition-colors duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <FiEdit className="w-3 h-3 sm:w-4 sm:h-4 text-violet-400" />
                  <span className="text-white">Edit Profile</span>
                </motion.button>
              )}
            </div>
          </motion.div>
              </div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 border-b border-gray-700 pb-2 sm:pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
            </div>

        {/* Tab Content */}
        <div>
          {/* Works Tab */}
          {activeTab === 'works' && (
                <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Featured Works */}
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Featured Works</h2>
                  {user?.id === profile?.id && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddWork}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors duration-200 text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                    >
                      <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Add New Work</span>
                    </motion.button>
                  )}
                </div>

                {works.length === 0 ? (
                  <div className="glass-card rounded-xl p-4 sm:p-6 border border-violet-500/20 text-center">
                    <FiPackage className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">No works available yet</p>
                    {user?.id === profile?.id && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddWork}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors duration-200 text-xs sm:text-sm inline-flex items-center gap-1 sm:gap-2"
                      >
                        <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Add Your First Work</span>
                      </motion.button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {works.map((work, index) => (
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

                            {/* Actions */}
                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700 flex items-center justify-between">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push(`/works/${work.id}`)}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors duration-200 text-xs sm:text-sm"
                              >
                                View Details
                              </motion.button>
                              {user?.id === profile?.id && (
                                <div className="flex items-center gap-1 sm:gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push(`/artist/works/edit/${work.id}`)}
                                    className="p-1 sm:p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                                >
                                    <FiEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDeleteWork(work.id)}
                                    className="p-1 sm:p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                                  >
                                    <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </motion.button>
                              </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                            )}
                          </div>
            </motion.div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-xl p-4 sm:p-6 border border-violet-500/20"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">About Me</h2>
              <div className="space-y-4 sm:space-y-6 text-sm sm:text-base">
                <p className="text-gray-300">
                  {profile?.bio || 'No bio available'}
                </p>
                
                {artistProfile?.skills && artistProfile.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {artistProfile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-violet-400/10 text-violet-300 border border-violet-400/20"
                        >
                          {skill}
                              </span>
                            ))}
                    </div>
                  </div>
                )}
                
                {artistProfile?.experience && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Experience</h3>
                    <p className="text-gray-300">
                      {artistProfile.experience}
                    </p>
                  </div>
                )}
                
                {artistProfile?.education && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Education</h3>
                    <p className="text-gray-300">
                      {artistProfile.education}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="glass-card rounded-xl p-4 sm:p-6 border border-violet-500/20">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Client Reviews</h2>
                
                {reviews.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <FiMessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-300 text-sm sm:text-base">No reviews available yet</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-700 pb-4 sm:pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start gap-3 sm:gap-4 mb-2 sm:mb-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-violet-400/20 flex-shrink-0 flex items-center justify-center">
                            <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 sm:mb-2">
                              <h3 className="text-sm sm:text-base font-medium text-white">
                                {review.client_name || 'Anonymous Client'}
                              </h3>
                              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400">
                                <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{new Date(review.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                              {[...Array(5)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                                  }`}
                                />
                              ))}
                              <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-yellow-400">{review.rating}/5</span>
                            </div>
                            <p className="text-gray-300 text-xs sm:text-sm">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
                )}
              </div>
                </motion.div>
              )}
          </div>
      </div>
    </div>
  )
} 