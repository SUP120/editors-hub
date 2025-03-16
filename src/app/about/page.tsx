'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiMail, FiMapPin, FiMessageCircle } from 'react-icons/fi'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            About Artist Hiring Platform
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Connecting talented artists with clients worldwide
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Our Story</h2>
          <div className="text-gray-300 space-y-4">
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
          className="glass-card rounded-xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Our Mission</h2>
          <div className="text-gray-300 space-y-4">
            <p>
              At Artist Hiring Platform, our mission is to empower artists to thrive professionally while helping clients find the perfect creative talent for their projects.
            </p>
            <p>
              We believe in:
            </p>
            <ul className="list-disc pl-6 space-y-2">
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
          className="glass-card rounded-xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Browse Artists</h3>
              <p className="text-gray-300">
                Explore our diverse community of talented artists and find the perfect match for your project needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Place an Order</h3>
              <p className="text-gray-300">
                Submit your project requirements and communicate directly with the artist to ensure your vision is understood.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Receive Quality Work</h3>
              <p className="text-gray-300">
                Get your completed project delivered on time, with revisions if needed, and only release payment when satisfied.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="glass-card rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-violet-600/30 rounded-full flex items-center justify-center mb-4">
                <FiMail className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
              <p className="text-gray-300">
                <a href="mailto:support@artisthiring.com" className="hover:text-violet-400 transition-colors">
                  support@artisthiring.com
                </a>
              </p>
              <p className="text-gray-400 text-sm mt-1">
                We typically respond within 24 hours
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-violet-600/30 rounded-full flex items-center justify-center mb-4">
                <FiMessageCircle className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Discord Community</h3>
              <p className="text-gray-300">
                <a href="https://discord.com/invite/YWFD72HV" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">
                  Join our Discord
                </a>
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Connect with our community and support team
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-violet-600/30 rounded-full flex items-center justify-center mb-4">
                <FiMapPin className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Address</h3>
              <p className="text-gray-300">
                123 Creative Avenue<br />
                Ranchi, Jharkhand<br />
                India
              </p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
              >
                Get in Touch
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 