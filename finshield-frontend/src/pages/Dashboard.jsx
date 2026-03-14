import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { mockActivities, simulatedAlerts, getStatusCounts } from '../data/mockActivities.js'

// ── Web Audio beep (no file needed) ──────────────────────
function playAlertBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, ctx.currentTime)
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1)
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.4)
  } catch (e) {
    // silently fail if audio not supported
  }
}

// ── Browser push notification ─────────────────────────────
function sendBrowserNotification(activity) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') {
    new Notification('🔴 FinShield Alert', {
      body: `${activity.type}: ${activity.description.slice(0, 80)}...`,
      icon: '/vite.svg',
    })
  }
}

// ── Status badge pill ─────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span className={`
      text-xs font-bold px-2.5 py-1 rounded-full
      ${status === 'SUSPICIOUS'
        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
      }
    `}>
      {status}
    </span>
  )
}

// ── Type badge ────────────────────────────────────────────
function TypeBadge({ type }) {
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-700 text-slate-300">
      {type}
    </span>
  )
}

// ── Single activity card ──────────────────────────────────
function ActivityCard({ activity, isNew }) {
  const isSuspicious = activity.status === 'SUSPICIOUS'
  return (
    <div className={`
      bg-slate-900 rounded-xl border border-slate-700 p-4
      border-l-4 transition-all duration-300
      ${isSuspicious ? 'border-l-red-500' : 'border-l-emerald-500'}
      ${isNew ? 'animate-slide-in' : ''}
    `}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <TypeBadge type={activity.type} />
            {isNew && (
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-600 text-white animate-pulse">
                NEW
              </span>
            )}
          </div>
          <p className="text-white text-sm leading-relaxed mb-2">
            {activity.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>📍 {activity.source}</span>
            <span>🕐 {activity.timestamp}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={activity.status} />
        </div>
      </div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex-1 min-w-0">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────
export default function Dashboard() {
  const [activities, setActivities] = useState(
    mockActivities.map(a => ({ ...a, isNew: false }))
  )
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const [monitorSeconds, setMonitorSeconds] = useState(0)
  const [isPolling, setIsPolling] = useState(true)
  const alertIndexRef = useRef(0)
  const nextId = useRef(mockActivities.length + 1)

  // ── Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(perm => {
        setNotifPermission(perm)
      })
    }
  }, [])

  // ── Monitoring timer
  useEffect(() => {
    const timer = setInterval(() => {
      setMonitorSeconds(s => s + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // ── Format timer display
  const formatTime = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0')
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  // ── Add a new alert card
  const addAlert = useCallback((auto = false) => {
    const alert = simulatedAlerts[alertIndexRef.current % simulatedAlerts.length]
    alertIndexRef.current += 1

    const newActivity = {
      ...alert,
      id: nextId.current++,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit',
      }),
      isNew: true,
    }

    setActivities(prev => [newActivity, ...prev])

    // Play beep
    playAlertBeep()

    // Browser notification
    sendBrowserNotification(newActivity)

    // Toast
    if (newActivity.status === 'SUSPICIOUS') {
      toast.error(`🔴 ${newActivity.type} — ${newActivity.source}`, {
        duration: 5000,
      })
    } else {
      toast.success(`🟢 ${newActivity.type} — ${newActivity.source}`, {
        duration: 3000,
      })
    }

    // Remove NEW badge after 4 seconds
    setTimeout(() => {
      setActivities(prev =>
        prev.map(a => a.id === newActivity.id ? { ...a, isNew: false } : a)
      )
    }, 4000)
  }, [])

  // ── Auto-polling every 30 seconds
  useEffect(() => {
    if (!isPolling) return
    const interval = setInterval(() => {
      addAlert(true)
    }, 30000)
    return () => clearInterval(interval)
  }, [isPolling, addAlert])

  const counts = getStatusCounts(activities)

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold">Live PAN Activity Feed</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Real-time monitoring of your PAN card usage across financial systems
          </p>
        </div>

        {/* Monitoring badge */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 text-sm font-medium">
            Monitoring {formatTime(monitorSeconds)}
          </span>
        </div>
      </div>

      {/* Notification permission warning */}
      {notifPermission === 'denied' && (
        <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-400 text-sm">
          ⚠️ Browser notifications are blocked. Enable them in browser settings to receive alerts.
        </div>
      )}

      {/* Stat bar */}
      <div className="flex gap-3 mb-6">
        <StatCard label="Total Events"    value={counts.total}      color="text-white" />
        <StatCard label="Suspicious"      value={counts.suspicious} color="text-red-400" />
        <StatCard label="Normal"          value={counts.normal}     color="text-emerald-400" />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={() => addAlert(false)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
        >
          <span>⚡</span> Simulate Live Alert
        </button>

        <button
          onClick={() => setIsPolling(p => !p)}
          className={`font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2 border
            ${isPolling
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
            }`}
        >
          <span>{isPolling ? '🟢' : '⏸️'}</span>
          {isPolling ? 'Auto-polling ON' : 'Auto-polling OFF'}
        </button>
      </div>

      {/* Activity cards */}
      <div className="flex flex-col gap-3">
        {activities.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isNew={activity.isNew}
          />
        ))}
      </div>

    </div>
  )
}