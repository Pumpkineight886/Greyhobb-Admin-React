import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCodeStyling from 'qr-code-styling'
import api, { API_BASE } from '../api/axios'

export default function PrintAttendanceQR() {
  const qrRef = useRef(null)
  const qrInstanceRef = useRef(null)
  const navigate = useNavigate()
  const [qrData, setQrData] = useState(null) // { qr_token, date, expires_at }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/attendance/generate-qr')
      setQrData(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate QR')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generate()
  }, [])

  // countdown timer
  useEffect(() => {
    if (!qrData?.expires_at) return
    const expires = new Date(qrData.expires_at).getTime()
    const tick = () => {
      const now = Date.now()
      const diff = Math.max(0, Math.floor((expires - now) / 1000))
      setCountdown(diff)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [qrData])

  // render QR
  useEffect(() => {
    const token = qrData?.qr_token
    if (!token) return
    const LOGO_URL = '/assets/greysoft-logo-clear.png'
    const baseOptions = {
      width: 320,
      height: 320,
      type: 'canvas',
      data: token,
      qrOptions: { errorCorrectionLevel: 'H' },
      dotsOptions: { color: '#6b1f3a', type: 'square' },
      cornersSquareOptions: { color: '#6b1f3a', type: 'square' },
      cornersDotOptions: { color: '#6b1f3a' },
      backgroundOptions: { color: '#ffffff' },
      imageOptions: { margin: 12, imageSize: 0.35 },
    }
    const renderQR = (image) => {
      const opts = image ? { ...baseOptions, image } : { ...baseOptions }
      const qrCode = new QRCodeStyling(opts)
      qrInstanceRef.current = qrCode
      if (qrRef.current) {
        qrRef.current.innerHTML = ''
        qrCode.append(qrRef.current)
      }
    }
    const probe = new Image()
    let cancelled = false
    probe.onload = () => { if (!cancelled) renderQR(LOGO_URL) }
    probe.onerror = () => { if (!cancelled) renderQR(undefined) }
    probe.src = LOGO_URL
    const timeout = setTimeout(() => {
      if (!qrInstanceRef.current) renderQR(undefined)
    }, 1200)
    return () => {
      cancelled = true
      clearTimeout(timeout)
      if (qrRef.current) qrRef.current.innerHTML = ''
    }
  }, [qrData])

  const imageUrl = qrData ? `${API_BASE}/attendance/qr-image/${qrData.qr_token}` : ''

  return (
    <div className="print-qr-page">
      <div className="print-qr-card">
        <p className="print-qr-brand">Greysoft Technologies</p>
        <h1 className="print-qr-title">Reception Attendance QR</h1>
        <p className="print-qr-subtext no-print">
          Live QR from backend — expires in 30 seconds. Print this sheet and keep it at reception. Students and staff scan it to check in.
        </p>

        {error && <p className="error-msg">{error}</p>}

        {!qrData ? (
          <p style={{ padding: 24, color: '#6b7280' }}>{loading ? 'Generating QR…' : 'No QR generated'}</p>
        ) : (
          <>
            <div id="qrcode" ref={qrRef} className="print-qr-code" />
            <p className="print-qr-location no-print" style={{ wordBreak: 'break-all' }}>{qrData.qr_token}</p>
            <p style={{ fontSize: 13, color: countdown <= 5 ? '#b91c1c' : '#6b7280', margin: '0 0 8px' }}>
              {countdown > 0 ? `Expires in ${countdown}s — ${new Date(qrData.expires_at).toLocaleTimeString()}` : 'Expired — generate new QR'}
            </p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 14px' }}>Date: {qrData.date} — Backend PNG: <a href={imageUrl} target="_blank" rel="noreferrer" style={{ color: '#7a1236' }}>open image</a></p>
          </>
        )}

        <ul className="print-qr-instructions no-print">
          <li>QR is generated via <code>POST /attendance/generate-qr</code> and stored as <code>qr_sessions</code>.</li>
          <li>Students/staff call <code>POST /attendance/mark</code> with the token to check in.</li>
          <li>Token expires after 30 seconds (server time). Regenerate if needed.</li>
          <li><strong>Test one scan before printing final copies.</strong></li>
        </ul>

        <div className="print-qr-actions no-print">
          <button type="button" className="btn btn-primary" onClick={generate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate New QR'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => window.print()}>
            Print
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/home')}>
            Back to App
          </button>
        </div>

        <p className="print-qr-warning no-print">Keep this code physical and in view only. Each QR is single-use per expiry window.</p>
      </div>
    </div>
  )
}
