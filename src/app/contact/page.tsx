'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          subject: 'New Contact Form Submission',
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      toast.success('Message sent successfully!')
      setName('')
      setEmail('')
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Policy Navigation Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <Link 
            href="https://www.termsfeed.com/live/ec820737-f750-4f3d-b87e-040ce5a901b2"
            className="glass-button px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
          <Link 
            href="https://www.termsfeed.com/live/0f425568-709a-4304-ab29-5f2adfb0e53b"
            className="glass-button px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms & Conditions
          </Link>
          <Link 
            href="https://www.freeprivacypolicy.com/live/14bba7d0-28e0-46df-8062-d049b8f59b04"
            className="glass-button px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            target="_blank"
            rel="noopener noreferrer"
          >
            Refund Policy
          </Link>
        </div>

        <div className="glass-card rounded-xl p-8">
          <h1 className="text-4xl font-bold text-white mb-8">Contact Us</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6 text-gray-300">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Get in Touch</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">Email</h3>
                    <a 
                      href="mailto:dbforuse@gmail.com"
                      className="text-violet-400 hover:text-violet-300"
                    >
                      dbforuse@gmail.com
                    </a>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Discord</h3>
                    <a 
                      href="https://discord.gg/"
                      className="text-violet-400 hover:text-violet-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join our Discord Server
                    </a>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Office</h2>
                <p>Ranchi, India</p>
              </section>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Your email"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Your message"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full glass-button px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 