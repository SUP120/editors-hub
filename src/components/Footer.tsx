import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900/50 backdrop-blur-lg border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Editor's Hub</h3>
            <p className="text-gray-400">
              Connect with talented artists for your creative projects
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/browse-works" className="text-gray-400 hover:text-white transition-colors">
                  Browse Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="https://www.termsfeed.com/live/ec820737-f750-4f3d-b87e-040ce5a901b2" 
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="https://www.termsfeed.com/live/0f425568-709a-4304-ab29-5f2adfb0e53b"
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link 
                  href="https://www.freeprivacypolicy.com/live/14bba7d0-28e0-46df-8062-d049b8f59b04"
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Editor's Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 