import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/hooks/useAuth'
import UserList from '@/components/chat/UserList'
import DirectMessage from '@/components/chat/DirectMessage'
import type { Database } from '@/lib/supabase/types'

type User = Database['public']['Tables']['users']['Row']

export default function DirectMessagePage() {
  const router = useRouter()
  const { userId } = router.query
  const { user } = useAuth()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* User List Sidebar */}
      <div className="w-80 bg-white border-r">
        <UserList
          onSelectUser={setSelectedUser}
          selectedUserId={userId as string}
        />
      </div>

      {/* Direct Message Area */}
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
  )
} 