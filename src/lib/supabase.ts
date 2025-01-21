import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ixgkcseieqsayechntmx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Z2tjc2VpZXFzYXllY2hudG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNjA5ODgsImV4cCI6MjA1MjkzNjk4OH0.79DexLDyMb5SHEYZxtWU8IRh2Gk51tH1YUgxndwjczM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 