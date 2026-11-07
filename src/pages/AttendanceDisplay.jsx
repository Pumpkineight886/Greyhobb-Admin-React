import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCodeStyling from 'qr-code-styling'
import api from '../api/axios'
import { parseServerTime } from '../lib/datetime.js'
import { todayISO } from '../lib/attendance.js'
import { formatDayLong } from '../lib/users.js'

const LOGO_URL = '/assets/greysoft-logo-clear.png'
const REGEN_COOLDOWN_MS = 10000

function computeQrSize() {
  if (typeof window === 'undefined') return 520
  return Math.round(Math.min(window.innerHeight * 0.52, window.innerWidth * 0.42, 700))
}

export default function AttendanceDisplay() {
  const qrRef = useRef(null)
  const qrInstanceRef = useRef(null)
  const navigate = useNavigate()
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(30)
  const [qrSize, setQrSize] = useState(computeQrSize)
  const [now, setNow] = useState(() => new Date())
  const [controlsVisible, setControlsVisible] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const generatingRef = useRef(false)
  const lastRegenRef = useRef(0)

  const generate = useCallback(async () => {
    if (generatingRef.current) return
    generatingRef.current = true
    lastRegenRef.current = Date.now()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/attendance/generate-qr')
      setQrData(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate QR')
    } finally {
      generatingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    generate()
  }, [generate])

  useEffect(() => {
    if (!qrData?.expires_at) return
    const expires = parseServerTime(qrData.expires_at).getTime()
    const total = Math.max(1, Math.round((expires - Date.now()) / 1000))
    setTotalSeconds(total)
    const tick = () => {
      const diff = Math.max(0, Math.floor((expires - Date.now()) / 1000))
      setCountdown(diff)
      if (diff === 0 && Date.now() - lastRegenRef.current > REGEN_COOLDOWN_MS) {
        generate()
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [qrData, generate])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let timer
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setQrSize(computeQrSize()), 150)
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    let timer
    const reveal = () => {
      setControlsVisible(true)
      clearTimeout(timer)
      timer = setTimeout(() => setControlsVisible(false), 3000)
    }
    window.addEventListener('mousemove', reveal)
    window.addEventListener('touchstart', reveal)
    window.addEventListener('keydown', reveal)
    reveal()
    return () => {
      clearTimeout(timer)
      window.removeEventListener('mousemove', reveal)
      window.removeEventListener('touchstart', reveal)
      window.removeEventListener('keydown', reveal)
    }
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    let sentinel = null
    async function requestLock() {
      try {
        if ('wakeLock' in navigator) sentinel = await navigator.wakeLock.request('screen')
      } catch {
        // Wake lock is best-effort; TVs and browsers may reject it.
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') requestLock()
    }
    requestLock()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      if (sentinel) sentinel.release().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const token = qrData?.qr_token
    if (!token) return
    const baseOptions = {
      width: qrSize,
      height: qrSize,
      type: 'canvas',
      data: token,
      qrOptions: { errorCorrectionLevel: 'H' },
      dotsOptions: { color: '#6b1f3a', type: 'square' },
      cornersSquareOptions: { color: '#6b1f3a', type: 'square' },
      cornersDotOptions: { color: '#6b1f3a' },
      backgroundOptions: { color: '#ffffff' },
      imageOptions: { margin: 12, imageSize: 0.3 },
    }
    const renderQR = (image) => {
      const qrCode = new QRCodeStyling(image ? { ...baseOptions, image } : baseOptions)
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
      if (!cancelled && !qrInstanceRef.current) renderQR(undefined)
    }, 1200)
    return () => {
      cancelled = true
      clearTimeout(timeout)
      if (qrRef.current) qrRef.current.innerHTML = ''
    }
  }, [qrData, qrSize])

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
      else await document.exitFullscreen()
    } catch {
      // Fullscreen can be blocked by the browser; ignore.
    }
  }

  const progress = totalSeconds > 0 ? Math.min(100, (countdown / totalSeconds) * 100) : 0
  const displayDate = formatDayLong(qrData?.date || todayISO())

  return (
    <div className={`tv-display${controlsVisible ? ' show-controls' : ''}`}>
      <div className={`tv-controls${controlsVisible ? ' is-visible' : ''}`}>
        <button type="button" onClick={toggleFullscreen}>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        <button type="button" onClick={() => navigate('/print-attendance-qr')}>
          Back to App
        </button>
      </div>

      <p className="tv-brand">Greysoft Technologies</p>
      <h1 className="tv-title">Scan to Check In</h1>
      <p className="tv-subtitle">Open the Greyhobb app and point your camera at the code.</p>

      <div className="tv-qr-card">
        {!qrData ? (
          <div className="tv-placeholder">{error ? 'QR unavailable' : 'Preparing QR…'}</div>
        ) : (
          <>
            <div className="tv-qr" ref={qrRef} />
            <div className="tv-progress">
              <div
                className={`tv-progress-fill${countdown <= 5 ? ' is-low' : ''}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="tv-count-row">
              <span className={countdown <= 5 ? 'tv-count-low' : ''}>
                {countdown > 0
                  ? `Refreshes in ${countdown}s`
                  : loading ? 'Refreshing…' : 'Refreshing shortly…'}
              </span>
              <span>Auto</span>
            </div>
          </>
        )}
      </div>

      <p className="tv-date">
        <strong>{displayDate}</strong> · {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
      </p>

      {error && <p className="tv-error">{error}</p>}
      {error && !qrData && (
        <button type="button" className="tv-retry" onClick={generate}>Try again</button>
      )}

      <p className="tv-footer">Greyhobb Smart Attendance</p>
    </div>
  )
}
