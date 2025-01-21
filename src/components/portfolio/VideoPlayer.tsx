'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'

type VideoPlayerProps = {
  videoUrl: string
  title: string
  thumbnail?: string
}

export default function VideoPlayer({ videoUrl, title, thumbnail }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <h3 className="text-lg font-semibold text-white p-4">{title}</h3>
      
      <div className="relative aspect-video">
        {/* Video Player */}
        <video
          ref={videoRef}
          className="w-full h-full"
          poster={thumbnail}
          onLoadedData={() => setIsLoading(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        )}

        {/* Play/Pause Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className={`absolute inset-0 flex items-center justify-center bg-black/30 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'} transition-opacity duration-300`}
        >
          {!isPlaying && (
            <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </motion.button>

        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white">
              {isPlaying ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            
            {/* Progress Bar */}
            <div className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-violet-500"
                style={{ 
                  width: `${videoRef.current ? (videoRef.current.currentTime / videoRef.current.duration) * 100 : 0}%` 
                }}
              />
            </div>

            {/* Duration */}
            <span className="text-white text-sm">
              {videoRef.current ? Math.floor(videoRef.current.duration) : 0}s
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 