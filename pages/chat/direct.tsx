import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import UserList from '@/components/chat/UserList'
import DirectMessage from '@/components/chat/DirectMessage'
import Navbar from '@/components/layout/Navbar'
import type { Database } from '@/lib/supabase/types'

type User = Database['public']['Tables']['users']['Row']

export default function DirectMessagePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    // If there's a userId in the URL, fetch that user
    const userId = router.query.userId as string
    if (userId) {
      fetchUser(userId)
    }
  }, [router.query.userId])

  const fetchUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setSelectedUser(data)
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    router.push(`/chat/direct?userId=${user.id}`, undefined, { shallow: true })
    // On mobile, close the sidebar after selecting a user
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-20 left-4 z-50 p-2 rounded-md bg-white shadow-md md:hidden"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isSidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-80 bg-white border-r transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full pt-16">
            <UserList
              onSelectUser={handleUserSelect}
              selectedUserId={selectedUser?.id}
            />
          </div>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1">
          {selectedUser ? (
            <DirectMessage
              recipientId={selectedUser.id}
              recipientUsername={selectedUser.username}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a user to start a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 