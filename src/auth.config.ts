import type { NextAuthConfig } from 'next-auth'

// Map legacy env names (Netlify may only have NEXTAUTH_*)
if (process.env.NEXTAUTH_URL && !process.env.AUTH_URL) {
  process.env.AUTH_URL = process.env.NEXTAUTH_URL
}
if (process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET
}

export default {
  providers: [],
  pages: {
    signIn: '/auth/login',
  },
  // Required on Netlify/Vercel — host comes from proxy headers
  trustHost: true,
} satisfies NextAuthConfig
