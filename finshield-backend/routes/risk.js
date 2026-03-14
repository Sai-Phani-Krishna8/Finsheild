import express from 'express'
import Groq from 'groq-sdk'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

router.post('/analyze', async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const { activities } = req.body

    const activitiesSummary = activities.map(a =>
      `- ${a.type} (${a.status}): ${a.description} [Source: ${a.source}]`
    ).join('\n')

    const prompt = `
You are a financial fraud detection AI for India.
Analyze the following PAN card activity log and return a risk assessment.

ACTIVITY LOG:
${activitiesSummary}

Return ONLY a valid JSON object in this exact format, nothing else:
{
  "score": <number between 0-100>,
  "level": "<LOW or MEDIUM or HIGH or CRITICAL>",
  "reasons": [
    "<reason 1>",
    "<reason 2>",
    "<reason 3>"
  ],
  "recommendation": "<one clear action the person should take>"
}

Rules:
- score 0-40 = LOW (green)
- score 41-70 = MEDIUM (amber)
- score 71-85 = HIGH (red)
- score 86-100 = CRITICAL (dark red)
- Base score on number of suspicious activities, types of fraud, and severity
- reasons must be exactly 3 specific observations from the activity log
- recommendation must be one concrete action
`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 500,
    })

    const raw = completion.choices[0]?.message?.content || ''

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Invalid AI response' })
    }

    const result = JSON.parse(jsonMatch[0])
    res.json(result)

  } catch (err) {
    console.error('Risk analyze error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router