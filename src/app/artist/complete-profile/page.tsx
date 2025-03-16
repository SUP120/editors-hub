'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type ArtistProfileForm = {
  fullName: string
  displayName: string
  bio: string
  location: string
  phoneNumber: string
  avatar: File | null
  specialties: string[]
  skills: string[]
  hourlyRate: string
  yearsOfExperience: string
  education: string[]
  certifications: string[]
  languages: string[]
  portfolioUrls: string[]
  socialLinks: {
    website?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
}

export default function CompleteArtistProfile() {
  const [formData, setFormData] = useState<ArtistProfileForm>({
    fullName: '',
    displayName: '',
    bio: '',
    location: '',
    phoneNumber: '',
    avatar: null,
    specialties: [''],
    skills: [''],
    hourlyRate: '',
    yearsOfExperience: '',
    education: [''],
    certifications: [''],
    languages: [''],
    portfolioUrls: [''],
    socialLinks: {}
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/signin')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload avatar if exists
      let avatarUrl = ''
      if (formData.avatar) {
        const { data: avatarData, error: avatarError } = await supabase.storage
          .from('avatars')
          .upload(`${user.id}/${formData.avatar.name}`, formData.avatar)
        
        if (avatarError) throw avatarError
        avatarUrl = avatarData.path
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          display_name: formData.displayName,
          avatar_url: avatarUrl || null,
          bio: formData.bio,
          location: formData.location,
          phone_number: formData.phoneNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (profileError) throw profileError

      // Update or create artist profile
      const { error: artistError } = await supabase
        .from('artist_profiles')
        .upsert([{
          id: user.id,
          specialty: formData.specialties.filter(s => s),
          skills: formData.skills.filter(s => s),
          hourly_rate: parseFloat(formData.hourlyRate) || 0,
          portfolio_urls: formData.portfolioUrls.filter(url => url),
          years_of_experience: parseInt(formData.yearsOfExperience) || 0,
          education: formData.education.filter(edu => edu),
          certifications: formData.certifications.filter(cert => cert),
          languages: formData.languages.filter(lang => lang),
          social_links: formData.socialLinks,
          updated_at: new Date().toISOString()
        }])

      if (artistError) throw artistError

      router.push('/artist/dashboard')
    } catch (error: any) {
      console.error('Profile update error:', error)
      setError(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleArrayInput = (field: keyof ArtistProfileForm, index: number, value: string) => {
    const newArray = [...(formData[field] as string[])]
    newArray[index] = value
    setFormData({ ...formData, [field]: newArray })
  }

  const addArrayField = (field: keyof ArtistProfileForm) => {
    setFormData({
      ...formData,
      [field]: [...(formData[field] as string[]), '']
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Complete Your Artist Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-violet-300">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  className="input-field"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Display Name"
                  required
                  className="input-field"
                  value={formData.displayName}
                  onChange={e => setFormData({...formData, displayName: e.target.value})}
                />
              </div>
              <textarea
                placeholder="Bio"
                required
                className="input-field"
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Location"
                  required
                  className="input-field"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  className="input-field"
                  value={formData.phoneNumber}
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-violet-300">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Hourly Rate ($)"
                  required
                  min="0"
                  className="input-field"
                  value={formData.hourlyRate}
                  onChange={e => setFormData({...formData, hourlyRate: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Years of Experience"
                  required
                  min="0"
                  className="input-field"
                  value={formData.yearsOfExperience}
                  onChange={e => setFormData({...formData, yearsOfExperience: e.target.value})}
                />
              </div>

              {/* Specialties */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Specialties</label>
                {formData.specialties.map((specialty, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder="e.g., Video Editing, Photo Retouching"
                    className="input-field"
                    value={specialty}
                    onChange={e => handleArrayInput('specialties', index, e.target.value)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('specialties')}
                  className="text-violet-400 text-sm hover:text-violet-300"
                >
                  + Add Specialty
                </button>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Skills</label>
                {formData.skills.map((skill, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder="e.g., Adobe Premiere, Photoshop"
                    className="input-field"
                    value={skill}
                    onChange={e => handleArrayInput('skills', index, e.target.value)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('skills')}
                  className="text-violet-400 text-sm hover:text-violet-300"
                >
                  + Add Skill
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full glass-button py-3 text-white font-medium rounded-lg disabled:opacity-50"
              >
                {isLoading ? 'Saving Profile...' : 'Complete Profile'}
              </button>
            </div>

            {error && (
              <div className="text-red-500 text-center">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
} 