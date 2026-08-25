import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCodeStyling from 'qr-code-styling'

// MUST MATCH scan.js's EXPECTED_LOCATION_ID exactly — one is
// the writer (this printed code), the other the verifier
// (what the scanner accepts). If you ever change one, change
// both or every scan will be rejected as an invalid QR.
const LOCATION_ID = 'GREYHOBB-ATTENDANCE-01'

export default function PrintAttendanceQR() {
  const qrRef = useRef(null)
  const qrInstanceRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Cleaned copy of "Greysoft logo.jpg" — white background made
    // transparent and dead borders cropped away, so zooming this
    // enlarges the MARK itself rather than its empty white frame.
    // File lives at public/assets/greysoft-logo-clear.png — if absent
    // the QR still renders (logo simply omitted).
    const LOGO_URL = '/assets/greysoft-logo-clear.png'

    const baseOptions = {
      width: 640,
      height: 640,
      type: 'canvas',
      data: LOCATION_ID,
      qrOptions: {
        errorCorrectionLevel: 'H',
      },
      dotsOptions: {
        color: '#6b1f3a',
        type: 'square',
      },
      cornersSquareOptions: {
        color: '#6b1f3a',
        type: 'square',
      },
      cornersDotOptions: {
        color: '#6b1f3a',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      imageOptions: {
        margin: 26,
        imageSize: 0.44,
      },
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

    // Pre-flight logo check: qr-code-styling's internal loader has no
    // onerror handler — a 404 would hang the promise and leave the
    // canvas blank. We test the image ourselves and fall back to no-logo.
    const probe = new Image()
    let cancelled = false
    probe.onload = () => {
      if (!cancelled) renderQR(LOGO_URL)
    }
    probe.onerror = () => {
      if (!cancelled) renderQR(undefined)
    }
    probe.src = LOGO_URL

    // Fallback timeout in case image hangs (e.g. slow 404)
    const timeout = setTimeout(() => {
      if (!qrInstanceRef.current) renderQR(undefined)
    }, 1200)

    return () => {
      cancelled = true
      clearTimeout(timeout)
      if (qrRef.current) qrRef.current.innerHTML = ''
    }
  }, [])

  return (
    <div className="print-qr-page">
      <div className="print-qr-card">
        <p className="print-qr-brand">Greysoft Technologies</p>
        <h1 className="print-qr-title">Reception Attendance QR</h1>
        <p className="print-qr-subtext no-print">
          Print this sheet and keep it at reception. Students and staff scan it to check in.
        </p>

        <div id="qrcode" ref={qrRef} className="print-qr-code" />

        <p className="print-qr-location no-print">{LOCATION_ID}</p>

        <ul className="print-qr-instructions no-print">
          <li>Print this page and place it where students and staff can reach it.</li>
          <li>
            Students and staff open the app and choose <strong>Scan Attendance</strong>.
          </li>
          <li>A successful scan records their check-in / check-out.</li>
          <li>
            <strong>Test one scan before printing final copies</strong> — the logo and maroon color are
            scanner-safe, but always confirm.
          </li>
        </ul>

        <div className="print-qr-actions no-print">
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            Print
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/home')}>
            Back to App
          </button>
        </div>

        <p className="print-qr-warning no-print">Keep this code physical and in view only.</p>
      </div>
    </div>
  )
}
