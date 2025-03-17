'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiMapPin, FiMessageCircle, FiSend } from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast.success('Message sent successfully! We will get back to you soon.')
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    })
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 md:py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 md:mb-4"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Have questions or feedback? We'd love to hear from you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-violet-600/30 rounded-full flex items-center justify-center mb-4 md:mb-6">
              <FiMail className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-violet-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 md:mb-4">Email Us</h3>
            <p className="text-gray-300 mb-1 md:mb-2 text-sm sm:text-base">
              <a href="mailto:support@artisthiring.com" className="hover:text-violet-400 transition-colors">
                support@artisthiring.com
              </a>
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              We typically respond within 24 hours
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-violet-600/30 rounded-full flex items-center justify-center mb-4 md:mb-6">
              <FiMessageCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-violet-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 md:mb-4">Discord Community</h3>
            <p className="text-gray-300 mb-1 md:mb-2 text-sm sm:text-base">
              <a href="https://discord.com/invite/YWFD72HV" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">
                Join our Discord
              </a>
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              Connect with our community and support team
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-center text-center sm:col-span-2 md:col-span-1"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-violet-600/30 rounded-full flex items-center justify-center mb-4 md:mb-6">
              <FiMapPin className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-violet-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 md:mb-4">Our Location</h3>
            <p className="text-gray-300 text-sm sm:text-base">
              Ranchi, Jharkhand, India
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="glass-card rounded-xl p-4 sm:p-6 md:p-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 md:mb-6 text-center">Send Us a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white text-sm sm:text-base"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white text-sm sm:text-base"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white text-sm sm:text-base"
                placeholder="How can we help you?"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white text-sm sm:text-base"
                placeholder="Tell us more about your inquiry..."
              ></textarea>
            </div>
            
            <div className="text-center pt-2">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg text-white font-medium hover:from-violet-700 hover:to-purple-700 transition-all inline-flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <FiSend className="ml-2" />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        <div className="mt-8 sm:mt-12 md:mt-16 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            By contacting us, you agree to our <a href="/privacy-policy" className="text-violet-400 hover:underline">Privacy Policy</a> and <a href="/terms-of-service" className="text-violet-400 hover:underline">Terms of Service</a>.
          </p>
        </div>
      </div>
    </div>
  )
} 