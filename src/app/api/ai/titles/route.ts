import { NextRequest, NextResponse } from 'next/server'
import groq, { FAST_MODEL } from '@/lib/groq'
import { runApiGuard } from '@/lib/api-guard'

export async function POST(req: NextRequest) {
  const blocked = await runApiGuard(req, {
    requireAuth: true,
    rateLimitKey: 'ai-titles',
    maxRequests: 25,
    windowMs: 60_000,
  })
  if (blocked) return blocked

  try {
    const { body, category, currentTitle } = await req.json()
    if (!body && !currentTitle) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

    const completion = await groq.chat.completions.create({
      model: FAST_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a headline writer for a top news publication. Return ONLY a JSON object with a "titles" array of exactly 5 compelling, click-worthy but non-clickbait headline strings. Vary the style: one factual, one question, one bold statement, one how-to, one surprising angle.',
        },
        {
          role: 'user',
          content: `Category: ${category || 'General'}\nCurrent title: ${currentTitle || 'None'}\n\nContent preview:\n${(body || '').slice(0, 2000)}\n\nGenerate 5 excellent headline alternatives.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 512,
      response_format: { type: 'json_object' },
    })

    const text = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(text)
    const titles: string[] = Array.isArray(parsed.titles) ? parsed.titles : []
    return NextResponse.json({ titles })
  } catch (err) {
    console.error('AI titles error:', err)
    return NextResponse.json({ error: 'Failed to generate titles' }, { status: 500 })
  }
}
