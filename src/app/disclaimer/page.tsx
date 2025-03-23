'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-violet-900 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-xl"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">Disclaimer</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-4">Last updated: March 18, 2025</p>

            <div className="space-y-6 text-gray-300">
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Interpretation and Definitions</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">Interpretation</h3>
              <p>
                The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">Definitions</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Company:</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Disclaimer) refers to Editors Hub.</li>
                <li><strong className="text-white">Service:</strong> refers to the Website.</li>
                <li><strong className="text-white">Website:</strong> refers to Editors Hub, accessible from www.editorshub.in</li>
                <li><strong className="text-white">You:</strong> means the individual accessing the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
              </ul>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Disclaimer</h2>
              <p>
                The information contained on the Service is for general information purposes only.
              </p>
              <p>
                The Company assumes no responsibility for errors or omissions in the contents of the Service.
              </p>
              <p>
                In no event shall the Company be liable for any special, direct, indirect, consequential, or incidental damages or any damages whatsoever, whether in an action of contract, negligence or other tort, arising out of or in connection with the use of the Service or the contents of the Service. The Company reserves the right to make additions, deletions, or modifications to the contents on the Service at any time without prior notice.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">External Links Disclaimer</h2>
              <p>
                The Service may contain links to external websites that are not provided or maintained by or in any way affiliated with the Company.
              </p>
              <p>
                Please note that the Company does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Fair Use Disclaimer</h2>
              <p>
                The Company may use copyrighted material which has not always been specifically authorized by the copyright owner. The Company is making such material available for criticism, comment, news reporting, teaching, scholarship, or research.
              </p>
              <p>
                The Company believes this constitutes a "fair use" of any such copyrighted material as provided for in section 107 of the United States Copyright law.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">"Use at Your Own Risk" Disclaimer</h2>
              <p>
                All information in the Service is provided "as is", with no guarantee of completeness, accuracy, timeliness or of the results obtained from the use of this information, and without warranty of any kind, express or implied, including, but not limited to warranties of performance, merchantability and fitness for a particular purpose.
              </p>
              <p>
                The Company will not be liable to You or anyone else for any decision made or action taken in reliance on the information given by the Service or for any consequential, special or similar damages, even if advised of the possibility of such damages.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Disclaimer, You can contact us:
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