import SignUp from '../../components/auth/SignUp'
import { useAuth } from '../../lib/hooks/useAuth'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function SignUpPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/chat/global')
    }
  }, [user, router])

  return (
    <div>
      <SignUp />
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </p>
    </div>
  )
} 