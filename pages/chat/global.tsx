import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import GlobalChat from '@/components/chat/GlobalChat'
import Navbar from '@/components/layout/Navbar'

export default function GlobalChatPage() {
  const { user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900">Global Chat</h2>
              <p className="text-sm text-gray-500 mt-1">
                Chat with all BRACU students
              </p>
            </div>
            <div className="p-4 border-t">
              <h3 className="text-sm font-medium text-gray-900">Online Users</h3>
              <div className="mt-2 space-y-2">
                {/* We can add online users list here later */}
                <p className="text-sm text-gray-500">Coming soon...</p>
              </div>
            </div>
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
          <GlobalChat />
        </div>
      </div>
    </div>
  )
} 