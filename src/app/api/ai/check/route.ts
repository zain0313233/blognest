import { NextRequest, NextResponse } from 'next/server'
import groq, { SMART_MODEL } from '@/lib/groq'
import { runApiGuard } from '@/lib/api-guard'

export async function POST(req: NextRequest) {
  const blocked = await runApiGuard(req, {
    requireAuth: true,
    rateLimitKey: 'ai-check',
    maxRequests: 20,
    windowMs: 60_000,
  })
  if (blocked) return blocked

  try {
    const { body } = await req.json()
    if (!body) return NextResponse.json({ error: 'Body is required' }, { status: 400 })

    const completion = await groq.chat.completions.create({
      model: SMART_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a professional writing coach. Analyze the given text and return ONLY a JSON object with this exact shape:
{
  "overallScore": number (0-100),
  "tone": string (e.g. "Informative", "Casual", "Academic", "Persuasive"),
  "readability": string (e.g. "Easy", "Moderate", "Advanced"),
  "issues": [
    { "type": "grammar|clarity|tone|structure", "text": "quoted problem text (short)", "suggestion": "how to fix it" }
  ],
  "strengths": ["strength 1", "strength 2"],
  "summary": "One sentence overall assessment"
}
Return at most 5 issues. No markdown, no extra text.`,
        },
        {
          role: 'user',
          content: `Analyze this article for grammar, clarity, tone and writing quality:\n\n${body.slice(0, 4000)}`,
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
    console.error('AI check error:', err)
    return NextResponse.json({ error: 'Failed to check writing' }, { status: 500 })
  }
}
