import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { SupabaseError } from '@/app/types/supabase';

interface EarningsSummary {
  totalEarnings: number;
  pendingPayouts: number;
  completedWorks: number;
}

export default function EarningsPage() {
  const router = useRouter();
  const [earnings, setEarnings] = useState<EarningsSummary>({
    totalEarnings: 0,
    pendingPayouts: 0,
    completedWorks: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchEarnings = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('amount')
        .eq('artist_id', user.id)
        .eq('status', 'completed');

      if (error) throw error;

      const totalEarnings = data?.reduce((sum, order) => sum + order.amount, 0) || 0;
      
      setEarnings(prev => ({
        ...prev,
        totalEarnings,
        completedWorks: data?.length || 0
      }));
    } catch (error) {
      const e = error as SupabaseError;
      console.error('Error fetching earnings:', e.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading earnings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Your Earnings</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700">Total Earnings</h2>
          <p className="text-3xl font-bold text-green-600">${earnings.totalEarnings}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700">Pending Payouts</h2>
          <p className="text-3xl font-bold text-yellow-600">${earnings.pendingPayouts}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-700">Completed Works</h2>
          <p className="text-3xl font-bold text-blue-600">{earnings.completedWorks}</p>
        </div>
      </div>
    </div>
  );
} 