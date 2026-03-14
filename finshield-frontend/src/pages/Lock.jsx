import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Lock() {
  const [locked, setLocked] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState('')
  const [lastAction, setLastAction] = useState(null)

  const getTimestamp = () =>
    new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

  const handleLock = () => {
    setLocked(true)
    setShowOtp(false)
    setOtp('')
    setLastAction(getTimestamp())
    toast.error('🔴 PAN Locked! All financial activities blocked.', {
      duration: 4000,
    })
  }

  const handleUnlockClick = () => {
    setShowOtp(true)
    setOtp('')
  }

  const handleOtpConfirm = () => {
    if (otp === '1234') {
      setLocked(false)
      setShowOtp(false)
      setOtp('')
      setLastAction(getTimestamp())
      toast.success('🟢 PAN Unlocked! Financial activities resumed.', {
        duration: 4000,
      })
    } else {
      toast.error('❌ Wrong OTP! Try again.', {
        duration: 3000,
      })
      setOtp('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Red ribbon when locked */}
      {locked && (
        <div className="w-full bg-red-600 text-white text-center py-2.5 text-sm font-bold tracking-wide animate-pulse">
          🔴 PAN IS LOCKED — ALL FINANCIAL ACTIVITIES ARE BLOCKED
        </div>
      )}

      <div className="p-6 max-w-2xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold">Identity Lock</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Instantly freeze your PAN card from being used anywhere
          </p>
        </div>

        {/* Main lock card */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 flex flex-col items-center text-center">

          {/* Shield icon */}
          <div className={`
            w-32 h-32 rounded-full flex items-center justify-center text-6xl mb-6
            transition-all duration-500
            ${locked
              ? 'bg-red-500/20 border-4 border-red-500 shadow-lg shadow-red-500/20'
              : 'bg-emerald-500/20 border-4 border-emerald-500 shadow-lg shadow-emerald-500/20'
            }
          `}>
            {locked ? '🔒' : '🛡️'}
          </div>

          {/* Status text */}
          <h2 className={`text-2xl font-bold mb-2 ${locked ? 'text-red-400' : 'text-emerald-400'}`}>
            {locked ? 'PAN is Locked' : 'PAN is Active'}
          </h2>
          <p className="text-slate-400 text-sm mb-8 max-w-sm">
            {locked
              ? 'Your PAN card is currently frozen. No one can use it for any financial activity.'
              : 'Your PAN card is active. Click below to lock it immediately if you suspect misuse.'
            }
          </p>

          {/* Lock button */}
          {!locked ? (
            <button
              onClick={handleLock}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-base flex items-center gap-2"
            >
              🔒 Lock My PAN Now
            </button>
          ) : (
            <button
              onClick={handleUnlockClick}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-base flex items-center gap-2"
            >
              🔓 Unlock PAN
            </button>
          )}

          {/* Inline OTP input */}
          {showOtp && (
            <div className="mt-6 w-full max-w-sm animate-slide-in">
              <div className="bg-slate-800 border border-slate-600 rounded-xl p-5">
                <p className="text-white text-sm font-semibold mb-1">
                  Enter OTP to unlock
                </p>
                <p className="text-slate-400 text-xs mb-4">
                  OTP sent to your registered mobile number
                </p>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleOtpConfirm()}
                  maxLength={4}
                  placeholder="Enter 4-digit OTP"
                  className="w-full bg-slate-700 border border-slate-600 text-white text-center text-xl font-bold tracking-widest rounded-lg px-4 py-3 mb-4 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleOtpConfirm}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    Confirm OTP
                  </button>
                  <button
                    onClick={() => { setShowOtp(false); setOtp('') }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                {/* Demo hint */}
                <p className="text-slate-500 text-xs text-center mt-3">
                  💡 Demo OTP is <span className="text-indigo-400 font-bold">1234</span>
                </p>
              </div>
            </div>
          )}

          {/* Last action timestamp */}
          {lastAction && (
            <p className="text-slate-500 text-xs mt-6">
              Last action: {lastAction}
            </p>
          )}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-2xl mb-2">⚡</p>
            <p className="text-white text-sm font-semibold">Instant Lock</p>
            <p className="text-slate-400 text-xs mt-1">Takes effect in under 2 seconds</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-2xl mb-2">🏦</p>
            <p className="text-white text-sm font-semibold">All Systems</p>
            <p className="text-slate-400 text-xs mt-1">Banks, MCA21, GST, IT Portal</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-2xl mb-2">🔐</p>
            <p className="text-white text-sm font-semibold">OTP Protected</p>
            <p className="text-slate-400 text-xs mt-1">Only you can unlock with OTP</p>
          </div>
        </div>

      </div>
    </div>
  )
}