'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-violet-900 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-xl"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">Privacy Policy</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-4">Last updated: March 18, 2025</p>

            <div className="space-y-6 text-gray-300">
              <p>
                This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
              </p>

              <p>
                We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Interpretation and Definitions</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">Interpretation</h3>
              <p>
                The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">Definitions</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Account:</strong> means a unique account created for You to access our Service or parts of our Service.</li>
                <li><strong className="text-white">Company:</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Editors Hub.</li>
                <li><strong className="text-white">Cookies:</strong> are small files that are placed on Your computer, mobile device or any other device by a website.</li>
                <li><strong className="text-white">Country:</strong> refers to: Jharkhand, India</li>
                <li><strong className="text-white">Device:</strong> means any device that can access the Service.</li>
                <li><strong className="text-white">Personal Data:</strong> is any information that relates to an identified or identifiable individual.</li>
                <li><strong className="text-white">Service:</strong> refers to the Website.</li>
                <li><strong className="text-white">Website:</strong> refers to Editors Hub, accessible from www.editorshub.in</li>
              </ul>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Collecting and Using Your Personal Data</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">Types of Data Collected</h3>
              
              <h4 className="text-lg font-semibold text-white mt-4 mb-2">Personal Data</h4>
              <p>
                While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. This may include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email address</li>
                <li>Usage Data</li>
              </ul>

              <h4 className="text-lg font-semibold text-white mt-4 mb-2">Usage Data</h4>
              <p>
                Usage Data is collected automatically when using the Service. It may include information such as Your Device's Internet Protocol address, browser type, browser version, pages visited, time and date of visits, time spent on pages, and other diagnostic data.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">Use of Your Personal Data</h3>
              <p>The Company may use Personal Data for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our Service</li>
                <li>To manage Your Account</li>
                <li>For the performance of a contract</li>
                <li>To contact You</li>
                <li>To manage Your requests</li>
                <li>For business transfers</li>
                <li>For other purposes with Your consent</li>
              </ul>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, You can contact us:
              </p>
              <p>
                By email: <a href="mailto:support@editorshub.com" className="text-violet-400 hover:text-violet-300">support@editorshub.com</a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 