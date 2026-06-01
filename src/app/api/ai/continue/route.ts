import { NextRequest, NextResponse } from 'next/server'
import groq, { SMART_MODEL } from '@/lib/groq'
import { runApiGuard } from '@/lib/api-guard'

export async function POST(req: NextRequest) {
  const blocked = await runApiGuard(req, {
    requireAuth: true,
    rateLimitKey: 'ai-continue',
    maxRequests: 20,
    windowMs: 60_000,
  })
  if (blocked) return blocked

  try {
    const { body, title } = await req.json()
    if (!body) return NextResponse.json({ error: 'Body is required' }, { status: 400 })

    const lastParagraphs = body.split('\n').filter((p: string) => p.trim()).slice(-3).join('\n')

    const completion = await groq.chat.completions.create({
      model: SMART_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a skilled ghostwriter. Return ONLY a JSON object with a "continuation" string: 2-3 natural paragraphs that seamlessly continue the article. Match the existing tone and style exactly. Separate paragraphs with \\n. No markdown, no extra text.',
        },
        {
          role: 'user',
          content: `Article title: ${title || 'Untitled'}\n\nLast part of article:\n${lastParagraphs}\n\nContinue writing naturally from where this left off.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 768,
      response_format: { type: 'json_object' },
    })

    const text = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(text)
    return NextResponse.json({ continuation: parsed.continuation ?? '' })
  } catch (err) {
    console.error('AI continue error:', err)
    return NextResponse.json({ error: 'Failed to continue writing' }, { status: 500 })
  }
}
