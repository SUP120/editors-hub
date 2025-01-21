import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { Work, ArtistProfile, User, SupabaseError } from '@/app/types/supabase';
import Image from 'next/image';

export default function ArtistProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      setUser(user as User);
    } catch (error) {
      const e = error as SupabaseError;
      setErrorMessage(e.message);
      router.push('/auth/signin');
    }
  }, [router]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      const e = error as SupabaseError;
      setErrorMessage(e.message);
    }
  }, [user]);

  const fetchWorks = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorks(data || []);
    } catch (error) {
      const e = error as SupabaseError;
      setErrorMessage(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    if (user) {
      Promise.all([fetchProfile(), fetchWorks()]);
    }
  }, [user, fetchProfile, fetchWorks]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {profile && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center gap-6">
              {profile.avatar_url && (
                <div className="relative w-24 h-24">
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                <p className="text-gray-600">{profile.professional_title}</p>
                <p className="text-gray-500">{profile.location}</p>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold">About</h2>
              <p className="mt-2 text-gray-600">{profile.bio}</p>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold mb-4">Portfolio Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {works.map(work => (
              <div key={work.id} className="bg-white rounded-lg shadow overflow-hidden">
                {work.images[0] && (
                  <div className="relative h-48">
                    <Image
                      src={work.images[0]}
                      alt={work.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold">{work.title}</h3>
                  <p className="text-gray-600 mt-1 line-clamp-2">{work.description}</p>
                  <p className="text-indigo-600 font-medium mt-2">${work.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 