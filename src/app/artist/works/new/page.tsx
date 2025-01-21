'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

type WorkForm = {
  title: string
  description: string
  category: string
  subcategory: string
  price: string
  deliveryTime: string
  revisions: string
  requirements: string
  thumbnailImage: File | null
  portfolioImages: File[]
  tags: string[]
  software: string[]
}

const categories = [
  { value: 'video_editing', label: 'Video Editing' },
  { value: 'photo_editing', label: 'Photo Editing' },
  { value: 'thumbnail_design', label: 'Thumbnail Design' },
  { value: 'color_grading', label: 'Color Grading' },
]

const subcategories = {
  video_editing: [
    'YouTube Videos',
    'Social Media Content',
    'Wedding Videos',
    'Music Videos',
    'Corporate Videos',
    'Gaming Videos',
  ],
  photo_editing: [
    'Portrait Retouching',
    'Product Photography',
    'Real Estate Photos',
    'Fashion Photography',
    'Event Photography',
  ],
  thumbnail_design: [
    'YouTube Thumbnails',
    'Social Media Posts',
    'Blog Headers',
    'Podcast Covers',
  ],
  color_grading: [
    'Film Color Grading',
    'Video Color Correction',
    'Photo Color Enhancement',
    'LUT Creation',
  ],
}

const popularSoftware = [
  'Adobe Premiere Pro',
  'Adobe After Effects',
  'Adobe Photoshop',
  'Adobe Lightroom',
  'DaVinci Resolve',
  'Final Cut Pro',
  'Capture One',
]

export default function NewWork() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<WorkForm>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    deliveryTime: '',
    revisions: '2',
    requirements: '',
    thumbnailImage: null,
    portfolioImages: [],
    tags: [],
    software: []
  })

  const handleImageUpload = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from('works')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    return filePath
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    setIsLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if user has a profile and is an artist
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        throw new Error('Please complete your profile first')
      }

      if (!profile.is_artist) {
        throw new Error('Only artists can create works')
      }

      // Upload thumbnail
      let thumbnailUrl = ''
      if (formData.thumbnailImage) {
        thumbnailUrl = await handleImageUpload(formData.thumbnailImage, 'thumbnails')
      }

      // Upload portfolio images
      const portfolioUrls = await Promise.all(
        formData.portfolioImages.map(file => handleImageUpload(file, 'portfolio'))
      )

      // Create work entry
      const { error: workError } = await supabase
        .from('works')
        .insert({
          artist_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          subcategory: formData.subcategory,
          price: parseFloat(formData.price),
          delivery_time: parseInt(formData.deliveryTime),
          revisions_included: parseInt(formData.revisions),
          requirements: formData.requirements,
          images: [thumbnailUrl, ...portfolioUrls],
          tags: [...formData.tags, ...formData.software],
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (workError) throw workError

      router.push('/artist/dashboard')
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message || 'Failed to create work')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'portfolio') => {
    const files = e.target.files
    if (!files) return

    if (type === 'thumbnail') {
      setFormData(prev => ({
        ...prev,
        thumbnailImage: files[0]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        portfolioImages: [...Array.from(files)]
      }))
    }
  }

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const toggleSoftware = (software: string) => {
    if (formData.software.includes(software)) {
      setFormData(prev => ({
        ...prev,
        software: prev.software.filter(s => s !== software)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        software: [...prev.software, software]
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-8"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Add New Work
          </h2>

          <div className="mb-8 flex justify-center">
            <div className="flex items-center">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step === currentStep
                        ? 'bg-violet-600 text-white'
                        : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {step < currentStep ? '✓' : step}
                  </motion.div>
                  {step < 3 && (
                    <div
                      className={`w-16 h-1 ${
                        step < currentStep ? 'bg-green-500' : 'bg-gray-700'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Professional Video Editing for YouTube"
                    className="input-field"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subcategory
                    </label>
                    <select
                      required
                      className="input-field"
                      value={formData.subcategory}
                      onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories[formData.category as keyof typeof subcategories]?.map(sub => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your service in detail..."
                    className="input-field"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g., 50"
                      className="input-field"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Delivery Time (days)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g., 3"
                      className="input-field"
                      value={formData.deliveryTime}
                      onChange={e => setFormData({ ...formData, deliveryTime: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Revisions
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g., 2"
                    className="input-field"
                    value={formData.revisions}
                    onChange={e => setFormData({ ...formData, revisions: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Requirements from Client
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="What do you need from the client to start working?"
                    className="input-field"
                    value={formData.requirements}
                    onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Software Used
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {popularSoftware.map(software => (
                      <motion.button
                        key={software}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleSoftware(software)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          formData.software.includes(software)
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {software}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thumbnail Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={e => handleFileChange(e, 'thumbnail')}
                    className="input-field"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    This will be the main image shown in search results
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Portfolio Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    required
                    onChange={e => handleFileChange(e, 'portfolio')}
                    className="input-field"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Upload examples of your work (up to 5 images)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <motion.span
                        key={tag}
                        whileHover={{ scale: 1.05 }}
                        className="bg-violet-600/30 text-violet-200 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-violet-300 hover:text-violet-100"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add tags (press Enter)"
                    className="input-field"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.target as HTMLInputElement
                        if (input.value.trim()) {
                          addTag(input.value.trim())
                          input.value = ''
                        }
                      }
                    }}
                  />
                </div>
              </motion.div>
            )}

            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="glass-button px-6 py-2 text-white rounded-lg"
                >
                  Previous
                </motion.button>
              )}
              
              {currentStep < 3 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="glass-button px-6 py-2 text-white rounded-lg ml-auto"
                >
                  Next
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading}
                  className="glass-button px-6 py-2 text-white rounded-lg ml-auto disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Work'}
                </motion.button>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-center mt-4">
                {error}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  )
} 