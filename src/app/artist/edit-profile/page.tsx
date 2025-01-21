'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

type ProfileFormData = {
  full_name: string
  display_name: string
  bio: string
  location: string
  phone_number: string
  specialty: string[]
  skills: string[]
  hourly_rate: number
  years_of_experience: number
  education: string[]
  certifications: string[]
  languages: string[]
  portfolio_urls: string[]
  availability_status: string
}

export default function EditProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    display_name: '',
    bio: '',
    location: '',
    phone_number: '',
    specialty: [],
    skills: [],
    hourly_rate: 0,
    years_of_experience: 0,
    education: [],
    certifications: [],
    languages: [],
    portfolio_urls: [],
    availability_status: 'available'
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch basic profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // Fetch artist profile
      const { data: artistData, error: artistError } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (artistError && artistError.code !== 'PGRST116') throw artistError

      // Combine the data
      setFormData({
        full_name: profileData.full_name || '',
        display_name: profileData.display_name || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        phone_number: profileData.phone_number || '',
        specialty: artistData?.specialty || [],
        skills: artistData?.skills || [],
        hourly_rate: artistData?.hourly_rate || 0,
        years_of_experience: artistData?.years_of_experience || 0,
        education: artistData?.education || [],
        certifications: artistData?.certifications || [],
        languages: artistData?.languages || [],
        portfolio_urls: artistData?.portfolio_urls || [],
        availability_status: artistData?.availability_status || 'available'
      })
    } catch (error: any) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update basic profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          display_name: formData.display_name,
          bio: formData.bio,
          location: formData.location,
          phone_number: formData.phone_number,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Update artist profile
      const { error: artistError } = await supabase
        .from('artist_profiles')
        .update({
          specialty: formData.specialty,
          skills: formData.skills,
          hourly_rate: formData.hourly_rate,
          years_of_experience: formData.years_of_experience,
          education: formData.education,
          certifications: formData.certifications,
          languages: formData.languages,
          portfolio_urls: formData.portfolio_urls,
          availability_status: formData.availability_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (artistError) throw artistError

      setMessage('Profile updated successfully!')
      setTimeout(() => router.push('/artist/dashboard'), 1500)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleArrayInput = (field: keyof ProfileFormData, value: string) => {
    if (!value.trim()) return
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()]
    }))
  }

  const removeArrayItem = (field: keyof ProfileFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-8"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Edit Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.display_name}
                  onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="input-field"
                  value={formData.phone_number}
                  onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4 pt-6">
              <h3 className="text-xl font-semibold text-white mb-4">Professional Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.hourly_rate}
                  onChange={e => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.years_of_experience}
                  onChange={e => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) })}
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Availability Status
                </label>
                <select
                  className="input-field"
                  value={formData.availability_status}
                  onChange={e => setFormData({ ...formData, availability_status: e.target.value })}
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="away">Away</option>
                </select>
              </div>
            </div>

            {/* Skills and Specialties */}
            <div className="space-y-4 pt-6">
              <h3 className="text-xl font-semibold text-white mb-4">Skills & Specialties</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Specialties
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.specialty.map((spec, index) => (
                    <span
                      key={index}
                      className="bg-violet-600/30 text-violet-200 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('specialty', index)}
                        className="ml-2 text-violet-300 hover:text-violet-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Add specialty (press Enter)"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      handleArrayInput('specialty', input.value)
                      input.value = ''
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-violet-600/30 text-violet-200 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('skills', index)}
                        className="ml-2 text-violet-300 hover:text-violet-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Add skill (press Enter)"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      handleArrayInput('skills', input.value)
                      input.value = ''
                    }
                  }}
                />
              </div>
            </div>

            {/* Education and Certifications */}
            <div className="space-y-4 pt-6">
              <h3 className="text-xl font-semibold text-white mb-4">Education & Certifications</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Education
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.education.map((edu, index) => (
                    <span
                      key={index}
                      className="bg-violet-600/30 text-violet-200 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {edu}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('education', index)}
                        className="ml-2 text-violet-300 hover:text-violet-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Add education (press Enter)"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      handleArrayInput('education', input.value)
                      input.value = ''
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Certifications
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="bg-violet-600/30 text-violet-200 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {cert}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('certifications', index)}
                        className="ml-2 text-violet-300 hover:text-violet-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Add certification (press Enter)"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      handleArrayInput('certifications', input.value)
                      input.value = ''
                    }
                  }}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4 pt-6">
              <h3 className="text-xl font-semibold text-white mb-4">Additional Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Languages
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="bg-violet-600/30 text-violet-200 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {lang}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('languages', index)}
                        className="ml-2 text-violet-300 hover:text-violet-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Add language (press Enter)"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      handleArrayInput('languages', input.value)
                      input.value = ''
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Portfolio URLs
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.portfolio_urls.map((url, index) => (
                    <span
                      key={index}
                      className="bg-violet-600/30 text-violet-200 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {url}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('portfolio_urls', index)}
                        className="ml-2 text-violet-300 hover:text-violet-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="url"
                  className="input-field"
                  placeholder="Add portfolio URL (press Enter)"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      handleArrayInput('portfolio_urls', input.value)
                      input.value = ''
                    }
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-center mt-4">
                {error}
              </div>
            )}

            {message && (
              <div className="text-green-500 text-center mt-4">
                {message}
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => router.push('/artist/dashboard')}
                className="px-6 py-2 text-white rounded-lg bg-gray-600 hover:bg-gray-500"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={saving}
                className="glass-button px-6 py-2 text-white rounded-lg disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
} 