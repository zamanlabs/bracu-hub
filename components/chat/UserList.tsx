import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type User = Database['public']['Tables']['users']['Row']

interface UserListProps {
  onSelectUser: (user: User) => void
  selectedUserId?: string
}

export default function UserList({ onSelectUser, selectedUserId }: UserListProps) {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return

    fetchUsers()

    // Subscribe to user status changes
    const subscription = supabase
      .channel('users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          console.log('User change:', payload)
          fetchUsers()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [currentUser])

  const fetchUsers = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', currentUser.id)
        .order('username')

      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }

      console.log('Fetched users:', data)
      setUsers(data || [])
    } catch (error) {
      console.error('Error in fetchUsers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white/90 backdrop-blur-sm">
      {/* Search Header */}
      <div className="p-6 border-b bg-gradient-to-br from-indigo-500 to-purple-600">
        <h2 className="text-xl font-bold text-white mb-4">Direct Messages</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
        {filteredUsers.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-indigo-500"
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
            </div>
            <p className="text-gray-500 font-medium">No users found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={`w-full p-4 flex items-center space-x-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all ${
                selectedUserId === user.id ? 'bg-gradient-to-r from-indigo-50 to-purple-50' : ''
              }`}
            >
              <div className="relative">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-lg">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                    user.status === 'online'
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {user.username}
                </div>
                <div className="text-sm text-gray-500 flex items-center space-x-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  <span>{user.status === 'online' ? 'Online' : 'Offline'}</span>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-gray-400 transform transition-transform ${
                  selectedUserId === user.id ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))
        )}
      </div>
    </div>
  )
} 