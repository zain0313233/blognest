import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { runApiGuard } from '@/lib/api-guard'

export async function GET(req: NextRequest) {
  const limited = await runApiGuard(req, {
    rateLimitKey: 'posts-get',
    maxRequests: 120,
    windowMs: 60_000,
  })
  if (limited) return limited

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '5')
    const category = searchParams.get('category') ?? ''
    const skip = (page - 1) * limit

    const where = category && category !== 'All' ? { category } : {}

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedDate: 'desc' },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      total,
      hasNextPage: skip + limit < total,
      hasPreviousPage: page > 1,
      currentPage: page,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const blocked = await runApiGuard(req, {
    requireAuth: true,
    rateLimitKey: 'posts-create',
    maxRequests: 20,
    windowMs: 60_000,
  })
  if (blocked) return blocked

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, body, category, tags, coverImage, excerpt: providedExcerpt } = await req.json()

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
    }

    const excerpt = providedExcerpt || body.slice(0, 200).replace(/\n/g, ' ')

    const post = await prisma.post.create({
      data: {
        title,
        body,
        excerpt,
        category: category || 'General',
        tags: Array.isArray(tags) ? tags : [],
        coverImage: coverImage || null,
        authorId: session.user.id,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
