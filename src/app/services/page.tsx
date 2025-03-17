'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiCheck, FiArrowRight, FiStar, FiUsers, FiDollarSign, FiClock } from 'react-icons/fi'

export default function ServicesPage() {
  const platformFeatures = [
    {
      icon: <FiUsers className="w-6 h-6 text-purple-400" />,
      title: "For Artists",
      description: "Join our platform and showcase your creative talents to clients worldwide.",
      benefits: [
        "Complete creative freedom in your work",
        "Set your own pricing and availability",
        "Transparent payment system with secure transactions",
        "Build your portfolio and client base",
        "Access to a global marketplace of clients",
        "No monthly subscription fees - pay only when you earn"
      ]
    },
    {
      icon: <FiStar className="w-6 h-6 text-indigo-400" />,
      title: "For Clients",
      description: "Find the perfect creative professional for your project needs.",
      benefits: [
        "Access to a diverse pool of talented artists",
        "Secure payment protection",
        "Clear communication channels",
        "Transparent pricing with no hidden fees",
        "Quality assurance and dispute resolution",
        "Revision options to ensure satisfaction"
      ]
    }
  ]

  const platformFees = [
    {
      title: "Standard Plan",
      description: "Our basic platform fee structure for all users",
      fee: "10% Platform Fee",
      popular: true,
      features: [
        "10% commission on completed projects",
        "Secure payment processing",
        "Client-artist messaging system",
        "Portfolio showcase",
        "Review and rating system",
        "Basic support"
      ]
    },
    {
      title: "Pro Artist Plan",
      description: "For established artists with consistent work",
      fee: "8% Platform Fee",
      requirements: "Complete 20+ orders with 4.5+ rating",
      features: [
        "Reduced 8% commission on completed projects",
        "Priority placement in search results",
        "Featured artist opportunities",
        "Dedicated support channel",
        "Early access to new features",
        "Custom profile customization options"
      ]
    },
    {
      title: "Enterprise Plan",
      description: "For businesses with ongoing creative needs",
      fee: "Custom Pricing",
      features: [
        "Volume-based discounted platform fees",
        "Dedicated account manager",
        "Custom contract terms",
        "Bulk order management",
        "Team collaboration tools",
        "Premium support with priority response"
      ]
    }
  ]

  const artistFreedom = [
    {
      icon: <FiDollarSign className="w-10 h-10 text-emerald-400" />,
      title: "Set Your Own Prices",
      description: "You have complete freedom to set your rates based on your expertise, complexity of work, and market demand."
    },
    {
      icon: <FiClock className="w-10 h-10 text-purple-400" />,
      title: "Flexible Schedule",
      description: "Work when you want, where you want. Accept projects that fit your schedule and availability."
    },
    {
      icon: <FiUsers className="w-10 h-10 text-indigo-400" />,
      title: "Client Selection",
      description: "Review project details before accepting. You have the freedom to choose which clients and projects you work with."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 md:py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 md:mb-4"
          >
            Our Platform Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-2"
          >
            Connecting creative talent with clients worldwide with transparent fees and artist freedom
          </motion.p>
        </div>

        {/* Platform Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 sm:mb-16 md:mb-24">
          {platformFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card rounded-xl p-4 sm:p-6 md:p-8"
            >
              <div className="flex items-center mb-4 md:mb-6">
                <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-lg p-2 md:p-3 mr-3 md:mr-4">
                  {feature.icon}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{feature.title}</h2>
              </div>
              <p className="text-sm sm:text-base text-gray-300 mb-4 md:mb-6">{feature.description}</p>
              <ul className="space-y-2 md:space-y-3">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-start">
                    <FiCheck className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Platform Fees Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 sm:mb-16 md:mb-24"
        >
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 md:mb-4">Transparent Platform Fees</h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-3xl mx-auto px-2">
              We believe in fair compensation for artists. Our platform only charges fees when you successfully complete a project.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {platformFees.map((plan, index) => (
              <motion.div
                key={index}
                whileHover={{ translateY: -8 }}
                className={`glass-card rounded-xl p-4 sm:p-6 md:p-8 relative ${plan.popular ? 'border-2 border-violet-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-violet-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{plan.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 mb-3 md:mb-4">{plan.description}</p>
                <p className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-2">
                  {plan.fee}
                </p>
                {plan.requirements && (
                  <p className="text-xs sm:text-sm text-gray-400 mb-4 md:mb-6">
                    Requirements: {plan.requirements}
                  </p>
                )}
                <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <FiCheck className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm md:text-base text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className="block">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 md:py-3 px-4 md:px-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg text-white text-sm sm:text-base font-medium hover:from-purple-600 hover:to-indigo-600 transition-all"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Artist Freedom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 sm:mb-16 md:mb-24"
        >
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 md:mb-4">Artist Freedom</h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-3xl mx-auto px-2">
              We believe in empowering artists with the freedom to work on their own terms.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {artistFreedom.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                className="glass-card rounded-xl p-4 sm:p-6 md:p-8 text-center"
              >
                <div className="flex justify-center mb-4 md:mb-6">
                  <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full p-3 md:p-4">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 md:mb-3">{item.title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Creative Categories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 md:mb-4">Creative Categories</h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-3xl mx-auto px-2">
              Our platform supports a wide range of creative disciplines to meet all your project needs.
            </p>
          </div>
          
          <div className="glass-card rounded-xl p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {[
                "Digital Illustration", "Animation", "Video Editing", 
                "Graphic Design", "UI/UX Design", "3D Modeling",
                "Logo Design", "Web Design", "Photo Editing",
                "Music Production", "Voice Over", "Content Writing"
              ].map((category, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg p-3 md:p-4 text-center"
                >
                  <span className="text-sm md:text-base text-white">{category}</span>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-12 md:mt-16">
            <Link href="/auth/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-indigo-600 transition-all inline-flex items-center"
              >
                Join Our Creative Community
                <FiArrowRight className="ml-2" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 