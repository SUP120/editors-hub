import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { User, SupabaseError } from '@/app/types/supabase';

const CompleteProfilePage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Complete Your Artist Profile</h1>
      {user && (
        <p>Welcome {user.email}</p>
      )}
    </div>
  );
};

export default CompleteProfilePage; 