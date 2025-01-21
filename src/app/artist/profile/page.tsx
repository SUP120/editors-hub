'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import FeaturedWorks from '@/components/portfolio/FeaturedWorks'
import BeforeAfterComparison from '@/components/portfolio/BeforeAfterComparison'
import VideoPlayer from '@/components/portfolio/VideoPlayer'
import type { Work, Profile, ArtistProfile } from '@/types'
import { toast } from 'react-hot-toast'

export default function ArtistProfile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null)
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    if (!confirm('Are you sure you want to delete this work? This action cannot be undone.')) return

    try {
      // First mark associated orders as cancelled
      const { error: ordersError } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('work_id', workId)
        .in('status', ['pending', 'accepted'])

      if (ordersError) {
        console.error('Error updating associated orders:', ordersError)
      }

      // Delete the work's images from storage
      const workToDelete = works.find(w => w.id === workId)
      if (workToDelete?.images?.length) {
        for (const image of workToDelete.images) {
          const { error: storageError } = await supabase.storage
            .from('works')
            .remove([image])
          
          if (storageError) {
            console.error('Error deleting work image:', storageError)
          }
        }
      }

      // Update the work status to deleted
      const { error } = await supabase
        .from('works')
        .update({ 
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', workId)

      if (error) throw error

      // Update local state
      setWorks(works.filter(work => work.id !== workId))
      toast.success('Work successfully deleted')
    } catch (error: any) {
      console.error('Error deleting work:', error)
      toast.error(error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Section */}
        <div className="glass-card rounded-xl p-8 mb-8">
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-3xl font-bold text-white">Artist Profile</h1>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEditProfile}
              className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-white"
            >
              Edit Profile
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
              <div className="space-y-4">
                <p className="text-gray-300"><span className="font-medium text-violet-400">Name:</span> {profile?.full_name}</p>
                <p className="text-gray-300"><span className="font-medium text-violet-400">Display Name:</span> {profile?.display_name}</p>
                <p className="text-gray-300"><span className="font-medium text-violet-400">Email:</span> {profile?.email}</p>
                <p className="text-gray-300"><span className="font-medium text-violet-400">Location:</span> {profile?.location}</p>
                <p className="text-gray-300"><span className="font-medium text-violet-400">Phone:</span> {profile?.phone_number}</p>
                <div className="text-gray-300">
                  <span className="font-medium text-violet-400">Bio:</span>
                  <p className="mt-1">{profile?.bio}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Professional Information</h2>
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-violet-400">Specialties:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {artistProfile?.specialty.map((specialty, index) => (
                      <span key={index} className="bg-violet-600/30 text-violet-200 px-3 py-1 rounded-full text-sm">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-violet-400">Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {artistProfile?.skills.map((skill, index) => (
                      <span key={index} className="bg-violet-600/30 text-violet-200 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-300">
                  <span className="font-medium text-violet-400">Hourly Rate:</span> ₹{artistProfile?.hourly_rate}/hr
                </p>
                <p className="text-gray-300">
                  <span className="font-medium text-violet-400">Experience:</span> {artistProfile?.years_of_experience} years
                </p>
                <p className="text-gray-300">
                  <span className="font-medium text-violet-400">Rating:</span> {artistProfile?.rating?.toFixed(1)} ({artistProfile?.total_reviews} reviews)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Works Section */}
        <div className="glass-card rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">My Works</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchWorks(user.id)}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
                title="Refresh works"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.button>
            </div>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddWork}
                className="glass-button px-6 py-3 rounded-lg text-sm font-medium text-white flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add New Work
              </motion.button>
            </div>
          </div>

          {/* Featured Works Section */}
          {works.some(work => work.is_featured) && (
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-white mb-6">Featured Works</h3>
              <FeaturedWorks works={works.filter(work => work.is_featured)} />
            </div>
          )}

          {/* Before/After Comparisons */}
          {works.some(work => work.before_image && work.after_image) && (
            <div className="mb-12">
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
            </div>
          )}

          {/* Video Works */}
          {works.some(work => work.video_url) && (
            <div className="mb-12">
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
            </div>
          )}

          {/* All Works Grid */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">All Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {works.map((work) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-lg overflow-hidden group relative"
                >
                  {work.images?.[0] && (
                    <div className="relative h-48">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${work.images[0]}`}
                        alt={work.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteWork(work.id)}
                          className="p-2 bg-red-600/80 hover:bg-red-500/80 rounded-lg text-white backdrop-blur-sm flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{work.title}</h3>
                      {work.is_featured && (
                        <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{work.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {work.tags.map((tag, index) => (
                        <span key={index} className="bg-violet-600/30 text-violet-200 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-violet-400 font-medium">₹{work.price}</span>
                      <span className="text-gray-400 text-sm">{work.category}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {works.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">You haven't added any works yet.</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddWork}
                className="mt-4 glass-button px-6 py-3 rounded-lg text-sm font-medium text-white"
              >
                Add Your First Work
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 