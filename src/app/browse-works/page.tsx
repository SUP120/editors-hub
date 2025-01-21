import { useState, useEffect, useCallback } from 'react';
import { Work, SupabaseError } from '@/app/types/supabase';
import { supabase } from '@/app/lib/supabase';

export default function BrowseWorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setWorks(data || []);
    } catch (error) {
      const e = error as SupabaseError;
      console.error('Error fetching works:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading works...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Browse Works</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {works.map(work => (
          <div key={work.id} className="border p-4 rounded-lg">
            <h2 className="font-medium">{work.title}</h2>
            <p className="text-gray-600">{work.description}</p>
            <p className="mt-2 font-semibold">${work.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 