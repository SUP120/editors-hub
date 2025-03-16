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
import { FiEdit3, FiPlus, FiRefreshCw, FiStar, FiAward, FiClock, FiMapPin, FiPhone, FiMail, FiUser, FiEye, FiTrash2 } from 'react-icons/fi'

export default function ArtistProfile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null)
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

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
        fetchWorks(user.id)
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

  const handleEditProfile = () => {
    router.push('/artist/edit-profile')
  }

  const handleAddWork = () => {
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

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
            <div className="flex justify-between items-start mb-8">
              <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                Artist Profile
              </h1>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEditProfile}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                         hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all
                         flex items-center gap-2"
              >
                <FiEdit3 className="w-4 h-4" />
                Edit Profile
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FiUser className="text-violet-400" />
                  Basic Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiUser className="text-violet-400 w-5 h-5" />
                    <div>
                      <p className="text-sm text-violet-400">Full Name</p>
                      <p className="text-white">{profile?.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiUser className="text-violet-400 w-5 h-5" />
                    <div>
                      <p className="text-sm text-violet-400">Display Name</p>
                      <p className="text-white">{profile?.display_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiMail className="text-violet-400 w-5 h-5" />
                    <div>
                      <p className="text-sm text-violet-400">Email</p>
                      <p className="text-white">{profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiMapPin className="text-violet-400 w-5 h-5" />
                    <div>
                      <p className="text-sm text-violet-400">Location</p>
                      <p className="text-white">{profile?.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiPhone className="text-violet-400 w-5 h-5" />
                    <div>
                      <p className="text-sm text-violet-400">Phone</p>
                      <p className="text-white">{profile?.phone_number}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-gray-300">
                    <FiUser className="text-violet-400 w-5 h-5 mt-1" />
                    <div>
                      <p className="text-sm text-violet-400">Bio</p>
                      <p className="text-white mt-1">{profile?.bio}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FiAward className="text-violet-400" />
                  Professional Information
                </h2>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-violet-400 mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-2">
                      {(artistProfile?.specialty || []).map((specialty, index) => (
                        <span key={index} className="bg-violet-400/10 text-violet-300 px-3 py-1 rounded-xl text-sm
                                                   border border-violet-400/20 backdrop-blur-sm">
                          {specialty}
                        </span>
                      ))}
                      {(!artistProfile?.specialty || artistProfile.specialty.length === 0) && (
                        <span className="text-gray-400 text-sm">No specialties added yet</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-violet-400 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {(artistProfile?.skills || []).map((skill, index) => (
                        <span key={index} className="bg-indigo-400/10 text-indigo-300 px-3 py-1 rounded-xl text-sm
                                                   border border-indigo-400/20 backdrop-blur-sm">
                          {skill}
                        </span>
                      ))}
                      {(!artistProfile?.skills || artistProfile.skills.length === 0) && (
                        <span className="text-gray-400 text-sm">No skills added yet</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                      <p className="text-sm text-violet-400">Hourly Rate</p>
                      <p className="text-2xl font-bold text-white mt-1">₹{artistProfile?.hourly_rate || 0}/hr</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                      <p className="text-sm text-violet-400">Experience</p>
                      <p className="text-2xl font-bold text-white mt-1">{artistProfile?.years_of_experience || 0} years</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-violet-400">Rating</p>
                      <div className="flex items-center gap-1">
                        <FiStar className="text-yellow-400 w-4 h-4" />
                        <span className="text-xl font-bold text-white">{(artistProfile?.rating || 0).toFixed(1)}</span>
                        <span className="text-gray-400 text-sm">({artistProfile?.total_reviews || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Works Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                  My Works
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchWorks(user.id)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-all
                           border border-white/10 backdrop-blur-sm"
                  title="Refresh works"
                >
                  <FiRefreshCw className="w-5 h-5" />
                </motion.button>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddWork}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                         hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all
                         flex items-center gap-2"
              >
                <FiPlus className="w-5 h-5" />
                Add New Work
              </motion.button>
            </div>

            {/* Featured Works Section */}
            <AnimatePresence>
              {works.some(work => work.is_featured) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-12"
                >
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <FiStar className="text-yellow-400" />
                    Featured Works
                  </h3>
                  <FeaturedWorks works={works.filter(work => work.is_featured)} />
                </motion.div>
              )}

              {/* Before/After Comparisons */}
              {works.some(work => work.before_image && work.after_image) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-12"
                >
                  <h3 className="text-xl font-semibold text-white mb-6">Before/After Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {works
                      .filter(work => work.before_image && work.after_image)
                      .map(work => (
                        <BeforeAfterComparison
                          key={work.id}
                          beforeImage={work.before_image!}
                          afterImage={work.after_image!}
                          title={work.title}
                        />
                      ))
                    }
                  </div>
                </motion.div>
              )}

              {/* Video Works */}
              {works.some(work => work.video_url) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-12"
                >
                  <h3 className="text-xl font-semibold text-white mb-6">Video Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {works
                      .filter(work => work.video_url)
                      .map(work => (
                        <VideoPlayer
                          key={work.id}
                          videoUrl={work.video_url!}
                          title={work.title}
                          thumbnail={work.images[0] ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${work.images[0]}` : undefined}
                        />
                      ))
                    }
                  </div>
                </motion.div>
              )}

              {/* All Works Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h3 className="text-xl font-semibold text-white mb-6">All Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {works.map((work, index) => (
                    <motion.div
                      key={work.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-2xl blur-xl" />
                      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        {work.images?.[0] && (
                          <div className="relative h-48">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${work.images[0]}`}
                              alt={work.title}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent 
                                          opacity-0 group-hover:opacity-100 transition-all duration-300 
                                          flex items-end justify-between p-4">
                              <div className="flex gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => router.push(`/works/${work.id}`)}
                                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                                >
                                  <FiEye className="w-5 h-5" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDeleteWork(work.id)}
                                  disabled={isDeleting === work.id}
                                  className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 
                                           hover:text-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isDeleting === work.id ? (
                                    <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <FiTrash2 className="w-5 h-5" />
                                  )}
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors">
                              {work.title}
                            </h3>
                            {work.is_featured && (
                              <span className="bg-yellow-400/20 text-yellow-300 text-xs px-2 py-1 rounded-xl
                                             border border-yellow-400/20 backdrop-blur-sm">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{work.description}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {work.tags.map((tag, index) => (
                              <span key={index} className="bg-violet-400/10 text-violet-300 px-2 py-1 rounded-xl text-xs
                                                         border border-violet-400/20 backdrop-blur-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-violet-400 font-medium">₹{work.price}</span>
                            <span className="text-gray-400 text-sm">{work.category}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {works.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-gray-400 mb-4">You haven't added any works yet.</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddWork}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                             hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all
                             inline-flex items-center gap-2"
                  >
                    <FiPlus className="w-5 h-5" />
                    Add Your First Work
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 