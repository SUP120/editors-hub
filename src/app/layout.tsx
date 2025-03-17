import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ArtistHire - Connect with Talented Artists',
  description: 'Find and hire talented artists for your projects. A platform connecting creative professionals with clients worldwide.',
  keywords: 'artist hiring, freelance artists, creative professionals, art commissions, digital art, illustrations',
  openGraph: {
    title: 'ArtistHire - Connect with Talented Artists',
    description: 'Find and hire talented artists for your projects. A platform connecting creative professionals with clients worldwide.',
    images: ['/og-image.jpg'],
  },
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
        <Navbar />
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  )
} 