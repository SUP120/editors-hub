import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create an admin client with service role for operations that need to bypass RLS
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
export const supabaseAdmin = serviceRoleKey 
  ? createClient(supabaseUrl, serviceRoleKey)
  : supabase // Fallback to regular client if no service role key

// Create a simulated db interface that mimics Prisma's API but uses Supabase
export const db = {
  order: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', where.id)
        .single()
      
      if (error) throw error
      return data
    },
    create: async ({ data }: { data: any }) => {
      // Use admin client to bypass RLS for creating test orders
      const { data: newData, error } = await supabaseAdmin
        .from('orders')
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return newData
    },
    update: async ({ where, data }: { where: { id: string }, data: any }) => {
      const { data: updatedData, error } = await supabase
        .from('orders')
        .update(data)
        .eq('id', where.id)
        .select()
        .single()
      
      if (error) throw error
      return updatedData
    }
  }
} 