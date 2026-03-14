import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const inputStyle = (hasError) => ({
  width: '100%',
  background: 'rgba(0,255,136,0.03)',
  border: `1px solid ${hasError ? 'rgba(255,68,68,0.5)' : 'rgba(0,255,136,0.15)'}`,
  borderRadius: '9px', color: '#e2e8f0',
  fontSize: '13px', padding: '11px 14px',
  fontFamily: "'Inter',sans-serif",
  transition: 'all 0.2s',
})

export default function Report() {
  const [form, setForm] = useState({ fullName: '', panNumber: '', incidentDate: '', description: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [affidavit, setAffidavit] = useState(null)

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.panNumber.trim()) e.panNumber = 'PAN number is required'
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.toUpperCase())) e.panNumber = 'Invalid PAN format (e.g. ABCDE1234F)'
    if (!form.incidentDate) e.incidentDate = 'Incident date is required'
    if (!form.description.trim()) e.description = 'Description is required'
    else if (form.description.trim().length < 20) e.description = 'Please provide more detail (min 20 chars)'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fix the errors before submitting', { duration: 3000 })
      return
    }
    setLoading(true); setAffidavit(null)
    try {
      const res = await api.post('/api/fraud/generate', { ...form, panNumber: form.panNumber.toUpperCase() })
      setAffidavit(res.data.affidavit)
      toast.success('✅ Affidavit generated!', { duration: 3000 })
    } catch {
      toast.error('❌ Failed to generate. Check backend.', { duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '2px', textTransform: 'uppercase', textShadow: '0 0 20px rgba(0,255,136,0.2)' }}>
          Fraud Report
        </h1>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#2d6a4f', marginTop: '5px' }}>
          Generate a legally formatted affidavit for PAN card fraud using AI
        </p>
      </div>

      {!affidavit && (
        <div className="cyber-card" style={{ padding: '28px' }}>
          <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '12px', fontWeight: 700, color: '#00ff88', letterSpacing: '1px', marginBottom: '24px' }}>
            📝 INCIDENT DETAILS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Full Name */}
            <div>
              <label style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '12px', fontWeight: 700, color: '#2d6a4f', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Full Name <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              <input
                type="text" name="fullName" value={form.fullName}
                onChange={handleChange} placeholder="As per PAN card"
                className={`form-input ${errors.fullName ? 'form-input-error' : ''}`}
                style={inputStyle(errors.fullName)}
              />
              {errors.fullName && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#ff6b6b', marginTop: '5px' }}>⚠️ {errors.fullName}</p>}
            </div>

            {/* PAN Number */}
            <div>
              <label style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '12px', fontWeight: 700, color: '#2d6a4f', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                PAN Number <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              <input
                type="text" name="panNumber" value={form.panNumber}
                onChange={handleChange} placeholder="e.g. ABCDE1234F"
                maxLength={10}
                className={`form-input ${errors.panNumber ? 'form-input-error' : ''}`}
                style={{ ...inputStyle(errors.panNumber), textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Orbitron',sans-serif", fontSize: '13px' }}
              />
              {errors.panNumber && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#ff6b6b', marginTop: '5px' }}>⚠️ {errors.panNumber}</p>}
            </div>

            {/* Incident Date */}
            <div>
              <label style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '12px', fontWeight: 700, color: '#2d6a4f', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Incident Date <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              <input
                type="date" name="incidentDate" value={form.incidentDate}
                onChange={handleChange}
                className={`form-input ${errors.incidentDate ? 'form-input-error' : ''}`}
                style={{ ...inputStyle(errors.incidentDate), colorScheme: 'dark' }}
              />
              {errors.incidentDate && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#ff6b6b', marginTop: '5px' }}>⚠️ {errors.incidentDate}</p>}
            </div>

            {/* Description */}
            <div>
              <label style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '12px', fontWeight: 700, color: '#2d6a4f', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Incident Description <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              <textarea
                name="description" value={form.description}
                onChange={handleChange}
                placeholder="Describe how your PAN was misused..."
                rows={5}
                className={`form-input ${errors.description ? 'form-input-error' : ''}`}
                style={{ ...inputStyle(errors.description), resize: 'none', lineHeight: 1.6 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                {errors.description
                  ? <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#ff6b6b' }}>⚠️ {errors.description}</p>
                  : <span />
                }
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', color: '#1a4d2e' }}>{form.description.length} chars</p>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-neon-indigo"
              style={{ padding: '12px 32px', borderRadius: '10px', fontSize: '15px', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(165,180,252,0.3)', borderTop: '2px solid #a5b4fc', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                  GENERATING AFFIDAVIT...
                </>
              ) : <>📄 GENERATE AFFIDAVIT</>}
            </button>
          </div>
        </div>
      )}

      {affidavit && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="animate-slide-in">
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { navigator.clipboard.writeText(affidavit); toast.success('📋 Copied!', { duration: 2000 }) }}
              className="btn-ghost"
              style={{ padding: '9px 18px', borderRadius: '9px' }}
            >📋 COPY TO CLIPBOARD</button>
            <button onClick={() => window.print()} className="btn-neon-indigo" style={{ padding: '9px 18px', borderRadius: '9px' }}>
              🖨️ PRINT / SAVE AS PDF
            </button>
            <button
              onClick={() => { setAffidavit(null); setForm({ fullName: '', panNumber: '', incidentDate: '', description: '' }); setErrors({}) }}
              className="btn-neon-green"
              style={{ padding: '9px 18px', borderRadius: '9px' }}
            >🔄 NEW REPORT</button>
          </div>

          <div style={{ background: '#fff', borderRadius: '14px', padding: '40px', border: '1px solid #e2e8f0' }}>
            <pre style={{ fontFamily: 'Georgia, serif', fontSize: '13px', color: '#1a1a1a', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {affidavit}
            </pre>
          </div>

          <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '12px', color: '#fbbf24', lineHeight: 1.6 }}>
              ⚠️ <strong>Disclaimer:</strong> This affidavit is AI-generated. Review carefully and consult a legal professional before submission.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}