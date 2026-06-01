import { NextRequest, NextResponse } from 'next/server'
import groq, { SMART_MODEL } from '@/lib/groq'
import { runApiGuard } from '@/lib/api-guard'

const TONE_DESCRIPTIONS: Record<string, string> = {
  professional: 'formal, authoritative, business-like language suitable for professional publications',
  casual: 'friendly, conversational, approachable tone like talking to a friend',
  academic: 'scholarly, precise, objective language with formal vocabulary',
  persuasive: 'compelling, emotionally engaging, action-oriented language',
  simple: 'plain English, short sentences, easy to understand for a general audience',
  bold: 'confident, punchy, direct statements with strong assertions',
}

export async function POST(req: NextRequest) {
  const blocked = await runApiGuard(req, {
    requireAuth: true,
    rateLimitKey: 'ai-rewrite',
    maxRequests: 20,
    windowMs: 60_000,
  })
  if (blocked) return blocked

  try {
    const { text, tone } = await req.json()
    if (!text || !tone) return NextResponse.json({ error: 'Text and tone are required' }, { status: 400 })

    const toneDesc = TONE_DESCRIPTIONS[tone] ?? tone

    const completion = await groq.chat.completions.create({
      model: SMART_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a professional writing editor. Return ONLY a JSON object with a "rewritten" string containing the rewritten text. Preserve the original meaning and information completely, but use ${toneDesc}. No markdown, no extra text.`,
        },
        {
          role: 'user',
          content: `Rewrite this text in ${tone} tone:\n\n${text.slice(0, 3000)}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(responseText)
    return NextResponse.json({ rewritten: parsed.rewritten ?? '' })
  } catch (err) {
    console.error('AI rewrite error:', err)
    return NextResponse.json({ error: 'Failed to rewrite' }, { status: 500 })
  }
}
