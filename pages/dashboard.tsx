import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 py-8 px-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Welcome back!</h1>
                <p className="mt-2 text-white/80">{user.email}</p>
              </div>
              <button
                onClick={signOut}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 font-medium flex items-center space-x-2"
              >
                <span>Sign Out</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Global Chat Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all transform hover:scale-105">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Global Chat</h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white/80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Join the global conversation with all BRACU students. Share ideas, ask questions, and connect with your peers.
              </p>
              <Link
                href="/chat/global"
                className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium group"
              >
                <span>Go to Global Chat</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 transform transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Direct Messages Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all transform hover:scale-105">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Direct Messages</h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white/80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Have private conversations with other BRACU students. Perfect for one-on-one discussions and collaboration.
              </p>
              <Link
                href="/chat/direct"
                className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium group"
              >
                <span>Go to Direct Messages</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 transform transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Profile Settings Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all transform hover:scale-105">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white/80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Customize your profile information, update your avatar, and manage your account settings.
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium group"
              >
                <span>Edit Profile</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 transform transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 