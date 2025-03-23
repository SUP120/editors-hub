'use server'

import { supabaseAdmin } from '@/lib/supabase-admin'

export async function createProfile(userId: string, email: string, isArtist: boolean) {
  try {
    // Create base profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        is_artist: isArtist,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) throw profileError

    // If artist, create artist profile
    if (isArtist) {
      const { error: artistProfileError } = await supabaseAdmin
        .from('artist_profiles')
        .insert({
          id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (artistProfileError) throw artistProfileError
    }

    return { success: true }
  } catch (error: any) {
    console.error('Profile creation error:', error)
    return { success: false, error: error.message }
  }
} 