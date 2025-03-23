'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Work = {
  id: string
  title: string
  description: string
  price: number
  category: string
  artist_id: string
}

export default function ClientDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [works, setWorks] = useState<Work[]>([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    fetchWorks()
  }, [user])

  const fetchWorks = async () => {
    const { data, error } = await supabase
      .from('works')
      .select('*')
      .eq('is_deleted', false)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching works:', error)
      return
    }

    setWorks(data || [])
  }

  const filteredWorks = works.filter(work =>
    work.title.toLowerCase().includes(filter.toLowerCase()) ||
    work.category.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-4">Browse Artists' Work</h1>
          
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search works..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorks.map(work => (
              <div key={work.id} className="glass-card p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white">{work.title}</h3>
                <p className="text-gray-300 mt-2">{work.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-violet-400">${work.price}</span>
                  <span className="text-gray-400">{work.category}</span>
                </div>
                <button
                  onClick={() => router.push(`/works/${work.id}`)}
                  className="mt-4 glass-button w-full py-2 rounded-md text-white"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 