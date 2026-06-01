import { NextRequest, NextResponse } from 'next/server'

function allowedOrigins(): string[] {
  const origins = new Set<string>()
  if (process.env.NEXTAUTH_URL) origins.add(process.env.NEXTAUTH_URL.replace(/\/$/, ''))
  if (process.env.NODE_ENV === 'development') {
    origins.add('http://localhost:3000')
    origins.add('http://127.0.0.1:3000')
  }
  return [...origins]
}

export function applyCorsHeaders(req: NextRequest, res: NextResponse): NextResponse {
  const origin = req.headers.get('origin')
  const allowed = allowedOrigins()

  if (origin && allowed.includes(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.headers.set('Vary', 'Origin')
  return res
}

export function corsPreflightResponse(req: NextRequest): NextResponse {
  const res = new NextResponse(null, { status: 204 })
  return applyCorsHeaders(req, res)
}
