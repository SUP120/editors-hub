'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if there's an auth code in the URL
    const code = searchParams.get('code')
    if (code) {
      // Redirect to the callback page with the code
      router.push(`/auth/callback?code=${code}`)
    }
  }, [searchParams, router])

  return null
} 