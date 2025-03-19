import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Message {
  id: string
  content: string
  user_id: string
  created_at: string
  username: string
}

export default function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  
  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel('global_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'global_messages'
      }, (payload) => {
        setMessages(current => [...current, payload.new as Message])
      })
      .subscribe()

    // Fetch existing messages
    fetchMessages()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('global_messages')
      .select(`
        *,
        users:user_id (username)
      `)
      .order('created_at', { ascending: true })
    
    if (data) setMessages(data)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    await supabase
      .from('global_messages')
      .insert([
        {
          content: newMessage,
          user_id: user.i
        }
      ])
  }

  return (
    <div>
      {/* Render your chat layout components here */}
    </div>
  )
} 