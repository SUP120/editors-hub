import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/Navbar'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Toaster as SonnerToaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Artist Hiring Platform',
  description: 'Connect with talented artists for your creative projects',
  metadataBase: new URL('https://artist-hiring-public-pxrw7248k-sup120s-projects.vercel.app'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#6d28d9" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
          <SonnerToaster richColors position="top-center" />
        </ErrorBoundary>
      </body>
    </html>
  )
} 