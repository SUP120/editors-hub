'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function RefundPolicyPage() {
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
          <h1 className="text-3xl font-bold text-white mb-8">Refund & Cancellation Policy</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Last Updated: 16 March 2025</h2>
              <p>
                This Refund and Cancellation Policy outlines the terms and conditions for refunds and cancellations on the Artist Hiring Platform. We strive to ensure fair treatment for both artists and clients while maintaining the integrity of our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Order Cancellation</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white">Client-Initiated Cancellations</h3>
                  <p className="mt-2">
                    Clients may cancel an order under the following conditions:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Before Artist Acceptance:</strong> Full refund (100% of the order amount)</li>
                    <li><strong>After Artist Acceptance but Before Work Begins:</strong> 90% refund (10% service fee retained)</li>
                    <li><strong>After Work Has Begun but Before First Draft:</strong> 70% refund (30% retained for artist compensation and service fee)</li>
                    <li><strong>After First Draft Delivery:</strong> 50% refund (50% retained for artist compensation and service fee)</li>
                    <li><strong>After Final Delivery:</strong> No refund unless the work does not meet the agreed-upon requirements</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white">Artist-Initiated Cancellations</h3>
                  <p className="mt-2">
                    Artists may cancel an order under the following conditions:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Before Accepting the Order:</strong> No penalty</li>
                    <li><strong>After Accepting but Before Work Begins:</strong> No penalty, but may affect artist rating</li>
                    <li><strong>After Work Has Begun:</strong> May result in a temporary suspension from the platform depending on the circumstances and frequency of cancellations</li>
                  </ul>
                  <p className="mt-2">
                    In all artist-initiated cancellations, the client will receive a full refund.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white">Platform-Initiated Cancellations</h3>
                  <p className="mt-2">
                    Artist Hiring Platform reserves the right to cancel orders in cases of:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Violation of our Terms of Service</li>
                    <li>Suspected fraudulent activity</li>
                    <li>Inappropriate content requests</li>
                    <li>Extended inactivity from either party</li>
                  </ul>
                  <p className="mt-2">
                    Refund amounts for platform-initiated cancellations will be determined on a case-by-case basis.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Refund Process</h2>
              <p>
                To request a refund, clients must:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Navigate to the order details page</li>
                <li>Click on the "Request Cancellation" button</li>
                <li>Select a reason for cancellation</li>
                <li>Provide additional details if necessary</li>
                <li>Submit the request</li>
              </ol>
              <p className="mt-2">
                Refund requests will be reviewed within 48 hours. Once approved, refunds will be processed to the original payment method within 5-7 business days, depending on your payment provider.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Disputes and Resolution</h2>
              <p>
                If there is a disagreement between the client and artist regarding a cancellation or refund:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Both parties should attempt to resolve the issue through the platform's messaging system</li>
                <li>If no resolution is reached, either party may escalate the dispute to our Support Team</li>
                <li>Our Support Team will review the case, including all communications and work submitted</li>
                <li>A decision will be made based on our policies and the specific circumstances of the case</li>
              </ol>
              <p className="mt-2">
                Artist Hiring Platform's decision in dispute cases is final and binding.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Revision Policy</h2>
              <p>
                Before requesting a refund, we encourage clients to utilize our revision policy:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Each order includes a standard number of revisions (typically 2-3, depending on the service)</li>
                <li>Revision requests must be within the scope of the original order requirements</li>
                <li>Revision requests must be made within 7 days of receiving the final delivery</li>
                <li>Additional revisions beyond the included amount may incur extra charges</li>
              </ul>
              <p className="mt-2">
                If revisions cannot resolve the issues with the delivered work, clients may then proceed with the refund request process.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Special Circumstances</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white">Technical Issues</h3>
                  <p className="mt-2">
                    If technical issues on our platform prevent the proper delivery or receipt of work, a full refund may be issued or the deadline extended, depending on the client's preference.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white">Force Majeure</h3>
                  <p className="mt-2">
                    In cases of force majeure (natural disasters, serious illness, etc.), we will work with both parties to find a fair resolution, which may include deadline extensions or partial refunds.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Payment Protection</h2>
              <p>
                All payments on Artist Hiring Platform are held in escrow until the order is completed to the client's satisfaction. This ensures that:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Clients only pay for work they approve</li>
                <li>Artists are protected from non-payment for completed work</li>
                <li>Disputes can be fairly resolved with the payment still secured</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Changes to This Policy</h2>
              <p>
                We may update our Refund and Cancellation Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
              </p>
              <p className="mt-2">
                You are advised to review this policy periodically for any changes. Changes to this policy are effective when they are posted on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
              <p>
                If you have any questions about our Refund and Cancellation Policy, please contact us at:
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