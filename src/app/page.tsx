'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FiArrowRight, FiCheck, FiStar, FiTrendingUp, FiUsers, FiAward, FiClock, FiDollarSign, FiMail } from 'react-icons/fi'

export default function Home() {
  return (
    <div className="relative">
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
              <Link href="/browse-works" className="text-gray-300 hover:text-white transition-colors">Browse Works</Link>
              <Link href="/auth/signin" className="text-gray-300 hover:text-white transition-colors">Sign In</Link>
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                           hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all"
                >
                  Join as Artist
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
                <Link href="/browse-works">
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
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative px-6 py-3 rounded-xl text-gray-300 font-medium backdrop-blur-sm
                             bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    Contact Us
                    <FiMail className="w-4 h-4" />
                    <div className="absolute top-full mt-2 right-0 w-64 p-4 rounded-xl backdrop-blur-xl bg-white/10 border border-white/10 
                                  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="space-y-3 text-sm">
                        <a 
                          href="mailto:dbforuse@gmail.com"
                          className="block text-violet-400 hover:text-violet-300"
                        >
                          dbforuse@gmail.com
                        </a>
                        <a 
                          href="https://discord.gg/"
                          className="block text-violet-400 hover:text-violet-300"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Join our Discord
                        </a>
                      </div>
                    </div>
                  </motion.button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <h4 className="text-2xl font-bold text-white">500+</h4>
                  <p className="text-gray-400">Active Artists</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white">2k+</h4>
                  <p className="text-gray-400">Projects Done</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white">4.9</h4>
                  <p className="text-gray-400">Avg. Rating</p>
                </div>
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

      {/* Features Section */}
      <div className="bg-[#0f172a] py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 mb-4">
                Why Choose Editor's Hub?
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                We provide a seamless platform for connecting creative talent with clients worldwide.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FiUsers className="w-6 h-6" />,
                title: 'Verified Artists',
                description: 'Every artist is carefully vetted to ensure high-quality work and professionalism.',
                color: 'from-purple-400/10 to-indigo-400/10'
              },
              {
                icon: <FiClock className="w-6 h-6" />,
                title: 'Fast Delivery',
                description: 'Get your projects completed quickly with our efficient delivery system.',
                color: 'from-violet-400/10 to-fuchsia-400/10'
              },
              {
                icon: <FiAward className="w-6 h-6" />,
                title: 'Quality Guaranteed',
                description: 'We ensure the highest quality standards with our revision and feedback system.',
                color: 'from-indigo-400/10 to-cyan-400/10'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
                  <div className="text-white mb-4 p-3 rounded-xl bg-white/5 border border-white/10 w-fit">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-[#0f172a] py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Get your creative projects done in three simple steps
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: '01',
                title: 'Browse & Choose',
                description: 'Explore our diverse collection of artists and their portfolios to find the perfect match.',
                icon: <FiUsers className="w-6 h-6" />
              },
              {
                number: '02',
                title: 'Place Order',
                description: 'Submit your project details and requirements with our easy-to-use order system.',
                icon: <FiDollarSign className="w-6 h-6" />
              },
              {
                number: '03',
                title: 'Get Results',
                description: 'Receive your completed work and request revisions if needed.',
                icon: <FiCheck className="w-6 h-6" />
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur opacity-20"></div>
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                      {step.number}
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-violet-400/20 to-indigo-400/20"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 mb-6">{step.description}</p>
                  <div className="text-white p-3 rounded-xl bg-white/5 border border-white/10 w-fit">
                    {step.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-[#0f172a] py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 mb-4">
                Popular Categories
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Discover talented artists across various creative fields
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Video Editing', icon: '🎬' },
              { name: 'Photo Retouching', icon: '📸' },
              { name: 'Graphic Design', icon: '🎨' },
              { name: 'Logo Design', icon: '✒️' },
              { name: 'Animation', icon: '🎭' },
              { name: 'Illustration', icon: '🖌️' },
              { name: 'UI/UX Design', icon: '💻' },
              { name: 'Motion Graphics', icon: '✨' }
            ].map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-white font-medium">{category.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#0f172a] py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl" />
            <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 shadow-xl">
              <div className="max-w-3xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="space-y-8"
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                    Ready to Start Your Creative Journey?
                  </h2>
                  <p className="text-xl text-gray-300">
                    Join thousands of satisfied clients who have found their perfect creative partner.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/auth/signup">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white text-lg font-medium
                                 hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                      >
                        Get Started
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </Link>
                    <Link href="/browse-works">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-4 rounded-xl text-gray-300 text-lg font-medium backdrop-blur-sm
                                 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        Browse Works
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center mb-6">
                <Image
                  src="/logo.png"
                  alt="Editor's Hub Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <h3 className="ml-3 text-xl font-bold text-white">Editor's Hub</h3>
              </div>
              <p className="text-gray-400">
                Connecting creative talent with clients worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/browse-works" className="text-gray-400 hover:text-white transition-colors">Browse Works</Link></li>
                <li><Link href="/auth/signin" className="text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/auth/signup" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Categories</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Video Editing</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Photo Retouching</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Graphic Design</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Contact</h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="mailto:dbforuse@gmail.com" 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    dbforuse@gmail.com
                  </a>
                </li>
                <li>
                  <a 
                    href="https://discord.gg/" 
                    className="text-gray-400 hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join our Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-gray-400">© 2024 Editor's Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 