import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'
import { useRouter } from 'next/router'

type Message = Database['public']['Tables']['global_messages']['Row'] & {
  sender: {
    full_name: string
    avatar_url: string | null
  }
}

export default function GlobalChat() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)

  // First useEffect for message subscriptions
  useEffect(() => {
    if (!user) return

    fetchMessages()

    const subscription = supabase
      .channel('global_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_messages',
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
  }, [user])

  // Separate useEffect for input handling
  useEffect(() => {
    if (!user || !inputRef.current) return

    const input = inputRef.current
    let typingTimeout: NodeJS.Timeout

    const handleInput = () => {
      setIsTyping(true)
      if (typingTimeout) clearTimeout(typingTimeout)
      typingTimeout = setTimeout(() => {
        setIsTyping(false)
      }, 3000)
    }

    input.addEventListener('input', handleInput)
    return () => {
      input.removeEventListener('input', handleInput)
      if (typingTimeout) clearTimeout(typingTimeout)
    }
  }, [user])

  const fetchSenderInfo = async (message: Message) => {
    try {
      const { data: senderData, error: senderError } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', message.user_id)
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
        .select('full_name, avatar_url')
        .eq('id', updatedMessage.user_id)
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
        .from('global_messages')
        .select(`
          *,
          sender:users!global_messages_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
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
        .from('global_messages')
        .insert([
          {
            user_id: user.id,
            content: newMessage.trim(),
          },
        ])
        .select(`
          *,
          sender:users!global_messages_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      // Add the message to the UI immediately
      setMessages(prev => [...prev, data])
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
        .from('global_messages')
        .update({ content: newMessage.trim(), edited: true })
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
        .from('global_messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user?.id)

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

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/signin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="flex h-full relative bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white/80 backdrop-blur-sm md:rounded-l-2xl md:shadow-lg relative">
        {/* Menu Button and Header */}
        <div className="flex items-center px-6 py-4 border-b bg-white/90 backdrop-blur-sm md:rounded-tl-2xl">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden mr-4 p-2 hover:bg-gray-100/80 rounded-lg transition-all transform hover:scale-105 active:scale-95"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Global Chat
            </h1>
            <p className="text-sm text-gray-500 font-medium">Connect with the Community</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.user_id === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-4 ${
                  message.user_id === user?.id
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                } shadow-md hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center space-x-2">
                    {message.sender.avatar_url ? (
                      <img
                        src={message.sender.avatar_url}
                        alt={message.sender.full_name || 'User'}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 border-2 border-white shadow-sm flex items-center justify-center text-white text-sm font-bold">
                        {(message.sender.full_name || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-semibold">
                      {message.sender.full_name || 'Anonymous User'}
                    </span>
                  </div>
                  <span className="text-xs opacity-75">
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-base leading-relaxed break-words">{message.content}</p>
                {message.edited && (
                  <span className="text-xs opacity-75 ml-2 italic">(edited)</span>
                )}
                {message.user_id === user?.id && (
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

        {/* Typing Indicator */}
        {isTyping && (
          <div className="px-6 py-2 text-sm font-medium text-indigo-600 italic bg-indigo-50/50 backdrop-blur-sm border-t">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Someone is typing...</span>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t bg-white/90 backdrop-blur-sm md:rounded-bl-2xl">
          <form
            onSubmit={editingMessage ? updateMessage : sendMessage}
            className="flex space-x-2"
          >
            <input
              ref={inputRef}
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

      {/* Sliding Menu */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 w-72 md:w-64 lg:w-72 bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-300 ease-in-out z-30`}
      >
        <div className="flex flex-col h-full">
          {/* User Profile Section */}
          <div className="p-6 border-b bg-gradient-to-br from-indigo-500 to-purple-600">
            <div className="flex items-center space-x-4">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name || 'User'}
                  className="w-16 h-16 rounded-full border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-indigo-600 text-2xl font-bold">
                  {(user?.user_metadata?.full_name?.[0] || 'U').toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg text-white truncate">
                  {user?.user_metadata?.full_name || 'Anonymous User'}
                </div>
                <div className="text-sm text-white/80 truncate">{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => router.push('/chat/direct')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all transform hover:scale-105 group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-indigo-500 group-hover:text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span className="font-medium">Direct Messages</span>
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all transform hover:scale-105 group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-indigo-500 group-hover:text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="font-medium">Profile Settings</span>
            </button>
          </nav>

          {/* Sign Out Button */}
          <div className="p-4 border-t">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-600 rounded-xl hover:bg-red-50 transition-all transform hover:scale-105 font-medium group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 group-hover:text-red-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="group-hover:text-red-700">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-20"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  )
} 