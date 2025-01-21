import { SupabaseError, Profile, ArtistProfile, Work } from '@/app/types/supabase';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (): Promise<{ data: Profile | null, error: SupabaseError | null }> => {
    const { data, error } = await supabase.from('profiles').select('*').single();
    return { data, error };
  }, []);

  const fetchArtistProfile = useCallback(async (): Promise<{ data: ArtistProfile | null, error: SupabaseError | null }> => {
    const { data, error } = await supabase.from('artist_profiles').select('*').single();
    return { data, error };
  }, []);

  const fetchWorks = useCallback(async (): Promise<{ data: Work[] | null, error: SupabaseError | null }> => {
    const { data, error } = await supabase.from('works').select('*');
    return { data, error };
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [profileData, artistProfileData, worksData] = await Promise.all([
        fetchProfile(),
        fetchArtistProfile(),
        fetchWorks()
      ]);

      if (profileData.error) throw profileData.error;
      if (artistProfileData.error) throw artistProfileData.error;
      if (worksData.error) throw worksData.error;

      setProfile(profileData.data);
      setArtistProfile(artistProfileData.data);
      setWorks(worksData.data || []);
    } catch (error) {
      const e = error as SupabaseError;
      console.error('Error loading data:', e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, fetchArtistProfile, fetchWorks]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Artist Dashboard</h1>
      {profile && (
        <div>
          <p>Welcome {profile.full_name || profile.email}</p>
          {artistProfile && (
            <p>Professional Title: {artistProfile.professional_title}</p>
          )}
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Your Works ({works.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {works.map(work => (
                <div key={work.id} className="border p-4 rounded-lg">
                  <h3 className="font-medium">{work.title}</h3>
                  <p className="text-gray-600">{work.description}</p>
                  <p className="mt-2 font-semibold">${work.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 