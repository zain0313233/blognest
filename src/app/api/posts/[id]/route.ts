import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { runApiGuard } from '@/lib/api-guard'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await runApiGuard(req, {
    rateLimitKey: 'posts-get-one',
    maxRequests: 120,
    windowMs: 60_000,
  })
  if (limited) return limited

  try {
    const { id } = await params

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Fetch related posts (same category, excluding this post)
    const related = await prisma.post.findMany({
      where: { category: post.category, id: { not: id } },
      take: 3,
      orderBy: { publishedDate: 'desc' },
      include: { author: { select: { id: true, name: true, email: true } } },
    })

    return NextResponse.json({ post, related })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
