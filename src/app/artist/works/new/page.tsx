'use client'

import React, { useState, useEffect } from 'react'
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
  const [numBackgroundElements, setNumBackgroundElements] = useState(8)
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

  useEffect(() => {
    const updateBackgroundElements = () => {
      setNumBackgroundElements(window.innerWidth > 768 ? 15 : 8)
    }

    updateBackgroundElements()
    window.addEventListener('resize', updateBackgroundElements)

    return () => window.removeEventListener('resize', updateBackgroundElements)
  }, [])

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-violet-900 py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements - reduce on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(numBackgroundElements)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/5 rounded-full"
            style={{
              width: Math.random() * (numBackgroundElements > 8 ? 300 : 150) + 50,
              height: Math.random() * (numBackgroundElements > 8 ? 300 : 150) + 50,
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

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 md:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 mb-2 sm:mb-4">
            Create New Work
          </h1>
          <p className="text-blue-200 text-sm sm:text-base max-w-2xl mx-auto">
            Showcase your skills and attract clients by adding your best work
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card backdrop-blur-sm rounded-xl p-4 sm:p-6 md:p-8 border border-violet-500/20"
        >
          {/* Progress Steps */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                      currentStep === step
                        ? 'bg-violet-600 text-white'
                        : currentStep > step
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {currentStep > step ? '✓' : step}
                  </div>
                  <span className="mt-2 text-xs sm:text-sm text-gray-300">
                    {step === 1 ? 'Basic Info' : step === 2 ? 'Details' : 'Media'}
                  </span>
                </div>
              ))}
              <div className="absolute left-0 right-0 flex justify-center -z-10">
                <div className="w-2/3 h-0.5 bg-gray-700 absolute top-4 sm:top-5" />
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 sm:space-y-6"
              >
                <div>
                  <label htmlFor="title" className="block text-sm sm:text-base font-medium text-blue-200 mb-1 sm:mb-2">
                    Work Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-violet-700/50 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter a catchy title for your work"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm sm:text-base font-medium text-blue-200 mb-1 sm:mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-violet-700/50 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="Describe your work in detail"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm sm:text-base font-medium text-blue-200 mb-1 sm:mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-violet-700/50 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subcategory" className="block text-sm sm:text-base font-medium text-blue-200 mb-1 sm:mb-2">
                      Subcategory
                    </label>
                    <select
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-violet-700/50 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      disabled={!formData.category}
                      required
                    >
                      <option value="">Select a subcategory</option>
                      {formData.category &&
                        subcategories[formData.category as keyof typeof subcategories].map((subcat) => (
                          <option key={subcat} value={subcat}>
                            {subcat}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 sm:pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium"
                  >
                    Next Step
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Pricing and Delivery */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm sm:text-base font-medium text-blue-200 mb-1 sm:mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-violet-700/50 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      placeholder="Enter your price"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="deliveryTime" className="block text-sm sm:text-base font-medium text-blue-200 mb-1 sm:mb-2">
                      Delivery Time (days)
                    </label>
                    <input
                      type="number"
                      id="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-violet-700/50 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      placeholder="Number of days"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="revisions" className="block text-sm sm:text-base font-medium text-blue-200 mb-1 sm:mb-2">
                    Number of Revisions
                  </label>
                  <select
                    id="revisions"
                    value={formData.revisions}
                    onChange={(e) => setFormData({ ...formData, revisions: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-violet-700/50 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    required
                  >
                    <option value="1">1 revision</option>
                    <option value="2">2 revisions</option>
                    <option value="3">3 revisions</option>
                    <option value="unlimited">Unlimited revisions</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="requirements" className="block text-sm sm:text-base font-medium text-blue-200 mb-1 sm:mb-2">
                    Requirements from Client
                  </label>
                  <textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-violet-700/50 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="What do you need from clients to start working?"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-medium text-blue-200 mb-1 sm:mb-2">
                    Software Used
                  </label>
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-3">
                    {formData.software.map((sw) => (
                      <span
                        key={sw}
                        className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-violet-500/20 text-violet-300 rounded-full text-xs sm:text-sm"
                      >
                        {sw}
                        <button
                          type="button"
                          onClick={() => toggleSoftware(sw)}
                          className="text-violet-300 hover:text-violet-100"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {popularSoftware
                      .filter((sw) => !formData.software.includes(sw))
                      .map((sw) => (
                        <button
                          key={sw}
                          type="button"
                          onClick={() => toggleSoftware(sw)}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-full text-xs sm:text-sm transition-colors duration-200"
                        >
                          {sw}
                        </button>
                      ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4 sm:pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium"
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium"
                  >
                    Next Step
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Images and Tags */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 sm:space-y-6"
              >
                <div>
                  <label className="block text-sm sm:text-base font-medium text-blue-200 mb-1 sm:mb-2">
                    Thumbnail Image
                  </label>
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-4 sm:p-6">
                    {formData.thumbnailImage ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(formData.thumbnailImage)}
                          alt="Thumbnail preview"
                          className="max-h-40 sm:max-h-48 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, thumbnailImage: null })}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg
                          className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-500"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex flex-col sm:flex-row items-center justify-center text-sm sm:text-base text-gray-400">
                          <label
                            htmlFor="thumbnail-upload"
                            className="relative cursor-pointer rounded-md font-medium text-violet-400 hover:text-violet-300"
                          >
                            <span>Upload a file</span>
                            <input
                              id="thumbnail-upload"
                              name="thumbnail-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'thumbnail')}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-medium text-blue-200 mb-1 sm:mb-2">
                    Portfolio Images
                  </label>
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-4 sm:p-6">
                    {formData.portfolioImages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 w-full">
                        {formData.portfolioImages.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Portfolio image ${index + 1}`}
                              className="h-24 sm:h-32 w-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = [...formData.portfolioImages]
                                newImages.splice(index, 1)
                                setFormData({ ...formData, portfolioImages: newImages })
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {formData.portfolioImages.length < 5 && (
                          <label
                            htmlFor="portfolio-upload"
                            className="h-24 sm:h-32 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-violet-500/50 transition-colors"
                          >
                            <div className="text-center">
                              <svg
                                className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-500"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              <span className="mt-1 block text-xs sm:text-sm text-gray-400">Add more</span>
                            </div>
                            <input
                              id="portfolio-upload"
                              name="portfolio-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'portfolio')}
                            />
                          </label>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg
                          className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-500"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex flex-col sm:flex-row items-center justify-center text-sm sm:text-base text-gray-400">
                          <label
                            htmlFor="portfolio-upload"
                            className="relative cursor-pointer rounded-md font-medium text-violet-400 hover:text-violet-300"
                          >
                            <span>Upload files</span>
                            <input
                              id="portfolio-upload"
                              name="portfolio-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'portfolio')}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">PNG, JPG, GIF up to 5MB each (max 5 images)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-medium text-blue-200 mb-1 sm:mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-3">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-violet-500/20 text-violet-300 rounded-full text-xs sm:text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-violet-300 hover:text-violet-100"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      id="tag-input"
                      placeholder="Add a tag and press Enter"
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-violet-700/50 rounded-l-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                      onKeyDown={(e) => {
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
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('tag-input') as HTMLInputElement
                        if (input.value.trim()) {
                          addTag(input.value.trim())
                          input.value = ''
                        }
                      }}
                      className="px-3 sm:px-4 py-2 sm:py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-r-lg transition-colors duration-200 text-xs sm:text-sm"
                    >
                      Add
                    </button>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-gray-400">
                    Popular tags: design, editing, retouching, color grading, animation
                  </p>
                </div>

                <div className="flex justify-between pt-4 sm:pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium"
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Create Work</span>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  )
} 