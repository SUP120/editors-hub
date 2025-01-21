import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { Work, SupabaseError, User } from '@/app/types/supabase';
import WorkForm from '@/components/portfolio/WorkForm';

export default function NewWorkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

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
      console.error('Error checking user:', e.message);
      router.push('/auth/signin');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleSubmit = async (workData: Partial<Work>) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('works').insert({
        ...workData,
        artist_id: user.id,
        created_at: new Date().toISOString()
      });

      if (error) throw error;
      router.push('/artist/dashboard');
    } catch (error) {
      const e = error as SupabaseError;
      console.error('Error creating work:', e.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Create New Work</h1>
        <WorkForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
} 