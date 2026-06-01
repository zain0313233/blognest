import { NextRequest, NextResponse } from 'next/server'
import groq, { FAST_MODEL } from '@/lib/groq'
import { runApiGuard } from '@/lib/api-guard'

export async function POST(req: NextRequest) {
  const blocked = await runApiGuard(req, {
    requireAuth: true,
    rateLimitKey: 'ai-tags',
    maxRequests: 25,
    windowMs: 60_000,
  })
  if (blocked) return blocked

  try {
    const { title, body, category } = await req.json()
    if (!body && !title) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

    const completion = await groq.chat.completions.create({
      model: FAST_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an SEO and content tagging expert. Return ONLY a JSON object with a "tags" array of 5-8 relevant, specific, single-word or short-phrase tags (lowercase, no #). Tags should be highly specific to the content and good for SEO. No markdown, no extra text.',
        },
        {
          role: 'user',
          content: `Category: ${category || 'General'}\nTitle: ${title || ''}\n\nContent:\n${(body || '').slice(0, 2000)}\n\nSuggest relevant tags.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 256,
      response_format: { type: 'json_object' },
    })

    const text = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(text)
    const tags: string[] = Array.isArray(parsed.tags) ? parsed.tags : []
    return NextResponse.json({ tags })
  } catch (err) {
    console.error('AI tags error:', err)
    return NextResponse.json({ error: 'Failed to suggest tags' }, { status: 500 })
  }
}
