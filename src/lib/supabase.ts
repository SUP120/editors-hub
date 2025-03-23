import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Determine the site URL based on environment
const siteUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000'
  : process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-application-name': 'artist-hiring'
    }
  }
}) 