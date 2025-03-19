import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../lib/hooks/useAuth'

export default function VerifyEmail() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent you an email with a link to verify your account.
            Please check your inbox and click the link to continue.
          </p>
        </div>
      </div>
    </div>
  )
} 