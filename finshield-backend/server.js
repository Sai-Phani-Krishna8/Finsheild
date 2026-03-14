import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import riskRouter from './routes/risk.js'
import affidavitRouter from './routes/affidavit.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
}))
app.use(express.json())

// Routes
app.use('/api/risk', riskRouter)
app.use('/api/fraud', affidavitRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'FinShield backend running ✅' })
})

app.listen(PORT, () => {
  console.log(`✅ FinShield backend running on http://localhost:${PORT}`)
})