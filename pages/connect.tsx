import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/hooks/useAuth'

export default function ConnectPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Service</h1>
          <iframe
            src="https://connect.bracu.ac.bd"
            title="Connect Service"
            width="100%"
            height="600px"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </div>
  )
} 