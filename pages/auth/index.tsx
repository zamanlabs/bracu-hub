import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../lib/hooks/useAuth'
import Image from 'next/image'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')
  const { signIn, signUp, user, loading, error } = useAuth()
  const router = useRouter()

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    
    if (!validateEmail(email)) {
      setFormError('Please use a valid BRACU email address (@g.bracu.ac.bd or @bracu.ac.bd)')
      return
    }

    try {
      await signIn(email, password)
    } catch (err) {
      console.error('Sign in error:', err)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!validateEmail(email)) {
      setFormError('Please use a valid BRACU email address (@g.bracu.ac.bd or @bracu.ac.bd)')
      return
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters')
      return
    }

    try {
      await signUp({ email, password, username: username || email.split('@')[0] })
    } catch (err) {
      console.error('Sign up error:', err)
    }
  }

  const validateEmail = (email: string): boolean => {
    const validDomains = ['@g.bracu.ac.bd', '@bracu.ac.bd']
    return validDomains.some(domain => email.toLowerCase().endsWith(domain))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 py-8 px-8">
          <h2 className="text-center text-3xl font-extrabold text-white">
            Welcome to BRACU Hub
          </h2>
          <p className="mt-2 text-center text-sm text-white/80">
            Connect with peers, share knowledge, and grow together
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200/50">
          <button
            className={`flex-1 py-4 px-6 text-center transition-all ${
              activeTab === 'signin'
                ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium bg-gradient-to-r from-indigo-50/50 to-purple-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
            }`}
            onClick={() => setActiveTab('signin')}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center transition-all ${
              activeTab === 'signup'
                ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium bg-gradient-to-r from-indigo-50/50 to-purple-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
            }`}
            onClick={() => setActiveTab('signup')}
          >
            Create Account
          </button>
        </div>

        {/* Forms */}
        <div className="p-8">
          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-3 bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@g.bracu.ac.bd"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Only BRACU email addresses (@g.bracu.ac.bd or @bracu.ac.bd) are allowed
                </p>
              </div>

              <div>
                <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="signin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-3 bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error.message}
                </div>
              )}

              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-medium flex items-center justify-center space-x-2"
              >
                <span>Sign In</span>
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
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-6">
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-3 bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@g.bracu.ac.bd"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Only BRACU email addresses (@g.bracu.ac.bd or @bracu.ac.bd) are allowed
                </p>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-3 bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-600"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Leave blank to use email username"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-3 bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-3 bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-600"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {(error || formError) && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error?.message || formError}
                </div>
              )}

              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-medium flex items-center justify-center space-x-2"
              >
                <span>Create Account</span>
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 