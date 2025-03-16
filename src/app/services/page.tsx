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
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Our Platform Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Connecting creative talent with clients worldwide with transparent fees and artist freedom
          </motion.p>
        </div>

        {/* Platform Features Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          {platformFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card rounded-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-lg p-3 mr-4">
                  {feature.icon}
                </div>
                <h2 className="text-2xl font-bold text-white">{feature.title}</h2>
              </div>
              <p className="text-gray-300 mb-6">{feature.description}</p>
              <ul className="space-y-3">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-start">
                    <FiCheck className="w-5 h-5 text-emerald-400 mr-2 mt-0.5" />
                    <span className="text-gray-300">{benefit}</span>
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
          className="mb-24"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Transparent Platform Fees</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              We believe in fair compensation for artists. Our platform only charges fees when you successfully complete a project.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {platformFees.map((plan, index) => (
              <motion.div
                key={index}
                whileHover={{ translateY: -8 }}
                className={`glass-card rounded-xl p-8 relative ${plan.popular ? 'border-2 border-violet-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-violet-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-2">
                  {plan.fee}
                </p>
                {plan.requirements && (
                  <p className="text-sm text-gray-400 mb-6">
                    Requirements: {plan.requirements}
                  </p>
                )}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <FiCheck className="w-5 h-5 text-emerald-400 mr-2 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Get Started
                    <FiArrowRight className="w-4 h-4" />
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
          className="mb-24"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Artist Freedom</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              We believe in empowering artists with the freedom to work on their own terms
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {artistFreedom.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ translateY: -8 }}
                className="glass-card rounded-xl p-8 text-center"
              >
                <div className="flex justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Categories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Creative Categories</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Our platform supports a wide range of creative services across various disciplines
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Digital Illustration", 
              "Graphic Design", 
              "Animation", 
              "Video Editing",
              "Web Design", 
              "UI/UX Design", 
              "3D Modeling", 
              "Logo Design",
              "Brand Identity", 
              "Social Media Graphics", 
              "Character Design", 
              "Concept Art"
            ].map((category, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="glass-card rounded-xl p-4 text-center"
              >
                <p className="text-white font-medium">{category}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card rounded-xl p-8 mt-24 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Join Our Creative Community?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Whether you're an artist looking to showcase your talent or a client seeking creative services,
            our platform provides the tools and support you need to succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-purple-500 rounded-lg text-white font-medium hover:from-emerald-600 hover:to-purple-600 transition-colors"
              >
                Sign Up Now
              </motion.button>
            </Link>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-white/10 rounded-lg text-white font-medium hover:bg-white/20 transition-colors"
              >
                Contact Us
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 