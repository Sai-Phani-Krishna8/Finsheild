import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'

export default function Report() {
  const [form, setForm] = useState({
    fullName: '',
    panNumber: '',
    incidentDate: '',
    description: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [affidavit, setAffidavit] = useState(null)

  const validate = () => {
    const newErrors = {}
    if (!form.fullName.trim())
      newErrors.fullName = 'Full name is required'
    if (!form.panNumber.trim())
      newErrors.panNumber = 'PAN number is required'
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.toUpperCase()))
      newErrors.panNumber = 'Invalid PAN format (e.g. ABCDE1234F)'
    if (!form.incidentDate)
      newErrors.incidentDate = 'Incident date is required'
    if (!form.description.trim())
      newErrors.description = 'Description is required'
    else if (form.description.trim().length < 20)
      newErrors.description = 'Please provide more detail (min 20 characters)'
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fix the errors before submitting', { duration: 3000 })
      return
    }

    setLoading(true)
    setAffidavit(null)

    try {
      const response = await api.post('/api/fraud/generate', {
        ...form,
        panNumber: form.panNumber.toUpperCase(),
      })
      setAffidavit(response.data.affidavit)
      toast.success('✅ Affidavit generated successfully!', { duration: 3000 })
    } catch (err) {
      console.error(err)
      toast.error('❌ Failed to generate. Check backend.', { duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(affidavit)
    toast.success('📋 Copied to clipboard!', { duration: 2000 })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleReset = () => {
    setAffidavit(null)
    setForm({
      fullName: '',
      panNumber: '',
      incidentDate: '',
      description: '',
    })
    setErrors({})
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">Fraud Report + Affidavit</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Generate a legally formatted affidavit for PAN card fraud using AI
        </p>
      </div>

      {/* Form */}
      {!affidavit && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-base mb-6 flex items-center gap-2">
            <span>📝</span> Incident Details
          </h2>

          <div className="flex flex-col gap-5">

            {/* Full Name */}
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="As per PAN card"
                className={`w-full bg-slate-800 border rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-slate-500
                  ${errors.fullName
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-slate-600 focus:border-indigo-500'
                  }`}
              />
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1.5">⚠️ {errors.fullName}</p>
              )}
            </div>

            {/* PAN Number */}
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">
                PAN Number <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="panNumber"
                value={form.panNumber}
                onChange={handleChange}
                placeholder="e.g. ABCDE1234F"
                maxLength={10}
                className={`w-full bg-slate-800 border rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-slate-500 uppercase tracking-widest
                  ${errors.panNumber
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-slate-600 focus:border-indigo-500'
                  }`}
              />
              {errors.panNumber && (
                <p className="text-red-400 text-xs mt-1.5">⚠️ {errors.panNumber}</p>
              )}
            </div>

            {/* Incident Date */}
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">
                Incident Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="incidentDate"
                value={form.incidentDate}
                onChange={handleChange}
                className={`w-full bg-slate-800 border rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors
                  ${errors.incidentDate
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-slate-600 focus:border-indigo-500'
                  }`}
              />
              {errors.incidentDate && (
                <p className="text-red-400 text-xs mt-1.5">⚠️ {errors.incidentDate}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">
                Incident Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe how your PAN was misused — what happened, where, and how you found out..."
                rows={5}
                className={`w-full bg-slate-800 border rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-slate-500 resize-none
                  ${errors.description
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-slate-600 focus:border-indigo-500'
                  }`}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.description
                  ? <p className="text-red-400 text-xs">⚠️ {errors.description}</p>
                  : <span />
                }
                <p className="text-slate-500 text-xs">{form.description.length} chars</p>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Affidavit...
                </>
              ) : (
                <>
                  <span>📄</span> Generate Affidavit
                </>
              )}
            </button>

          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white font-semibold">Generating your affidavit...</p>
          <p className="text-slate-400 text-sm mt-1">Groq AI is drafting a legal document</p>
        </div>
      )}

      {/* Affidavit output */}
      {affidavit && !loading && (
        <div className="flex flex-col gap-4 animate-slide-in">

          {/* Action buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleCopy}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
            >
              📋 Copy to Clipboard
            </button>
            <button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
            >
              🖨️ Print / Save as PDF
            </button>
            <button
              onClick={handleReset}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-400 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
            >
              🔄 New Report
            </button>
          </div>

          {/* Document box */}
          <div
            id="affidavit-document"
            className="bg-white rounded-2xl p-8 border border-slate-300"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            <pre
              className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {affidavit}
            </pre>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <p className="text-amber-400 text-xs leading-relaxed">
              ⚠️ <strong>Disclaimer:</strong> This affidavit is an AI-generated draft for reference purposes only.
              Please review the content carefully and consult a qualified legal professional
              before submission to any authority or court.
            </p>
          </div>

        </div>
      )}

    </div>
  )
}