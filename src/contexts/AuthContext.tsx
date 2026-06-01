'use client'
import { createContext, useContext } from 'react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'

interface AuthUser {
  id: string
  email?: string | null
  name?: string | null
  role?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id as string,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as { role?: string }).role ?? 'user',
      }
    : null

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/' })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: status === 'loading',
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
