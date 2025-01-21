'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="relative">
      {/* Navigation with Logo */}
      <nav className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/logo.png"
                alt="Editor's Hub Logo"
                width={50}
                height={50}
                className="rounded-full"
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="ml-4 text-2xl font-bold text-white"
            >
              Editor's Hub
            </motion.h1>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Welcome to Editor's Hub
              <span className="block text-violet-400">Your Creative Partner</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              Connect with talented artists for your creative projects. From video editing to graphic design, find the right artist for your needs.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/browse-works">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-button px-8 py-4 text-lg font-medium text-white rounded-lg w-full sm:w-auto"
                >
                  Browse Works
                </motion.button>
              </Link>
              <Link href="/auth/artist-signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 text-lg font-medium bg-gray-800/50 text-white rounded-lg hover:bg-gray-800 w-full sm:w-auto"
                >
                  Join as Artist
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our platform makes it easy to connect with talented artists and get your projects done.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Browse Portfolio',
                description: 'Explore diverse works from talented artists and find the perfect match for your project.',
                icon: '🎨'
              },
              {
                title: 'Place Order',
                description: 'Easily place orders with clear requirements and communicate directly with artists.',
                icon: '📝'
              },
              {
                title: 'Get Results',
                description: 'Receive high-quality work delivered on time, with revisions if needed.',
                icon: '✨'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 rounded-xl text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Popular Categories</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Find artists specializing in various creative fields
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              'Video Editing',
              'Photo Retouching',
              'Graphic Design',
              'Logo Design',
              'Animation',
              'Illustration',
              'UI/UX Design',
              'Motion Graphics'
            ].map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="glass-card p-6 rounded-xl text-center cursor-pointer"
              >
                <h3 className="text-white font-medium">{category}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Start Your Project?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied clients who have found their perfect creative partner.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-button px-8 py-4 text-lg font-medium text-white rounded-lg w-full sm:w-auto"
                >
                  Get Started
                </motion.button>
              </Link>
              <Link href="/browse-works">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 text-lg font-medium bg-gray-800/50 text-white rounded-lg hover:bg-gray-800 w-full sm:w-auto"
                >
                  Browse Works
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Developer Section */}
      <div className="bg-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card rounded-xl p-12"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">About the Developer</h2>
              <div className="w-24 h-1 bg-violet-500 mx-auto"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-white">Supriyam Kumar</h3>
                <p className="text-gray-300 leading-relaxed">
                  Hello! I'm Supriyam Kumar, a passionate game developer, Android app creator, and web developer with two years of hands-on experience in crafting engaging digital experiences. Currently a student in Class 12, I bring youthful energy and innovation to every project I undertake.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  With a strong foundation in Java and C#, I've developed and published multiple games that showcase my creativity and technical expertise. My deep interest in machine learning and space technology fuels my drive to stay ahead in the ever-evolving tech landscape.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  I believe in growing as a person each day, embracing challenges, and turning them into opportunities for learning and growth. My sensitivity to the concerns of those around me, combined with unwavering confidence and persistence, sets me apart as a developer and an individual.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  I'm committed to pushing the boundaries of what's possible, both in technology and in life, as I work toward creating impactful solutions for the future.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-6"
              >
                <div className="glass-card p-6 rounded-xl">
                  <h4 className="text-xl font-semibold text-white mb-4">Skills & Expertise</h4>
                  <div className="flex flex-wrap gap-3">
                    {['Game Development', 'Android Development', 'Web Development', 'Java', 'C#', 'Machine Learning', 'Space Technology'].map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-violet-900/50 rounded-full text-violet-200 text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="glass-card p-6 rounded-xl">
                  <h4 className="text-xl font-semibold text-white mb-4">Connect With Me</h4>
                  <div className="flex gap-4 justify-center">
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      href="https://github.com/SUP120"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-violet-900/50 rounded-full text-violet-200 hover:bg-violet-800/50"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      href="https://www.instagram.com/supriyam.kumar_?igsh=dHgxdHh3ZnB0eDQw"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-violet-900/50 rounded-full text-violet-200 hover:bg-violet-800/50"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                      </svg>
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      href="https://x.com/chuddybuddy77?t=3qsFqVFY7_96AFqpYkDvsQ&s=09"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-violet-900/50 rounded-full text-violet-200 hover:bg-violet-800/50"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      href="mailto:dbforuse1@gmail.com"
                      className="p-3 bg-violet-900/50 rounded-full text-violet-200 hover:bg-violet-800/50"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 