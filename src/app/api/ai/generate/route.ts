import { NextRequest, NextResponse } from 'next/server'
import groq, { SMART_MODEL } from '@/lib/groq'
import { runApiGuard } from '@/lib/api-guard'

export async function POST(req: NextRequest) {
  const blocked = await runApiGuard(req, {
    requireAuth: true,
    rateLimitKey: 'ai-generate',
    maxRequests: 10,
    windowMs: 60_000,
  })
  if (blocked) return blocked

  try {
    const { topic, category, tone, length } = await req.json()
    if (!topic) return NextResponse.json({ error: 'Topic is required' }, { status: 400 })

    const wordTargets: Record<string, string> = {
      short: '300-400 words',
      medium: '600-800 words',
      long: '1000-1200 words',
    }
    const wordTarget = wordTargets[length] ?? '600-800 words'

    const completion = await groq.chat.completions.create({
      model: SMART_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a professional journalist and blogger. Return ONLY a JSON object with this exact shape:
{
  "title": "compelling article headline",
  "body": "full article text with paragraphs separated by newlines (${wordTarget})",
  "excerpt": "2-3 sentence compelling summary (max 200 chars)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}
Write in ${tone || 'professional'} tone for the ${category || 'General'} category. Make it informative, well-structured, and engaging. No markdown formatting in body, just plain paragraphs. No extra text outside the JSON.`,
        },
        {
          role: 'user',
          content: `Write a complete blog article about: ${topic}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    })

    const text = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(text)
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('AI generate error:', err)
    return NextResponse.json({ error: 'Failed to generate article' }, { status: 500 })
  }
}
