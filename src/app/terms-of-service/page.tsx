'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Last Updated: 16 March 2025</h2>
              <p>
                Please read these Terms of Service ("Terms") carefully before using the Artist Hiring Platform website and services operated by Artist Hiring Platform.
              </p>
              <p className="mt-2">
                Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
              <p className="mt-2">
                By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Accounts</h2>
              <p>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
              </p>
              <p className="mt-2">
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
              </p>
              <p className="mt-2">
                You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">User Conduct</h2>
              <p>As a user of the Service, you agree not to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Violate any laws, third-party rights, or our policies.</li>
                <li>Use our Service to send unsolicited or unauthorized advertising or spam.</li>
                <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity.</li>
                <li>Interfere with or disrupt the Service or servers or networks connected to the Service.</li>
                <li>Collect or store personal data about other users without their consent.</li>
                <li>Use the Service for any illegal or unauthorized purpose.</li>
                <li>Post content that is defamatory, obscene, or otherwise objectionable.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Content</h2>
              <p>
                Our Service allows you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.
              </p>
              <p className="mt-2">
                By posting Content on or through the Service, you represent and warrant that: (i) the Content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights, or any other rights of any person.
              </p>
              <p className="mt-2">
                We reserve the right to remove any Content from the Service at our discretion, without prior notice, for any reason, including if we believe that such Content violates these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Intellectual Property</h2>
              <p>
                The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Artist Hiring Platform and its licensors. The Service is protected by copyright, trademark, and other laws of both the India and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Artist Hiring Platform.
              </p>
              <p className="mt-2">
                When you upload content, you grant Artist Hiring Platform a non-exclusive, worldwide, royalty-free license to use, reproduce, adapt, publish, translate, and distribute it in any and all media, solely for the purpose of displaying, distributing, and promoting your content through our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Payment Terms</h2>
              <p>
                Artist Hiring Platform uses third-party payment processors to facilitate transactions between artists and clients. By using our Service, you agree to the terms and conditions of these payment processors.
              </p>
              <p className="mt-2">
                All fees are exclusive of all taxes, levies, or duties imposed by taxing authorities, and you shall be responsible for payment of all such taxes, levies, or duties.
              </p>
              <p className="mt-2">
                Artists will receive payment for their services after the client has approved the final work and the designated review period has passed. Artist Hiring Platform retains a service fee from each transaction, as outlined in our Fee Schedule.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p className="mt-2">
                Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Limitation of Liability</h2>
              <p>
                In no event shall Artist Hiring Platform, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use, or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not we have been informed of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Disclaimer</h2>
              <p>
                Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
              </p>
              <p className="mt-2">
                Artist Hiring Platform, its subsidiaries, affiliates, and its licensors do not warrant that a) the Service will function uninterrupted, secure, or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
              </p>
              <p className="mt-2">
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
              <p className="mt-2">
                By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
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