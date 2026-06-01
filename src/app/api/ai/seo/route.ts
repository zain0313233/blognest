import { NextRequest, NextResponse } from 'next/server'
import groq, { SMART_MODEL } from '@/lib/groq'
import { runApiGuard } from '@/lib/api-guard'

export async function POST(req: NextRequest) {
  const blocked = await runApiGuard(req, {
    requireAuth: true,
    rateLimitKey: 'ai-seo',
    maxRequests: 20,
    windowMs: 60_000,
  })
  if (blocked) return blocked

  try {
    const { title, body, tags, category } = await req.json()
    if (!body) return NextResponse.json({ error: 'Body is required' }, { status: 400 })

    const wordCount = body.split(' ').filter(Boolean).length

    const completion = await groq.chat.completions.create({
      model: SMART_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an SEO expert. Analyze the article and return ONLY a JSON object with this exact shape:
{
  "score": number (0-100),
  "grade": "A"|"B"|"C"|"D"|"F",
  "suggestions": [
    { "priority": "high"|"medium"|"low", "category": "Title"|"Content"|"Keywords"|"Readability"|"Structure", "message": "specific actionable suggestion" }
  ],
  "keywords": ["detected keyword 1", "keyword 2", "keyword 3"],
  "positives": ["what is done well 1", "positive 2"]
}
Provide 4-6 suggestions. No markdown, no extra text.`,
        },
        {
          role: 'user',
          content: `Analyze SEO for this article:
Title: ${title || 'Untitled'}
Category: ${category || 'General'}
Tags: ${(tags || []).join(', ') || 'None'}
Word count: ${wordCount}

Content:
${body.slice(0, 3000)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    })

    const text = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(text)
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('AI SEO error:', err)
    return NextResponse.json({ error: 'Failed to analyze SEO' }, { status: 500 })
  }
}
