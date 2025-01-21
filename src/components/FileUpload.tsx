'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'

export type FileUploadProps = {
  onUpload: (files: FileList | null) => void
  accept?: string
  multiple?: boolean
}

export default function FileUpload({ onUpload, accept, multiple = false }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-violet-500 transition-colors"
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={e => onUpload(e.target.files)}
        accept={accept}
        multiple={multiple}
      />
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="text-gray-400"
      >
        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-sm">
          {multiple ? 'Drop files here or click to select' : 'Drop a file here or click to select'}
        </p>
      </motion.div>
    </div>
  )
} 