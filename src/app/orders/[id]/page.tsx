import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { Order, Work, User, SupabaseError } from '@/app/types/supabase';

interface OrderPageProps {
  params: {
    id: string;
  };
}

export default function OrderPage({ params }: OrderPageProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [work, setWork] = useState<Work | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(e.message);
      router.push('/auth/signin');
    }
  }, [router]);

  const fetchOrderDetails = useCallback(async () => {
    if (!user) return;

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single();

      if (orderError) throw orderError;
      if (!orderData) throw new Error('Order not found');

      setOrder(orderData);

      const { data: workData, error: workError } = await supabase
        .from('works')
        .select('*')
        .eq('id', orderData.work_id)
        .single();

      if (workError) throw workError;
      setWork(workData);
    } catch (error) {
      const e = error as SupabaseError;
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [params.id, user]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    if (user) {
      fetchOrderDetails();
    }
  }, [user, fetchOrderDetails]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Order Details</h1>
        {order && work && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold">{work.title}</h2>
            <p className="text-gray-600 mt-2">{work.description}</p>
            <div className="mt-4">
              <p className="font-medium">Order Status: <span className="capitalize">{order.status}</span></p>
              <p className="font-medium">Amount: ${order.amount}</p>
              <p className="font-medium">Payment Status: <span className="capitalize">{order.payment_status}</span></p>
              <p className="text-sm text-gray-500">We&apos;ll notify you when there&apos;s an update.</p>
              <p className="text-sm text-gray-500">Don&apos;t hesitate to reach out if you have any questions.</p>
            </div>
            {work.images[0] && (
              <div className="mt-4">
                <img
                  src={work.images[0]}
                  alt={work.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 