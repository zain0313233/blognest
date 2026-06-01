import NextAuth from 'next-auth'
import authConfig from '@/auth.config'
import { NextResponse } from 'next/server'
import { applyCorsHeaders, corsPreflightResponse } from '@/lib/cors'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl

  // CORS for API routes (same-origin app; blocks random third-party sites)
  if (pathname.startsWith('/api')) {
    if (req.method === 'OPTIONS') {
      return corsPreflightResponse(req)
    }
    const res = NextResponse.next()
    return applyCorsHeaders(req, res)
  }

  // Page protection
  if (!req.auth && pathname.startsWith('/create-post')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/api/:path*', '/create-post/:path*'],
}
