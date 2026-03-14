import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { mockActivities } from '../data/mockActivities'

function getColor(score) {
  if (score <= 40) return '#00ff88'
  if (score <= 70) return '#f59e0b'
  if (score <= 85) return '#ff4444'
  return '#ff0000'
}

function RiskGauge({ score, level }) {
  const r = 80
  const circ = 2 * Math.PI * r
  const color = getColor(score)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative' }}>
        <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="100" cy="100" r={r} fill="none" stroke="#0a2a1a" strokeWidth="14" />
          <circle cx="100" cy="100" r={r} fill="none" stroke={color} strokeWidth="14"
            strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s ease-in-out', filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '42px', fontWeight: 900, color, textShadow: `0 0 20px ${color}80`, lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#2d6a4f', marginTop: '2px' }}>/100</span>
        </div>
      </div>
      <div style={{
        marginTop: '12px', padding: '5px 20px', borderRadius: '20px',
        border: `1px solid ${color}40`, background: `${color}10`,
        boxShadow: `0 0 12px ${color}20`,
      }}>
        <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '14px', fontWeight: 700, color, letterSpacing: '0.1em' }}>
          {level} RISK
        </span>
      </div>
    </div>
  )
}

export default function Risk() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [error, setError] = useState(null)

  const animateScore = (target) => {
    let current = 0
    const step = target / 60
    const timer = setInterval(() => {
      current += step
      if (current >= target) { current = target; clearInterval(timer) }
      setAnimatedScore(Math.round(current))
    }, 25)
  }

  const handleAnalyze = async () => {
    setLoading(true); setResult(null); setAnimatedScore(0); setError(null)
    try {
      const res = await api.post('/api/risk/analyze', { activities: mockActivities })
      setResult(res.data)
      animateScore(res.data.score)
      toast.success('✅ Risk analysis complete!', { duration: 3000 })
    } catch {
      setError('Failed to connect. Make sure backend is running on port 5000.')
      toast.error('❌ Analysis failed.', { duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '2px', textTransform: 'uppercase', textShadow: '0 0 20px rgba(0,255,136,0.2)' }}>
          AI Risk Score
        </h1>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#2d6a4f', marginTop: '5px' }}>
          Groq AI analyzes your PAN activity pattern and calculates fraud risk
        </p>
      </div>

      {!result && !loading && (
        <div className="cyber-card" style={{ padding: '40px 32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(99,102,241,0.08)', border: '2px solid rgba(99,102,241,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '36px', marginBottom: '20px',
              boxShadow: '0 0 20px rgba(99,102,241,0.2)',
            }}>🧠</div>
            <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '14px', fontWeight: 900, color: '#fff', letterSpacing: '1px', marginBottom: '12px' }}>
              HOW IT WORKS
            </h2>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#2d6a4f', maxWidth: '400px', lineHeight: 1.7 }}>
              Our AI analyzes all your PAN card activity — suspicious events, fraud types,
              sources involved — and calculates a risk score from 0 to 100.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '32px' }}>
            {[
              { range: '0–40',   label: 'LOW',      color: '#00ff88' },
              { range: '41–70',  label: 'MEDIUM',   color: '#f59e0b' },
              { range: '71–85',  label: 'HIGH',     color: '#ff4444' },
              { range: '86–100', label: 'CRITICAL', color: '#ff0000' },
            ].map(item => (
              <div key={item.label} style={{
                background: `${item.color}08`, border: `1px solid ${item.color}30`,
                borderRadius: '10px', padding: '12px', textAlign: 'center',
              }}>
                <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '13px', fontWeight: 700, color: item.color, letterSpacing: '0.06em' }}>{item.label}</p>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#1a4d2e', marginTop: '3px' }}>{item.range}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={handleAnalyze} className="btn-neon-indigo" style={{ padding: '12px 40px', borderRadius: '10px', fontSize: '15px' }}>
              🧠 ANALYZE MY RISK
            </button>
          </div>

          {error && (
            <div style={{ marginTop: '16px', background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '10px', padding: '12px 16px' }}>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#ff6b6b', textAlign: 'center' }}>⚠️ {error}</p>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="cyber-card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '60px', height: '60px',
            border: '3px solid rgba(99,102,241,0.2)',
            borderTop: '3px solid #a5b4fc',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px',
            boxShadow: '0 0 20px rgba(99,102,241,0.3)',
          }} />
          <p style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>ANALYZING RISK...</p>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#2d6a4f', marginTop: '8px' }}>Groq AI is processing your activity pattern</p>
        </div>
      )}

      {result && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-slide-in">
          <div className="cyber-card" style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
            <RiskGauge score={animatedScore} level={result.level} />
          </div>
          <div className="cyber-card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '12px', fontWeight: 700, color: '#00ff88', letterSpacing: '1px', marginBottom: '16px' }}>
              🔍 WHY THIS SCORE?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {result.reasons.map((reason, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.3)',
                    color: '#ff6b6b', fontSize: '11px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Orbitron',sans-serif", fontWeight: 700,
                  }}>{i + 1}</span>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#52b788', lineHeight: 1.6 }}>{reason}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '14px', padding: '24px' }}>
            <h3 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '12px', fontWeight: 700, color: '#a5b4fc', letterSpacing: '1px', marginBottom: '10px' }}>
              💡 AI RECOMMENDATION
            </h3>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#818cf8', lineHeight: 1.7 }}>{result.recommendation}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => { setResult(null); setAnimatedScore(0); setError(null) }}
              className="btn-ghost"
              style={{ padding: '10px 28px', borderRadius: '10px' }}
            >🔄 RE-ANALYZE</button>
          </div>
        </div>
      )}
    </div>
  )
}