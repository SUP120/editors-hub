'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FiArrowRight, FiStar } from 'react-icons/fi'
import AuthRedirect from '@/components/AuthRedirect'
import { Toaster } from 'react-hot-toast'
import { Suspense } from 'react'

export default function Home() {
  return (
    <div className="relative">
      <Suspense>
        <AuthRedirect />
      </Suspense>
      <Toaster />
      {/* Navigation with Logo */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0f172a]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="/logo.png"
                  alt="Editor's Hub Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="ml-3 text-xl font-bold text-white"
              >
                Editor's Hub
              </motion.h1>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/browse" className="text-gray-300 hover:text-white transition-colors">Browse Works</Link>
              <Link href="/auth/signin">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                           hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all"
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h1 className="text-5xl md:text-6xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                  Transform
                </span>
                <br />
                Your Creative Vision
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Connect with talented artists who bring your ideas to life. From video editing to graphic design, find the perfect creative partner for your projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/browse">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                             hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    Explore Works
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 rounded-xl text-gray-300 font-medium backdrop-blur-sm
                             bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl"></div>
              <div className="relative">
                <Image
                  src="/hero-image.png"
                  alt="Creative Work"
                  width={600}
                  height={400}
                  className="rounded-3xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <FiStar className="w-5 h-5 text-yellow-300" />
                    <span className="text-white font-medium">Trusted by 10,000+ clients</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 