import { useRouter } from 'next/router'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'

export default function Navbar() {
  const router = useRouter()
  const { user } = useAuth()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Back button - only show if not on home page */}
            {router.pathname !== '/' && (
              <button
                onClick={handleBack}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
            )}
            <span className="text-xl font-semibold text-gray-900">
              BRACU Hub
            </span>
          </div>

          {user && (
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
} 