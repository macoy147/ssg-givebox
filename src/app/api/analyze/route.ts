import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

interface SnapshotItem {
  id: string
  name: string
  category: string
  quantity: number
  status: string
}

interface ComparisonData {
  date: string
  morningTotal: number
  eveningTotal: number
  morningQuantity: number
  eveningQuantity: number
  added: SnapshotItem[]
  removed: SnapshotItem[]
  changed: { item: SnapshotItem; change: number }[]
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const data: ComparisonData = await request.json()

    const prompt = `You are an AI assistant for SSG GiveBox, a student donation inventory system at CTU Daanbantayan Campus. Analyze this daily inventory report and provide helpful insights.

DATE: ${data.date}

MORNING INVENTORY:
- Total item types: ${data.morningTotal}
- Total quantity: ${data.morningQuantity}

EVENING INVENTORY:
- Total item types: ${data.eveningTotal}
- Total quantity: ${data.eveningQuantity}

CHANGES TODAY:
${data.added.length > 0 ? `Items Added (${data.added.length}):
${data.added.map(i => `- ${i.name} (${i.category}): ${i.quantity} units`).join('\n')}` : 'No items added.'}

${data.removed.length > 0 ? `Items Removed/Claimed (${data.removed.length}):
${data.removed.map(i => `- ${i.name} (${i.category}): ${i.quantity} units`).join('\n')}` : 'No items removed.'}

${data.changed.length > 0 ? `Quantity Changes (${data.changed.length}):
${data.changed.map(c => `- ${c.item.name}: ${c.change > 0 ? '+' : ''}${c.change} units`).join('\n')}` : 'No quantity changes.'}

Please provide:
1. A brief summary of today's distribution activity (2-3 sentences)
2. Key insights about what categories were most popular
3. One actionable recommendation for the SSG team

Keep the response concise, friendly, and helpful. Use emojis sparingly. Response should be under 150 words.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          }
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Gemini API error:', error)
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
    }

    const result = await response.json()
    const analysis = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate analysis.'

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze data' }, { status: 500 })
  }
}