import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { mockActivities, simulatedAlerts, getStatusCounts } from '../data/mockActivities'

function playAlertBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4)
  } catch (e) {}
}

function sendBrowserNotification(activity) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') {
    new Notification('🔴 FinShield Alert', {
      body: `${activity.type}: ${activity.description.slice(0, 80)}...`,
    })
  }
}

const typeIcons = {
  'Company Registration': '🏢', 'Loan Inquiry': '💳',
  'ITR Filing': '📋', 'GST Registration': '🧾',
  'KYC Verification': '🔐', 'Credit Card Application': '💳',
  'Aadhaar-PAN Link': '🔗', 'Property Registration': '🏠',
  'Mutual Fund KYC': '📈', 'Bank Account Opening': '🏦',
}

function StatCard({ label, value, color, icon, sub, topColor }) {
  return (
    <div
      className="stat-card"
      style={{
        flex: 1, background: 'rgba(255,255,255,0.02)',
        border: '1px solid #0a2a1a', borderRadius: '14px',
        padding: '16px 18px', position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: topColor, boxShadow: `0 0 10px ${topColor}` }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color }}>
          {label}
        </span>
        <span
          className="stat-icon-box"
          style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: `${topColor}12`, border: `1px solid ${topColor}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', transition: 'transform 0.25s',
          }}
        >{icon}</span>
      </div>
      <p style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '32px', fontWeight: 900, color, textShadow: `0 0 14px ${topColor}60`, lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color, opacity: 0.5, marginTop: '5px' }}>{sub}</p>
    </div>
  )
}

function ActivityCard({ activity, isNew }) {
  const isSuspicious = activity.status === 'SUSPICIOUS'
  const icon = typeIcons[activity.type] || '📌'
  const color = isSuspicious ? '#ff4444' : '#00ff88'

  return (
    <div
      className={`activity-card ${isSuspicious ? 'suspicious-card' : 'normal-card'} ${isNew ? 'animate-slide-in' : ''}`}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid #0a2a1a`,
        borderLeft: `2px solid ${color}`,
        borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
        borderTopRightRadius: '14px', borderBottomRightRadius: '14px',
        padding: '16px 18px',
        display: 'flex', alignItems: 'flex-start', gap: '14px',
      }}
    >
      <div
        className="card-icon-box"
        style={{
          width: '38px', height: '38px', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', flexShrink: 0,
          background: isSuspicious ? 'rgba(255,68,68,0.08)' : 'rgba(0,255,136,0.06)',
          border: `1px solid ${isSuspicious ? 'rgba(255,68,68,0.25)' : 'rgba(0,255,136,0.25)'}`,
          transition: 'transform 0.25s',
        }}
      >{icon}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px', flexWrap: 'wrap' }}>
          <span
            className="type-badge"
            style={{
              fontFamily: "'Rajdhani',sans-serif", fontSize: '11px', fontWeight: 700,
              color: '#2d6a4f', background: 'rgba(0,255,136,0.04)',
              padding: '3px 10px', borderRadius: '5px',
              border: '1px solid #0a2a1a', letterSpacing: '0.05em',
              transition: 'all 0.25s',
            }}
          >{activity.type.toUpperCase()}</span>
          {isNew && (
            <span style={{
              fontFamily: "'Rajdhani',sans-serif", fontSize: '10px', fontWeight: 700,
              color: '#00ff88', background: 'rgba(0,255,136,0.08)',
              padding: '3px 9px', borderRadius: '5px',
              border: '1px solid rgba(0,255,136,0.35)',
              letterSpacing: '0.06em', animation: 'blink 2s infinite',
            }}>● NEW</span>
          )}
        </div>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#52b788', lineHeight: 1.6, marginBottom: '7px' }}>
          {activity.description}
        </p>
        <div style={{ display: 'flex', gap: '16px', fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#1a4d2e', fontWeight: 500 }}>
          <span>📍 {activity.source}</span>
          <span>🕐 {activity.timestamp}</span>
        </div>
      </div>

      <span style={{
        fontFamily: "'Rajdhani',sans-serif", fontSize: '11px', fontWeight: 700,
        padding: '4px 12px', borderRadius: '20px', flexShrink: 0,
        letterSpacing: '0.08em', marginTop: '2px',
        background: isSuspicious ? 'rgba(255,68,68,0.08)' : 'rgba(0,255,136,0.06)',
        color: isSuspicious ? '#ff6b6b' : '#00ff88',
        border: `1px solid ${isSuspicious ? 'rgba(255,68,68,0.25)' : 'rgba(0,255,136,0.25)'}`,
      }}>{activity.status}</span>
    </div>
  )
}

export default function Dashboard() {
  const [activities, setActivities] = useState(mockActivities.map(a => ({ ...a, isNew: false })))
  const [monitorSeconds, setMonitorSeconds] = useState(0)
  const [isPolling, setIsPolling] = useState(true)
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const alertIndexRef = useRef(0)
  const nextId = useRef(mockActivities.length + 1)

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(p => setNotifPermission(p))
    }
  }, [])

  useEffect(() => {
    const t = setInterval(() => setMonitorSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const formatTime = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0')
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
    const sec = String(s % 60).padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  const addAlert = useCallback(() => {
    const alert = simulatedAlerts[alertIndexRef.current % simulatedAlerts.length]
    alertIndexRef.current += 1
    const newActivity = {
      ...alert, id: nextId.current++, isNew: true,
      timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    }
    setActivities(prev => [newActivity, ...prev])
    playAlertBeep()
    sendBrowserNotification(newActivity)
    if (newActivity.status === 'SUSPICIOUS') {
      toast.error(`🔴 ${newActivity.type} — ${newActivity.source}`, { duration: 5000 })
    } else {
      toast.success(`🟢 ${newActivity.type} — ${newActivity.source}`, { duration: 3000 })
    }
    setTimeout(() => {
      setActivities(prev => prev.map(a => a.id === newActivity.id ? { ...a, isNew: false } : a))
    }, 4000)
  }, [])

  useEffect(() => {
    if (!isPolling) return
    const interval = setInterval(() => addAlert(), 30000)
    return () => clearInterval(interval)
  }, [isPolling, addAlert])

  const counts = getStatusCounts(activities)

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '2px', textTransform: 'uppercase', textShadow: '0 0 20px rgba(0,255,136,0.2)' }}>
            Live PAN Activity
          </h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#2d6a4f', marginTop: '5px' }}>
            Real-time monitoring across all financial systems in India
          </p>
        </div>
        <div
          className="monitor-pill-hover"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,255,136,0.05)',
            border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: '20px', padding: '8px 16px',
            boxShadow: '0 0 12px rgba(0,255,136,0.08)',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px #00ff88', animation: 'blink 1.5s infinite', display: 'inline-block' }} />
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '13px', color: '#00ff88', fontWeight: 700, letterSpacing: '0.06em' }}>
            MONITORING {formatTime(monitorSeconds)}
          </span>
        </div>
      </div>

      {/* Notification warning */}
      {notifPermission === 'denied' && (
        <div style={{ marginBottom: '16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', padding: '12px 16px' }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#fbbf24' }}>
            ⚠️ Browser notifications blocked. Enable in browser settings to receive alerts.
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <StatCard label="Total Events"  value={counts.total}      color="#00ff88" icon="📊" sub="↑ 2 new today"    topColor="#00ff88" />
        <StatCard label="Suspicious"    value={counts.suspicious} color="#ff6b6b" icon="🚨" sub="Needs attention"  topColor="#ff4444" />
        <StatCard label="Normal"        value={counts.normal}     color="#00ccff" icon="✅" sub="Verified safe"    topColor="#00ccff" />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => addAlert()} className="btn-neon-red" style={{ padding: '10px 20px', borderRadius: '9px' }}>
          ⚡ SIMULATE LIVE ALERT
        </button>
        <button onClick={() => setIsPolling(p => !p)} className="btn-neon-green" style={{ padding: '10px 20px', borderRadius: '9px' }}>
          {isPolling ? '● AUTO-POLLING ON' : '○ AUTO-POLLING OFF'}
        </button>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {activities.map(activity => (
          <ActivityCard key={activity.id} activity={activity} isNew={activity.isNew} />
        ))}
      </div>
    </div>
  )
}