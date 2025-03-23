'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiMail, FiMapPin, FiMessageCircle } from 'react-icons/fi'

export default function AboutPage() {
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
            About Artist Hiring Platform
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Connecting talented artists with clients worldwide
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 md:mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 md:mb-6">Our Story</h2>
          <div className="text-gray-300 space-y-3 md:space-y-4 text-sm sm:text-base">
            <p>
              Founded on 6 June 2024, Artist Hiring Platform was born from a simple observation: talented artists often struggle to find consistent work, while clients seeking quality creative services don't know where to look.
            </p>
            <p>
              Our founder, a digital artist himself, experienced firsthand the challenges of building a sustainable creative career. After years of navigating freelance marketplaces that undervalued artistic work, he envisioned a platform specifically designed for artists - one that would respect their craft, protect their interests, and connect them with clients who truly value their skills.
            </p>
            <p>
              Today, Artist Hiring Platform has grown into a thriving community of artists and clients from around the world. We've facilitated thousands of successful projects across various artistic disciplines, from digital illustration to animation, graphic design, and more.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 md:mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 md:mb-6">Our Mission</h2>
          <div className="text-gray-300 space-y-3 md:space-y-4 text-sm sm:text-base">
            <p>
              At Artist Hiring Platform, our mission is to empower artists to thrive professionally while helping clients find the perfect creative talent for their projects.
            </p>
            <p>
              We believe in:
            </p>
            <ul className="list-disc pl-5 md:pl-6 space-y-1 md:space-y-2">
              <li><strong>Fair Compensation</strong> - Ensuring artists are paid what they're worth</li>
              <li><strong>Quality Connections</strong> - Matching clients with the right artistic talent</li>
              <li><strong>Transparent Processes</strong> - Clear communication and expectations for all parties</li>
              <li><strong>Creative Community</strong> - Building a supportive network for artists to grow</li>
              <li><strong>Artistic Integrity</strong> - Respecting the creative process and artistic vision</li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card rounded-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 md:mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 md:mb-6">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 md:mb-2">Browse Artists</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Explore our diverse community of talented artists and find the perfect match for your project needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 md:mb-2">Place an Order</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Submit your project requirements and communicate directly with the artist to ensure your vision is understood.
              </p>
            </div>
            <div className="text-center sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 md:mb-2">Receive Your Work</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Get your completed project delivered to you, with revisions if needed, until you're completely satisfied.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="glass-card rounded-xl p-4 sm:p-6 md:p-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 md:mb-6">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-gray-300 text-sm sm:text-base">
                Have questions or feedback? We'd love to hear from you. Reach out to our team through any of the following channels:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <FiMail className="text-violet-400 mt-1 mr-3" />
                  <div>
                    <h3 className="text-white font-medium">Email</h3>
                    <p className="text-gray-300 text-sm sm:text-base">support@artisthiring.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiMapPin className="text-violet-400 mt-1 mr-3" />
                  <div>
                    <h3 className="text-white font-medium">Address</h3>
                    <p className="text-gray-300 text-sm sm:text-base">Ranchi, Jharkhand, India</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiMessageCircle className="text-violet-400 mt-1 mr-3" />
                  <div>
                    <h3 className="text-white font-medium">Live Chat</h3>
                    <p className="text-gray-300 text-sm sm:text-base">Available Monday-Friday, 9am-5pm IST</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-6 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg text-white font-medium hover:from-violet-700 hover:to-purple-700 transition-all"
                >
                  Contact Us
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 