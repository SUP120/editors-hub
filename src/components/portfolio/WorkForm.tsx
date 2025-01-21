'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type { Work } from '@/types'
import FileUpload from '@/components/FileUpload'

type WorkFormProps = {
  initialData?: Partial<Work>
  onSubmit: (data: Partial<Work>) => Promise<void>
  onCancel: () => void
}

export default function WorkForm({ initialData, onSubmit, onCancel }: WorkFormProps) {
  const [formData, setFormData] = useState<Partial<Work>>({
    title: '',
    description: '',
    price: 0,
    category: '',
    subcategory: '',
    images: [],
    tags: [],
    is_featured: false,
    video_url: '',
    before_image: '',
    after_image: '',
    sort_order: 0,
    delivery_time: 1,
    ...initialData
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting work:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (files: FileList | null, type: 'images' | 'before' | 'after') => {
    if (!files?.length) return

    try {
      const file = files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('works')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      if (type === 'images') {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), filePath]
        }))
      } else if (type === 'before') {
        setFormData(prev => ({ ...prev, before_image: filePath }))
      } else if (type === 'after') {
        setFormData(prev => ({ ...prev, after_image: filePath }))
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }

  const removeImage = async (index: number) => {
    try {
      const imageToRemove = formData.images?.[index]
      if (imageToRemove) {
        const { error } = await supabase.storage
          .from('works')
          .remove([imageToRemove])

        if (error) throw error

        setFormData(prev => ({
          ...prev,
          images: prev.images?.filter((_, i) => i !== index)
        }))
      }
    } catch (error) {
      console.error('Error removing image:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const input = e.target as HTMLInputElement
      const value = input.value.trim()
      
      if (value && !formData.tags?.includes(value)) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), value]
        }))
      }
      input.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 h-32"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price (₹)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Delivery Time (days)
            </label>
            <input
              type="number"
              value={formData.delivery_time}
              onChange={e => setFormData(prev => ({ ...prev, delivery_time: Number(e.target.value) }))}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2"
              min="1"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subcategory
            </label>
            <input
              type="text"
              value={formData.subcategory}
              onChange={e => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2"
              required
            />
          </div>
        </div>
      </div>

      {/* Featured Work Settings */}
      <div className="glass-card p-6 rounded-xl space-y-4">
        <h3 className="text-lg font-semibold text-violet-400">Portfolio Settings</h3>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_featured"
            checked={formData.is_featured}
            onChange={e => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
            className="w-4 h-4 text-violet-600 bg-gray-800 border-gray-600 rounded focus:ring-violet-500"
          />
          <label htmlFor="is_featured" className="ml-2 text-sm font-medium text-gray-300">
            Feature this work in my portfolio
          </label>
        </div>

        {formData.is_featured && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sort Order (lower numbers appear first)
            </label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={e => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2"
              min="0"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Video URL (optional)
          </label>
          <input
            type="url"
            value={formData.video_url}
            onChange={e => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2"
          />
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="glass-card p-6 rounded-xl space-y-4">
        <h3 className="text-lg font-semibold text-violet-400">Images</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Work Images
          </label>
          <FileUpload
            onUpload={files => handleImageUpload(files, 'images')}
            accept="image/*"
            multiple
          />
          {formData.images && formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${image}`}
                    alt={`Work image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Before Image (optional)
            </label>
            <FileUpload
              onUpload={files => handleImageUpload(files, 'before')}
              accept="image/*"
            />
            {formData.before_image && (
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${formData.before_image}`}
                alt="Before"
                className="mt-2 w-full h-48 object-cover rounded-lg"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              After Image (optional)
            </label>
            <FileUpload
              onUpload={files => handleImageUpload(files, 'after')}
              accept="image/*"
            />
            {formData.after_image && (
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${formData.after_image}`}
                alt="After"
                className="mt-2 w-full h-48 object-cover rounded-lg"
              />
            )}
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="glass-card p-6 rounded-xl space-y-4">
        <h3 className="text-lg font-semibold text-violet-400">Tags</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Add Tags (press Enter to add)
          </label>
          <input
            type="text"
            onKeyDown={handleTagInput}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2"
            placeholder="Type and press Enter to add tags"
          />
          {formData.tags && formData.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-violet-600/30 text-violet-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      tags: prev.tags?.filter((_, i) => i !== index)
                    }))}
                    className="text-violet-300 hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`glass-button px-6 py-2 rounded-lg text-sm font-medium text-white ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Saving...' : 'Save Work'}
        </motion.button>
      </div>
    </form>
  )
} 