import express from 'express'
import Groq from 'groq-sdk'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

router.post('/generate', async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const { fullName, panNumber, incidentDate, description } = req.body

    const prompt = `
You are a legal document drafting assistant specializing in Indian law.
Draft a formal affidavit for a PAN card fraud complaint.

Details:
- Full Name: ${fullName}
- PAN Number: ${panNumber}
- Incident Date: ${incidentDate}
- Incident Description: ${description}

Write a complete, formal Indian legal affidavit that includes:
1. Title: AFFIDAVIT
2. Declaration opening (I, ${fullName}, do hereby solemnly affirm...)
3. Numbered paragraphs describing the fraud incident
4. Specific mention of PAN misuse
5. Request for investigation and action
6. Verification clause at the end
7. Signature and date placeholders

Use formal legal language appropriate for Indian courts.
Write the complete affidavit text only — no explanations, no markdown, no extra commentary.
`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1500,
    })

    const affidavit = completion.choices[0]?.message?.content || ''
    res.json({ affidavit })

  } catch (err) {
    console.error('Affidavit error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router