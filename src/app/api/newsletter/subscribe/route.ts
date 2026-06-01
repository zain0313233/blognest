import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendNewsletterWelcomeEmail, isSmtpConfigured } from '@/lib/mail'
import { runApiGuard } from '@/lib/api-guard'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  source: z.string().max(50).optional(),
})

export async function POST(req: NextRequest) {
  const limited = await runApiGuard(req, {
    rateLimitKey: 'newsletter-subscribe',
    maxRequests: 5,
    windowMs: 15 * 60_000,
  })
  if (limited) return limited

  try {
    if (!isSmtpConfigured()) {
      return NextResponse.json(
        { error: 'Newsletter is not configured. SMTP settings are missing.' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid email' },
        { status: 400 }
      )
    }

    const { email, source } = parsed.data
    const normalized = email.toLowerCase().trim()

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalized },
    })

    if (existing?.active) {
      return NextResponse.json({
        message: "You're already subscribed. Check your inbox for our latest stories.",
        alreadySubscribed: true,
      })
    }

    if (existing && !existing.active) {
      await prisma.newsletterSubscriber.update({
        where: { email: normalized },
        data: { active: true, source: source ?? 'website' },
      })
    } else {
      await prisma.newsletterSubscriber.create({
        data: {
          email: normalized,
          source: source ?? 'website',
        },
      })
    }

    await sendNewsletterWelcomeEmail(normalized)

    return NextResponse.json({
      message: 'Thanks for subscribing! Check your inbox for a welcome email.',
      alreadySubscribed: false,
    })
  } catch (err) {
    console.error('Newsletter subscribe error:', err)
    return NextResponse.json(
      { error: 'Could not complete subscription. Please try again later.' },
      { status: 500 }
    )
  }
}
