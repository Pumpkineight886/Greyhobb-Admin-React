import { useEffect, useState } from 'react'
import api from '../api/axios'
import { readStored, writeStored } from '../lib/storage.js'

const BIOMETRICS_KEY = 'greyhobb.biometrics.enabled'

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
  )
}

function ShieldCheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
  )
}

export default function Biometrics() {
  const stored = readStored(BIOMETRICS_KEY, true)
  const [enabled, setEnabled] = useState(stored)
  const [saved, setSaved] = useState(stored)
  const [toast, setToast] = useState('')
  const [employeeCount, setEmployeeCount] = useState(null)
  const dirty = enabled !== saved

  useEffect(() => {
    let cancelled = false
    async function loadCount() {
      try {
        const res = await api.get('/auth/users')
        if (!cancelled) setEmployeeCount((res.data || []).length)
      } catch {
        if (!cancelled) setEmployeeCount(null)
      }
    }
    loadCount()
    return () => { cancelled = true }
  }, [])

  const save = () => {
    setSaved(enabled)
    writeStored(BIOMETRICS_KEY, enabled)
    setToast(enabled ? 'Biometric verification enabled and saved.' : 'Biometric verification disabled and saved.')
    setTimeout(() => setToast(''), 2500)
  }

  const countText = employeeCount === null ? '—' : employeeCount.toLocaleString()

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Biometric Policies</h1>
          <p className="page-desc">Configure global security requirements for employee attendance verification.</p>
        </div>
        <div className="bio-actions">
          <button type="button" className="btn btn-muted" onClick={() => setEnabled(saved)} disabled={!dirty}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={!dirty}>
            Save Changes
          </button>
        </div>
      </div>

      <div className="bio-grid">
        <section className="panel bio-card">
          <div className="bio-card-head">
            <div className="bio-card-title">
              <span className="bio-icon-box">
                <ShieldIcon />
              </span>
              <h3>Core Verification</h3>
            </div>
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => setEnabled(!enabled)}
                aria-label="Require biometric verification"
              />
              <span className="admin-toggle-track" />
            </label>
          </div>
          <div className="bio-feature">
            <h4>Require Biometric Verification</h4>
            <p>When enabled, employees must provide a biometric scan (face or fingerprint) in addition to their ID to log attendance.</p>
          </div>
        </section>

        <section className="panel bio-status">
          <span className="bio-status-icon">
            <ShieldCheckIcon />
          </span>
          <h3>Policy Status</h3>
          <span className={`bio-mode-badge ${enabled ? 'on' : 'off'}`}>
            {enabled && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            )}
            {enabled ? 'STRICT MODE ACTIVE' : 'STANDARD MODE'}
          </span>
          <p>
            {enabled
              ? `Currently enforcing biometrics for ${countText} registered users.`
              : `Biometric verification is optional for ${countText} registered users.`}
          </p>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
            Policy is saved on this device.
          </p>
        </section>
      </div>

      {toast && <div className="bio-toast">{toast}</div>}
    </div>
  )
}
