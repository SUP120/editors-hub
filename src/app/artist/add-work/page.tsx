'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/contexts/UserContext'

const AddWorkPage: React.FC = () => {
  const router = useRouter()
  const user = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [tags, setTags] = useState('')
  const [requirements, setRequirements] = useState('')
  const [revisions, setRevisions] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Upload images first
      const imageUrls = await Promise.all(
        selectedFiles.map(async (file) => {
          const { data, error } = await supabase.storage
            .from('works')
            .upload(`${Date.now()}-${file.name}`, file)
          
          if (error) throw error
          return data.path
        })
      )

      // Create work record
      const { data: work, error: workError } = await supabase
        .from('works')
        .insert([
          {
            title,
            description,
            price: Number(price),
            delivery_time: Number(deliveryTime),
            category,
            subcategory,
            images: imageUrls,
            tags,
            artist_id: user?.id,
            requirements,
            revisions: Number(revisions)
          }
        ])
        .select()
        .single()

      if (workError) throw workError

      toast.success('Work added successfully!')
      router.push('/artist/profile')
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Render your form here */}
    </div>
  )
}

export default AddWorkPage 