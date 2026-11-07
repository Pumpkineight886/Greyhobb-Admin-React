import { useEffect, useState } from 'react'
import api from '../api/axios'
import { parseServerTime } from '../lib/datetime.js'
import { isLate } from '../lib/attendance.js'

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function initials(name) {
  return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
}

export default function AdminHome() {
  const [stats, setStats] = useState({ present: 0, late: 0, absent: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [statsRes, recentRes] = await Promise.all([
          api.get('/attendance/stats'),
          api.get('/attendance/recent?limit=5'),
        ])
        if (cancelled) return
        setStats(statsRes.data)
        // recent returns AttendanceWithUser
        const mapped = recentRes.data.map((r) => {
          const late = isLate(r.marked_at)
          const time = parseServerTime(r.marked_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          return {
            id: r.id,
            name: r.user?.name || 'Unknown',
            role: r.user?.department || r.user?.school || '—',
            time: `Checked in · ${time}`,
            status: late ? 'late' : 'present',
            initials: initials(r.user?.name),
          }
        })
        setRecent(mapped)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || err.message || 'Failed to load overview')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const statItems = [
    { id: 'present', label: 'Present', value: stats.present, tone: 'present', Icon: CheckIcon },
    { id: 'late', label: 'Late', value: stats.late, tone: 'late', Icon: ClockIcon },
    { id: 'absent', label: 'Absent', value: stats.absent, tone: 'absent', Icon: XIcon },
  ]

  return (
    <>
      <section className="overview">
        <div className="overview-row">
          <div>
            <h1>Overview</h1>
            <p>Today&rsquo;s Attendance Summary</p>
          </div>
          <div className="overview-actions">
            <span className="pill-btn" style={{ cursor: 'default' }}>
              <CalendarIcon />
              Today
            </span>
          </div>
        </div>
      </section>

      {error && <p className="error-msg" style={{ marginBottom: 16 }}>{error}</p>}
      {loading ? (
        <p style={{ color: '#6b7280', padding: 12 }}>Loading overview…</p>
      ) : (
        <section className="stat-grid">
          {statItems.map(({ id, label, value, tone, Icon }) => (
            <article key={id} className="stat-card">
              <div className="stat-card-top">
                <span className="stat-label">{label}</span>
                <span className={`stat-icon ${tone}`}>
                  <Icon />
                </span>
              </div>
              <div className="stat-value-row">
                <span className="stat-value">{value}</span>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="checkins">
        <h2>Recent Check-ins</h2>
        {loading ? (
          <p style={{ color: '#6b7280', padding: 12 }}>Loading…</p>
        ) : recent.length === 0 ? (
          <div className="checkin-list" style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>
            No check-ins yet. Generate a QR and mark attendance to see data.
          </div>
        ) : (
          <div className="checkin-list">
            {recent.map(({ id, name, role, time, status, initials: ini }) => (
              <div key={id} className="checkin-row">
                <div className="checkin-avatar initials">{ini}</div>
                <div className="checkin-info">
                  <div className="checkin-name">{name}</div>
                  <div className="checkin-meta">{role}</div>
                </div>
                <div className="checkin-status">
                  <span className={`status-badge ${status}`}>{status}</span>
                  <span className="checkin-time">{time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
