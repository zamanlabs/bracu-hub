import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import GlobalChat from './GlobalChat'

export default function ChatLayout() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  const getHeaderTitle = () => {
    const path = router.pathname
    if (path === '/chat/direct') return 'Direct Messages'
    return 'Global Chat'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-white/90 backdrop-blur-sm shadow-lg border-r border-gray-200/50">
        <div className="p-6 border-b border-gray-200/50 bg-gradient-to-br from-indigo-500 to-purple-600">
          <h2 className="text-2xl font-bold text-white">BRACU Hub</h2>
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-white/90 font-medium">Online</span>
            </div>
            <div className="text-sm text-white/70 truncate">
              {user.email}
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <button
            onClick={() => router.push('/chat/direct')}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all transform hover:scale-105 group ${
              router.pathname === '/chat/direct' ? 'bg-gradient-to-r from-indigo-50 to-purple-50' : ''
            }`}
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
            className={`w-full flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all transform hover:scale-105 group ${
              router.pathname === '/profile' ? 'bg-gradient-to-r from-indigo-50 to-purple-50' : ''
            }`}
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
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b p-4">
          <h1 className="text-lg font-semibold text-gray-800">{getHeaderTitle()}</h1>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden">
          <GlobalChat />
        </div>
      </div>
    </div>
  )
} 