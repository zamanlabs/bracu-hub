import { useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '../supabase/client'
import { useRouter } from 'next/router'

interface AuthState {
  user: User | null
  loading: boolean
  error: AuthError | null
}

interface SignUpData {
  email: string
  password: string
  username: string
}

const ALLOWED_DOMAINS = ['g.bracu.ac.bd', 'bracu.ac.bd']

const validateEmailDomain = (email: string): boolean => {
  const domain = email.split('@')[1]
  return ALLOWED_DOMAINS.includes(domain)
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            user: session?.user ?? null,
            loading: false,
          }))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
          }))
        }
      }
    }

    initializeAuth()

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          loading: false,
        }))
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async ({ email, password, username }: SignUpData) => {
    try {
      // Validate email domain
      if (!validateEmailDomain(email)) {
        throw new Error('Only BRACU email addresses (@g.bracu.ac.bd or @bracu.ac.bd) are allowed')
      }

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          }
        }
      })
      
      if (error) throw error
      
      // If user is created, manually insert into users table to ensure it exists
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            username: username || email.split('@')[0],
            avatar_url: null,
            status: 'online',
            last_seen: new Date().toISOString()
          })
        
        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }
      
      // Redirect to email confirmation page or dashboard
      router.push('/auth/verify-email')
    } catch (error) {
      setAuthState(prev => ({ ...prev, error: error as AuthError }))
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // Validate email domain for sign in as well
      if (!validateEmailDomain(email)) {
        throw new Error('Only BRACU email addresses (@g.bracu.ac.bd or @bracu.ac.bd) are allowed')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      // Update user status to online
      if (data.user) {
        await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            status: 'online',
            last_seen: new Date().toISOString()
          })
      }
      
      // Redirect to dashboard on successful sign in
      router.push('/dashboard')
    } catch (error) {
      setAuthState(prev => ({ ...prev, error: error as AuthError }))
    }
  }

  const signOut = async () => {
    try {
      // Set user status to offline
      if (authState.user) {
        await supabase
          .from('users')
          .upsert({
            id: authState.user.id,
            status: 'offline',
            last_seen: new Date().toISOString()
          })
      }
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Redirect to auth page on sign out
      router.push('/auth')
    } catch (error) {
      setAuthState(prev => ({ ...prev, error: error as AuthError }))
    }
  }

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signUp,
    signIn,
    signOut,
  }
} 