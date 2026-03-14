import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { mockActivities } from '../data/mockActivities'

function getGaugeColor(score) {
  if (score <= 40) return '#10b981'
  if (score <= 70) return '#f59e0b'
  if (score <= 85) return '#ef4444'
  return '#7f1d1d'
}

function getLevelColor(level) {
  switch (level) {
    case 'LOW':      return 'text-emerald-400'
    case 'MEDIUM':   return 'text-amber-400'
    case 'HIGH':     return 'text-red-400'
    case 'CRITICAL': return 'text-red-600'
    default:         return 'text-white'
  }
}

function getLevelBg(level) {
  switch (level) {
    case 'LOW':      return 'bg-emerald-500/20 border-emerald-500/30'
    case 'MEDIUM':   return 'bg-amber-500/20 border-amber-500/30'
    case 'HIGH':     return 'bg-red-500/20 border-red-500/30'
    case 'CRITICAL': return 'bg-red-900/40 border-red-700/50'
    default:         return 'bg-slate-700 border-slate-600'
  }
}

function RiskGauge({ score, level }) {
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color = getGaugeColor(score)

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="200" height="200" className="transform -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="16"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.5s ease-in-out, stroke 0.5s ease',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold" style={{ color }}>
            {score}
          </span>
          <span className="text-slate-400 text-sm">/100</span>
        </div>
      </div>
      <div className={`
        mt-3 px-5 py-1.5 rounded-full border text-sm font-bold
        ${getLevelBg(level)} ${getLevelColor(level)}
      `}>
        {level} RISK
      </div>
    </div>
  )
}

export default function Risk() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [error, setError] = useState(null)

  const animateScore = (targetScore) => {
    let current = 0
    const step = targetScore / 60
    const timer = setInterval(() => {
      current += step
      if (current >= targetScore) {
        current = targetScore
        clearInterval(timer)
      }
      setAnimatedScore(Math.round(current))
    }, 25)
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setResult(null)
    setAnimatedScore(0)
    setError(null)

    try {
      const response = await api.post('/api/risk/analyze', {
        activities: mockActivities,
      })
      setResult(response.data)
      animateScore(response.data.score)
      toast.success('✅ Risk analysis complete!', { duration: 3000 })
    } catch (err) {
      console.error(err)
      setError('Failed to connect to AI. Make sure backend is running on port 5000.')
      toast.error('❌ Analysis failed. Check backend.', { duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setAnimatedScore(0)
    setError(null)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">AI Risk Score</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Groq AI analyzes your PAN activity pattern and calculates your fraud risk
        </p>
      </div>

      {!result && !loading && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-indigo-600/20 border-2 border-indigo-500/30 flex items-center justify-center text-4xl mb-4">
              🧠
            </div>
            <h2 className="text-white text-xl font-bold mb-3">How it works</h2>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Our AI analyzes all your PAN card activity — the number of suspicious events,
              types of fraud attempts, sources involved — and calculates a risk score from 0 to 100.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { range: '0 - 40',   label: 'LOW',      color: 'border-emerald-500 text-emerald-400' },
              { range: '41 - 70',  label: 'MEDIUM',   color: 'border-amber-500 text-amber-400' },
              { range: '71 - 85',  label: 'HIGH',     color: 'border-red-500 text-red-400' },
              { range: '86 - 100', label: 'CRITICAL', color: 'border-red-700 text-red-600' },
            ].map(item => (
              <div key={item.label} className={`bg-slate-800 border rounded-xl p-3 text-center ${item.color}`}>
                <p className="font-bold text-sm">{item.label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{item.range}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleAnalyze}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 py-4 rounded-xl transition-colors text-base flex items-center gap-3"
            >
              <span>🧠</span> Analyze My Risk
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
              ⚠️ {error}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-12 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-white font-semibold text-lg">Analyzing your risk...</p>
          <p className="text-slate-400 text-sm mt-2">Groq AI is processing your activity pattern</p>
        </div>
      )}

      {result && !loading && (
        <div className="flex flex-col gap-6 animate-slide-in">

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 flex flex-col items-center">
            <RiskGauge score={animatedScore} level={result.level} />
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <span>🔍</span> Why this score?
            </h3>
            <div className="flex flex-col gap-3">
              {result.reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                    {i + 1}
                  </span>
                  <p className="text-slate-300 text-sm leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-6">
            <h3 className="text-indigo-400 font-bold text-base mb-2 flex items-center gap-2">
              <span>💡</span> AI Recommendation
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {result.recommendation}
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-semibold px-8 py-3 rounded-xl transition-colors text-sm flex items-center gap-2"
            >
              🔄 Re-analyze
            </button>
          </div>

        </div>
      )}

    </div>
  )
}