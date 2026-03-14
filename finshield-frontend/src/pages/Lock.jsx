import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Lock() {
  const [locked, setLocked] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState('')
  const [lastAction, setLastAction] = useState(null)

  const getTimestamp = () =>
    new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })

  const handleLock = () => {
    setLocked(true); setShowOtp(false); setOtp('')
    setLastAction(getTimestamp())
    toast.error('🔴 PAN Locked! All financial activities blocked.', { duration: 4000 })
  }

  const handleOtpConfirm = () => {
    if (otp === '1234') {
      setLocked(false); setShowOtp(false); setOtp('')
      setLastAction(getTimestamp())
      toast.success('🟢 PAN Unlocked! Financial activities resumed.', { duration: 4000 })
    } else {
      toast.error('❌ Wrong OTP! Try again.', { duration: 3000 })
      setOtp('')
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Locked ribbon */}
      {locked && (
        <div style={{
          width: '100%', background: 'rgba(255,68,68,0.12)',
          borderBottom: '1px solid rgba(255,68,68,0.35)',
          padding: '10px', textAlign: 'center',
          boxShadow: '0 0 20px rgba(255,68,68,0.15)',
        }}>
          <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '13px', fontWeight: 700, color: '#ff6b6b', letterSpacing: '0.1em', animation: 'blink 1.5s infinite' }}>
            🔴 PAN IS LOCKED — ALL FINANCIAL ACTIVITIES ARE BLOCKED
          </p>
        </div>
      )}

      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '2px', textTransform: 'uppercase', textShadow: '0 0 20px rgba(0,255,136,0.2)' }}>
            Identity Lock
          </h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#2d6a4f', marginTop: '5px' }}>
            Instantly freeze your PAN card from being used anywhere
          </p>
        </div>

        {/* Main card */}
        <div className="cyber-card" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

          {/* Shield */}
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '52px', marginBottom: '24px',
            background: locked ? 'rgba(255,68,68,0.08)' : 'rgba(0,255,136,0.06)',
            border: `3px solid ${locked ? '#ff4444' : '#00ff88'}`,
            boxShadow: locked
              ? '0 0 30px rgba(255,68,68,0.3), inset 0 0 20px rgba(255,68,68,0.05)'
              : '0 0 30px rgba(0,255,136,0.3), inset 0 0 20px rgba(0,255,136,0.05)',
            transition: 'all 0.5s ease',
          }}>
            {locked ? '🔒' : '🛡️'}
          </div>

          {/* Status */}
          <h2 style={{
            fontFamily: "'Orbitron',sans-serif", fontSize: '20px', fontWeight: 900,
            letterSpacing: '2px', marginBottom: '10px',
            color: locked ? '#ff6b6b' : '#00ff88',
            textShadow: locked ? '0 0 14px rgba(255,68,68,0.5)' : '0 0 14px rgba(0,255,136,0.5)',
          }}>
            {locked ? 'PAN LOCKED' : 'PAN ACTIVE'}
          </h2>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '13px', color: '#2d6a4f', marginBottom: '32px', maxWidth: '340px', lineHeight: 1.7 }}>
            {locked
              ? 'Your PAN card is frozen. No financial activity can be performed using your PAN.'
              : 'Your PAN card is active. Lock it immediately if you suspect any misuse.'
            }
          </p>

          {/* Button */}
          {!locked ? (
            <button onClick={handleLock} className="btn-neon-red" style={{ padding: '12px 32px', borderRadius: '10px', fontSize: '15px' }}>
              🔒 LOCK MY PAN NOW
            </button>
          ) : (
            <button onClick={() => { setShowOtp(true); setOtp('') }} className="btn-neon-green" style={{ padding: '12px 32px', borderRadius: '10px', fontSize: '15px' }}>
              🔓 UNLOCK PAN
            </button>
          )}

          {/* OTP */}
          {showOtp && (
            <div className="animate-slide-in" style={{ marginTop: '24px', width: '100%', maxWidth: '320px' }}>
              <div style={{
                background: 'rgba(0,255,136,0.03)',
                border: '1px solid rgba(0,255,136,0.2)',
                borderRadius: '12px', padding: '20px',
                boxShadow: '0 0 20px rgba(0,255,136,0.05)',
              }}>
                <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '13px', fontWeight: 700, color: '#00ff88', marginBottom: '4px', letterSpacing: '0.05em' }}>
                  ENTER OTP TO UNLOCK
                </p>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#1a4d2e', marginBottom: '16px' }}>
                  OTP sent to your registered mobile number
                </p>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleOtpConfirm()}
                  maxLength={4}
                  placeholder="• • • •"
                  className="otp-input"
                  style={{
                    width: '100%',
                    background: 'rgba(0,255,136,0.04)',
                    border: '1px solid rgba(0,255,136,0.2)',
                    borderRadius: '8px', color: '#00ff88',
                    textAlign: 'center',
                    fontSize: '24px',
                    fontFamily: "'Orbitron',sans-serif",
                    fontWeight: 700, letterSpacing: '0.3em',
                    padding: '12px', marginBottom: '14px',
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleOtpConfirm} className="btn-neon-green" style={{ flex: 1, padding: '10px', borderRadius: '8px', justifyContent: 'center' }}>
                    CONFIRM
                  </button>
                  <button onClick={() => { setShowOtp(false); setOtp('') }} className="btn-ghost" style={{ flex: 1, padding: '10px', borderRadius: '8px', justifyContent: 'center' }}>
                    CANCEL
                  </button>
                </div>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#1a4d2e', textAlign: 'center', marginTop: '12px' }}>
                  💡 Demo OTP: <span style={{ color: '#00ff88', fontFamily: "'Orbitron',sans-serif", fontWeight: 700 }}>1234</span>
                </p>
              </div>
            </div>
          )}

          {lastAction && (
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#1a4d2e', marginTop: '20px' }}>
              Last action: {lastAction}
            </p>
          )}
        </div>

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginTop: '16px' }}>
          {[
            { icon: '⚡', title: 'Instant Lock', sub: 'Takes effect in under 2 seconds' },
            { icon: '🏦', title: 'All Systems', sub: 'Banks, MCA21, GST, IT Portal' },
            { icon: '🔐', title: 'OTP Protected', sub: 'Only you can unlock with OTP' },
          ].map(item => (
            <div key={item.title} className="cyber-card" style={{ padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '22px', marginBottom: '8px' }}>{item.icon}</p>
              <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '13px', fontWeight: 700, color: '#00ff88', letterSpacing: '0.05em', marginBottom: '4px' }}>{item.title}</p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#1a4d2e', lineHeight: 1.5 }}>{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}