import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Message = Database['public']['Tables']['direct_messages']['Row'] & {
  sender: {
    username: string
    avatar_url: string | null
  }
}

interface DirectMessageProps {
  recipientId: string
  recipientUsername: string
}

export default function DirectMessage({ recipientId, recipientUsername }: DirectMessageProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return

    fetchMessages()

    // Subscribe to new messages
    const subscription = supabase
      .channel(`direct_messages:${user.id}:${recipientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id}))`,
        },
        (payload) => {
          console.log('Message change:', payload)
          if (payload.eventType === 'INSERT') {
            fetchSenderInfo(payload.new as Message)
          } else if (payload.eventType === 'UPDATE') {
            handleMessageUpdate(payload.new as Message)
          } else if (payload.eventType === 'DELETE') {
            handleMessageDelete(payload.old.id)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, recipientId])

  const fetchSenderInfo = async (message: Message) => {
    try {
      const { data: senderData, error: senderError } = await supabase
        .from('users')
        .select('username, avatar_url')
        .eq('id', message.sender_id)
        .single()

      if (senderError) throw senderError

      const messageWithSender = {
        ...message,
        sender: senderData,
      }

      setMessages(prev => [...prev, messageWithSender])
    } catch (error) {
      console.error('Error fetching sender info:', error)
    }
  }

  const handleMessageUpdate = async (updatedMessage: Message) => {
    try {
      const { data: senderData, error: senderError } = await supabase
        .from('users')
        .select('username, avatar_url')
        .eq('id', updatedMessage.sender_id)
        .single()

      if (senderError) throw senderError

      const messageWithSender = {
        ...updatedMessage,
        sender: senderData,
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === updatedMessage.id ? messageWithSender : msg
        )
      )
    } catch (error) {
      console.error('Error handling message update:', error)
    }
  }

  const handleMessageDelete = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }

  const fetchMessages = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender:users!direct_messages_sender_id_fkey (
            username,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert([
          {
            sender_id: user.id,
            receiver_id: recipientId,
            content: newMessage.trim(),
          },
        ])
        .select()
        .single()

      if (error) throw error

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const startEditing = (message: Message) => {
    setEditingMessage(message)
    setNewMessage(message.content)
  }

  const cancelEditing = () => {
    setEditingMessage(null)
    setNewMessage('')
  }

  const updateMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMessage || !newMessage.trim()) return

    try {
      const { error } = await supabase
        .from('direct_messages')
        .update({ content: newMessage.trim() })
        .eq('id', editingMessage.id)

      if (error) throw error

      setEditingMessage(null)
      setNewMessage('')
    } catch (error) {
      console.error('Error updating message:', error)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('direct_messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user?.id)

      if (error) {
        console.error('Error deleting message:', error)
        throw new Error('Failed to delete message')
      }

      // Update UI immediately
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      
      // Refresh messages to ensure consistency
      await fetchMessages()
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Failed to delete message. Please try again.')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Chat Header */}
      <div className="flex items-center px-6 py-4 border-b bg-white/90 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            {recipientUsername}
          </h1>
          <p className="text-sm text-gray-500 font-medium">Direct Message</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-2xl p-4 ${
                message.sender_id === user?.id
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              } shadow-md hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center space-x-2">
                  {message.sender.avatar_url ? (
                    <img
                      src={message.sender.avatar_url}
                      alt={message.sender.username}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 border-2 border-white shadow-sm flex items-center justify-center text-white text-sm font-bold">
                      {message.sender.username[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold">
                    {message.sender.username}
                  </span>
                </div>
                <span className="text-xs opacity-75">
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-base leading-relaxed break-words">{message.content}</p>
              {message.sender_id === user?.id && (
                <div className="flex justify-end space-x-3 mt-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => startEditing(message)}
                    className="text-xs font-medium opacity-75 hover:opacity-100 transition-all transform hover:scale-105"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this message?')) {
                        deleteMessage(message.id)
                      }
                    }}
                    className="text-xs font-medium opacity-75 hover:opacity-100 transition-all transform hover:scale-105 text-red-300"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white/90 backdrop-blur-sm">
        <form
          onSubmit={editingMessage ? updateMessage : sendMessage}
          className="flex space-x-2"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={editingMessage ? 'Edit message...' : 'Type a message...'}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-600"
          />
          {editingMessage ? (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-all transform hover:scale-105 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-medium"
              >
                Update
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-medium flex items-center space-x-2"
            >
              <span>Send</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 transform rotate-45"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          )}
        </form>
      </div>
    </div>
  )
} 