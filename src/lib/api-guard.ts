import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getClientIp, rateLimit } from '@/lib/rate-limit'

export type ApiGuardOptions = {
  /** Require a signed-in user */
  requireAuth?: boolean
  /** Rate limit bucket name (defaults to pathname) */
  rateLimitKey?: string
  maxRequests?: number
  windowMs?: number
}

export type AuthSession = {
  user: { id: string; email?: string | null; name?: string | null; role?: string }
}

/**
 * Returns a NextResponse to send immediately, or null if the handler may proceed.
 * When requireAuth is true and guard passes, session is returned via callback pattern —
 * use requireApiAuth() for convenience.
 */
export async function runApiGuard(
  req: NextRequest,
  options: ApiGuardOptions = {}
): Promise<NextResponse | null> {
  const {
    requireAuth = false,
    rateLimitKey = req.nextUrl.pathname,
    maxRequests = 30,
    windowMs = 60_000,
  } = options

  const ip = getClientIp(req)
  const rl = rateLimit(`${rateLimitKey}:${ip}`, maxRequests, windowMs)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    )
  }

  if (requireAuth) {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return null
}

export async function requireApiAuth(req: NextRequest): Promise<
  | { session: AuthSession; error: null }
  | { session: null; error: NextResponse }
> {
  const blocked = await runApiGuard(req, { requireAuth: true, maxRequests: 60, windowMs: 60_000 })
  if (blocked) return { session: null, error: blocked }

  const session = await auth()
  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { session: session as AuthSession, error: null }
}
