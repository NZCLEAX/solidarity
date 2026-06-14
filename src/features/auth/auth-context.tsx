import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { isUserRole, type UserRole } from './model/roles'

type AuthUser = {
  id: string
  email: string | null
  role: UserRole
}

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  isMfaRequired: boolean
  login: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function getUserWithRole(authUserId: string, email: string | null): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authUserId)
    .maybeSingle()

  if (error) {
    return null
  }

  if (!data?.role || !isUserRole(data.role)) {
    return null
  }

  return {
    id: authUserId,
    email,
    role: data.role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMfaRequired, setIsMfaRequired] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function bootstrap() {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user

      if (!sessionUser) {
        if (isMounted) {
          setUser(null)
          setIsMfaRequired(false)
          setIsLoading(false)
        }
        return
      }

      const nextUser = await getUserWithRole(sessionUser.id, sessionUser.email ?? null)
      if (isMounted) {
        setUser(nextUser)
        if (nextUser?.role === 'admin') {
          const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
          setIsMfaRequired(aalData?.currentLevel !== 'aal2')
        } else {
          setIsMfaRequired(false)
        }
        setIsLoading(false)
      }
    }

    void bootstrap()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user
      if (!sessionUser) {
        setUser(null)
        setIsMfaRequired(false)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      void getUserWithRole(sessionUser.id, sessionUser.email ?? null).then((nextUser) => {
        void (async () => {
          if (!isMounted) return
          setUser(nextUser)
          if (nextUser?.role === 'admin') {
            const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
            setIsMfaRequired(aalData?.currentLevel !== 'aal2')
          } else {
            setIsMfaRequired(false)
          }
          setIsLoading(false)
        })()
      })
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isLoading,
      isMfaRequired,
      login: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error?.message ?? null }
      },
      logout: async () => {
        await supabase.auth.signOut()
        setUser(null)
        setIsMfaRequired(false)
      },
    }
  }, [user, isLoading, isMfaRequired])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
