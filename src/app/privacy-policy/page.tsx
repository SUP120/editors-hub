'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Policy Navigation Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <Link 
            href="/privacy-policy"
            className="glass-button px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          >
            Privacy Policy
          </Link>
          <Link 
            href="/terms-of-service"
            className="glass-button px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          >
            Terms & Conditions
          </Link>
          <Link 
            href="/refund-policy"
            className="glass-button px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          >
            Refund Policy
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-xl p-8"
        >
          <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Last Updated: 16 March 2025</h2>
              <p>
                This Privacy Policy describes how Artist Hiring Platform ("we," "us," or "our") collects, uses, and shares your personal information when you use our website, services, and applications (collectively, the "Services").
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white">Personal Information</h3>
                  <p className="mt-2">
                    We collect information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Account information (name, email address, password)</li>
                    <li>Profile information (profile picture, bio, portfolio)</li>
                    <li>Payment information (processed through secure third-party payment processors)</li>
                    <li>Communications with us and other users</li>
                    <li>Survey responses and feedback</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white">Automatically Collected Information</h3>
                  <p className="mt-2">
                    When you access or use our Services, we automatically collect:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Log information (IP address, browser type, pages visited, time spent)</li>
                    <li>Device information (hardware model, operating system, unique device identifiers)</li>
                    <li>Location information (with your consent)</li>
                    <li>Cookies and similar technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Provide, maintain, and improve our Services</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative messages, updates, and security alerts</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Facilitate communication between artists and clients</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Personalize and improve your experience</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">How We Share Your Information</h2>
              <p>We may share your information in the following circumstances:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>With Other Users:</strong> When you use our Services, certain information may be visible to other users (e.g., profile information, portfolio, reviews).</li>
                <li><strong>Service Providers:</strong> We share information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</li>
                <li><strong>Payment Processors:</strong> We share payment information with payment processors to facilitate transactions.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required to do so by law or in response to valid requests by public authorities.</li>
                <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.</li>
                <li><strong>With Your Consent:</strong> We may share information with third parties when you consent to such sharing.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Data Storage and Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
              <p className="mt-2">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Your Rights and Choices</h2>
              <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Accessing, correcting, or deleting your personal information</li>
                <li>Withdrawing your consent</li>
                <li>Objecting to or restricting certain processing</li>
                <li>Requesting portability of your information</li>
                <li>Lodging a complaint with a supervisory authority</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, please contact us at support@artisthiring.com.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Cookies and Similar Technologies</h2>
              <p>
                We use cookies and similar technologies to collect information about your browsing activities and to distinguish you from other users. You can control cookies through your browser settings and other tools. However, if you block certain cookies, you may not be able to use all the features of our Services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Children's Privacy</h2>
              <p>
                Our Services are not directed to children under the age of 18, and we do not knowingly collect personal information from children under 18. If we learn that we have collected personal information from a child under 18, we will take steps to delete such information as soon as possible.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or by posting a notice on our website prior to the change becoming effective. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <p className="mt-2">
                Email: support@artisthiring.com<br />
                Address: Ranchi, Jharkhand, India
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 