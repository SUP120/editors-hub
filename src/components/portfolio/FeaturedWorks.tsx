'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Work } from '@/types'
import BeforeAfterComparison from './BeforeAfterComparison'
import VideoPlayer from './VideoPlayer'

type FeaturedWorksProps = {
  works: Work[]
}

export default function FeaturedWorks({ works }: FeaturedWorksProps) {
  const [selectedWork, setSelectedWork] = useState<Work | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const sortedWorks = [...works].sort((a, b) => a.sort_order - b.sort_order)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? works.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === works.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-8">
      {/* Featured Works Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedWorks.map((work) => (
          <motion.div
            key={work.id}
            layoutId={work.id}
            onClick={() => setSelectedWork(work)}
            className="glass-card rounded-xl overflow-hidden cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative aspect-video">
              {work.video_url ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              ) : work.before_image && work.after_image ? (
                <div className="relative h-full">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${work.after_image}`}
                    alt={work.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:opacity-0 transition-opacity" />
                </div>
              ) : work.images[0] ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${work.images[0]}`}
                  alt={work.title}
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2">{work.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-2">{work.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedWork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <motion.div
              layoutId={selectedWork.id}
              className="max-w-4xl w-full bg-gray-900 rounded-xl overflow-hidden"
            >
              <div className="p-4 flex justify-between items-center border-b border-gray-800">
                <h2 className="text-xl font-semibold text-white">{selectedWork.title}</h2>
                <button
                  onClick={() => setSelectedWork(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4">
                {selectedWork.video_url ? (
                  <VideoPlayer
                    videoUrl={selectedWork.video_url}
                    title={selectedWork.title}
                    thumbnail={selectedWork.images[0] ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${selectedWork.images[0]}` : undefined}
                  />
                ) : selectedWork.before_image && selectedWork.after_image ? (
                  <BeforeAfterComparison
                    beforeImage={selectedWork.before_image}
                    afterImage={selectedWork.after_image}
                    title={selectedWork.title}
                  />
                ) : selectedWork.images[0] ? (
                  <div className="relative aspect-video">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${selectedWork.images[0]}`}
                      alt={selectedWork.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ) : null}

                <div className="mt-4">
                  <p className="text-gray-300">{selectedWork.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedWork.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-violet-600/30 text-violet-200 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 