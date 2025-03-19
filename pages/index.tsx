import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase/client'

export default function Home() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push('/dashboard')
        } else {
          router.push('/auth')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth')
      }
    }

    if (isClient) {
      checkAuth()
    }
  }, [router, isClient])

  // Return a static loading UI that won't cause hydration issues
  return (
    <div className="min-h-screen flex items-center justify-center">
      {isClient && (
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      )}
    </div>
  )
} 