import { NextRequest, NextResponse } from 'next/server'
import groq, { FAST_MODEL } from '@/lib/groq'
import { runApiGuard } from '@/lib/api-guard'

interface PostSummary {
  id: string
  title: string
  excerpt?: string | null
  category: string
  tags?: string[]
}

export async function POST(req: NextRequest) {
  const limited = await runApiGuard(req, {
    rateLimitKey: 'ai-search',
    maxRequests: 15,
    windowMs: 60_000,
  })
  if (limited) return limited

  try {
    const { query, posts } = await req.json() as { query: string; posts: PostSummary[] }
    if (!query || !posts?.length) return NextResponse.json({ results: [] })

    const postList = posts
      .map((p, i) => `${i}. [${p.id}] "${p.title}" — ${p.category} — ${p.excerpt ?? ''} — tags: ${(p.tags ?? []).join(', ')}`)
      .join('\n')

    const completion = await groq.chat.completions.create({
      model: FAST_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a semantic search engine. Given a natural language query and a list of articles, return ONLY a JSON object with a "results" array of article IDs (strings) ordered by relevance. Include only articles that are genuinely relevant. Return at most 6 results. No markdown, no extra text.',
        },
        {
          role: 'user',
          content: `Search query: "${query}"\n\nAvailable articles:\n${postList}\n\nReturn the IDs of the most relevant articles, ordered by relevance.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 256,
      response_format: { type: 'json_object' },
    })

    const text = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(text)
    const results: string[] = Array.isArray(parsed.results) ? parsed.results : []
    return NextResponse.json({ results })
  } catch (err) {
    console.error('AI search error:', err)
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 })
  }
}
