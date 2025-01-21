import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { Message, SupabaseError, User } from '@/app/types/supabase';

interface ChatPageProps {
  params: {
    orderId: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
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
    }
  }, [router]);

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', params.orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      const e = error as SupabaseError;
      console.error('Error fetching messages:', e.message);
    } finally {
      setLoading(false);
    }
  }, [params.orderId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    try {
      const { error } = await supabase.from('messages').insert({
        order_id: params.orderId,
        sender_id: user.id,
        content: newMessage.trim()
      });

      if (error) throw error;
      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      const e = error as SupabaseError;
      console.error('Error sending message:', e.message);
    }
  };

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    if (user) {
      fetchMessages();
      
      const subscription = supabase
        .channel(`order_${params.orderId}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `order_id=eq.${params.orderId}`
        }, () => {
          fetchMessages();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, params.orderId, fetchMessages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Chat</h1>
        <div className="bg-white rounded-lg shadow p-4 mb-4 h-[60vh] overflow-y-auto">
          {messages.map(message => (
            <div
              key={message.id}
              className={`mb-4 ${message.sender_id === user?.id ? 'text-right' : ''}`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.sender_id === user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border p-2"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 