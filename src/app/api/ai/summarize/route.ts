import { NextRequest, NextResponse } from 'next/server'
import groq, { FAST_MODEL } from '@/lib/groq'
import { runApiGuard } from '@/lib/api-guard'

export async function POST(req: NextRequest) {
  const limited = await runApiGuard(req, {
    rateLimitKey: 'ai-summarize',
    maxRequests: 15,
    windowMs: 60_000,
  })
  if (limited) return limited

  try {
    const { body } = await req.json()
    if (!body) return NextResponse.json({ error: 'Body is required' }, { status: 400 })

    const completion = await groq.chat.completions.create({
      model: FAST_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a concise summarizer. Return ONLY a JSON object with a "bullets" array of exactly 5 short bullet point strings summarizing the key points of the article. No markdown, no extra text.',
        },
        {
          role: 'user',
          content: `Summarize this article in 5 key bullet points:\n\n${body.slice(0, 4000)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 512,
      response_format: { type: 'json_object' },
    })

    const text = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(text)
    const bullets: string[] = Array.isArray(parsed.bullets) ? parsed.bullets : []

    return NextResponse.json({ bullets })
  } catch (err) {
    console.error('AI summarize error:', err)
    return NextResponse.json({ error: 'Failed to summarize' }, { status: 500 })
  }
}
