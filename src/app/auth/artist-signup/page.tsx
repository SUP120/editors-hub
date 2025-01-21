'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type ArtistSignupForm = {
  email: string
  password: string
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

export default function ArtistSignup() {
  const [formData, setFormData] = useState<ArtistSignupForm>({
    email: '',
    password: '',
    fullName: '',
    displayName: '',
    bio: '',
    location: '',
    phoneNumber: '',
    avatar: null,
    specialties: [],
    skills: [],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Sign up with Supabase directly
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError
      
      if (authData.user) {
        // Upload avatar if exists
        let avatarUrl = ''
        if (formData.avatar) {
          const { data: avatarData, error: avatarError } = await supabase.storage
            .from('avatars')
            .upload(`${authData.user.id}/${formData.avatar.name}`, formData.avatar)
          
          if (avatarError) throw avatarError
          avatarUrl = avatarData.path
        }

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            display_name: formData.displayName,
            avatar_url: avatarUrl,
            bio: formData.bio,
            location: formData.location,
            phone_number: formData.phoneNumber,
            is_artist: true
          }])
        
        if (profileError) throw profileError

        // Create artist profile
        const { error: artistError } = await supabase
          .from('artist_profiles')
          .insert([{
            id: authData.user.id,
            specialty: formData.specialties,
            skills: formData.skills,
            hourly_rate: parseFloat(formData.hourlyRate),
            portfolio_urls: formData.portfolioUrls.filter(url => url),
            years_of_experience: parseInt(formData.yearsOfExperience),
            education: formData.education.filter(edu => edu),
            certifications: formData.certifications.filter(cert => cert),
            languages: formData.languages.filter(lang => lang),
            social_links: formData.socialLinks
          }])
        
        if (artistError) throw artistError

        // Show success message and redirect
        alert('Account created successfully! Please check your email to verify your account.')
        router.push('/auth/signin')
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      setError(error.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Create Your Artist Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-violet-300">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  minLength={6}
                  className="input-field"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
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
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full glass-button py-3 text-white font-medium rounded-lg disabled:opacity-50"
              >
                {isLoading ? 'Creating Profile...' : 'Create Profile'}
              </button>
            </div>

            {error && (
              <div className="text-red-500 text-center">
                {error}
              </div>
            )}

            <div className="text-center text-sm">
              <Link href="/auth/signin" className="text-violet-400 hover:text-violet-300">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 