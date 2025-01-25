import React from 'react'
import './globals.css'
import { GeistSans } from 'geist/font/sans'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import UserProvider from '@/contexts/UserProvider'

const geistSans = GeistSans

export const metadata = {
  title: 'Artist Hiring Platform',
  description: 'Connect with local artists for your projects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geistSans.className}>
      <body>
        <AuthProvider>
          <UserProvider>
            <Toaster position="top-right" />
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 