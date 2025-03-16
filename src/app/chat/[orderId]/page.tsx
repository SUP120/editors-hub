'use client'

import React, { useEffect, useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'
import { emailTemplates } from '@/lib/email-templates'

type Message = {
  id: string
  order_id: string
  sender_id: string
  content: string
  created_at: string
  sender: {
    full_name: string
  }
}

type Order = {
  id: string
  work_id: string
  client_id: string
  artist_id: string
  status: string
  work: {
    title: string
  }
}

export default function ChatPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const resolvedParams = use(params)

  useEffect(() => {
    checkUser()
    const channel = supabase.channel('messages')
    return () => {
      channel.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/signin')
      return
    }
    setUser(user)
    await fetchOrder()
    await fetchMessages()
    subscribeToMessages()
  }

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          work:work_id (
            title
          )
        `)
        .eq('id', resolvedParams.orderId)
        .single()

      if (error) throw error
      setOrder(data)
    } catch (error: any) {
      console.error('Error fetching order:', error)
      setError(error.message)
    }
  }

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            full_name
          )
        `)
        .eq('order_id', resolvedParams.orderId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error: any) {
      console.error('Error fetching messages:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToMessages = () => {
    supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${resolvedParams.orderId}`,
        },
        async (payload) => {
          // Fetch the complete message with sender info
          const { data, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:sender_id (
                full_name
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && data) {
            setMessages(prev => [...prev, data])
            scrollToBottom()
          }
        }
      )
      .subscribe()
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sendingMessage) return

    setSendingMessage(true)
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            order_id: resolvedParams.orderId,
            sender_id: user.id,
            content: newMessage.trim(),
          },
        ])

      if (error) throw error
      setNewMessage('')
      
      // Send email notification to the other party
      try {
        if (order) {
          // Determine recipient (if sender is artist, send to client, and vice versa)
          const isUserArtist = user.id === order.artist_id
          const recipientId = isUserArtist ? order.client_id : order.artist_id
          
          // Get recipient's email
          const { data: recipientData, error: recipientError } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', recipientId)
            .single()
            
          if (recipientError) {
            console.error('Error fetching recipient:', recipientError)
          } else if (recipientData) {
            // Get sender's name
            const { data: senderData, error: senderError } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', user.id)
              .single()
              
            if (senderError) {
              console.error('Error fetching sender:', senderError)
            } else if (senderData) {
              // Send email notification
              await sendEmail({
                to: recipientData.email,
                ...emailTemplates.newMessage(order, senderData.full_name)
              })
              console.log('Message notification email sent to:', recipientData.email)
            }
          }
        }
      } catch (emailError) {
        console.error('Error sending message notification email:', emailError)
        // Don't block the message sending process if email fails
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      setError(error.message)
    } finally {
      setSendingMessage(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Chat Header */}
        <div className="glass-card rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{order?.work.title}</h1>
              <p className="text-gray-400 text-sm">Order #{resolvedParams.orderId}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/orders/${resolvedParams.orderId}`)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-white hover:bg-gray-700"
            >
              View Order
            </motion.button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="glass-card rounded-xl p-4 mb-4 h-[60vh] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender_id === user?.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium">{message.sender.full_name}</span>
                    <span className="text-xs opacity-75">{formatTime(message.created_at)}</span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="mt-4 flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={sendingMessage || !newMessage.trim()}
              className="glass-button px-6 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            >
              {sendingMessage ? 'Sending...' : 'Send'}
            </motion.button>
          </form>
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center mt-2">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 