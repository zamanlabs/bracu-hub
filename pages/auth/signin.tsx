import SignIn from '../../components/auth/SignIn'
import { useAuth } from '../../lib/hooks/useAuth'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function SignInPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/chat/global')
    }
  }, [user, router])

  return (
    <div>
      <SignIn />
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign up
        </Link>
      </p>
    </div>
  )
} 