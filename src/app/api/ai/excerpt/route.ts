import { NextRequest, NextResponse } from 'next/server'
import groq, { FAST_MODEL } from '@/lib/groq'
import { runApiGuard } from '@/lib/api-guard'

export async function POST(req: NextRequest) {
  const blocked = await runApiGuard(req, {
    requireAuth: true,
    rateLimitKey: 'ai-excerpt',
    maxRequests: 25,
    windowMs: 60_000,
  })
  if (blocked) return blocked

  try {
    const { title, body } = await req.json()
    if (!body) return NextResponse.json({ error: 'Body is required' }, { status: 400 })

    const completion = await groq.chat.completions.create({
      model: FAST_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional editor. Return ONLY a JSON object with an "excerpt" string: a compelling 2-3 sentence summary (max 200 chars) that hooks readers and captures the essence of the article. No markdown, no extra text.',
        },
        {
          role: 'user',
          content: `Title: ${title || 'Untitled'}\n\nArticle:\n${body.slice(0, 3000)}\n\nWrite a compelling excerpt for this article.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 256,
      response_format: { type: 'json_object' },
    })

    const text = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(text)
    return NextResponse.json({ excerpt: parsed.excerpt ?? '' })
  } catch (err) {
    console.error('AI excerpt error:', err)
    return NextResponse.json({ error: 'Failed to generate excerpt' }, { status: 500 })
  }
}
