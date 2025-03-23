'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

type BeforeAfterComparisonProps = {
  beforeImage: string
  afterImage: string
  title: string
}

export default function BeforeAfterComparison({ beforeImage, afterImage, title }: BeforeAfterComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return

    const container = event.currentTarget.getBoundingClientRect()
    const position = 'touches' in event 
      ? event.touches[0].clientX - container.left 
      : event.clientX - container.left
    
    const newPosition = Math.max(0, Math.min(100, (position / container.width) * 100))
    setSliderPosition(newPosition)
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <h3 className="text-lg font-semibold text-white p-4">{title}</h3>
      
      <div 
        className="relative h-[400px] w-full cursor-ew-resize"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleMove}
      >
        {/* Before Image */}
        <div className="absolute inset-0">
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${beforeImage}`}
            alt="Before"
            fill
            className="object-cover"
          />
        </div>

        {/* After Image */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${afterImage}`}
            alt="After"
            fill
            className="object-cover"
          />
        </div>

        {/* Slider */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19l7-7-7-7" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/50 text-white text-sm rounded">
          Before
        </div>
        <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/50 text-white text-sm rounded">
          After
        </div>
      </div>
    </div>
  )
} 