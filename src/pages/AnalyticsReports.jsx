import { useEffect, useState, useMemo } from 'react'
import api from '../api/axios'
import { isLate, todayISO, weekStartISO } from '../lib/attendance.js'
import { formatDepartment } from '../lib/users.js'

export default function AnalyticsReports() {
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState({ present: 0, late: 0, absent: 0, total_users: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [allRes, statsRes] = await Promise.all([
          api.get('/attendance/all'),
          api.get('/attendance/stats'),
        ])
        if (cancelled) return
        setHistory(allRes.data)
        setStats(statsRes.data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || err.message || 'Failed to load analytics')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const attendanceData = useMemo(() => {
    const weekStart = weekStartISO()
    const dayMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 }
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    for (const r of history) {
      if (!r.date || r.date < weekStart) continue
      const d = new Date(r.date + 'T00:00:00')
      const wd = d.toLocaleDateString('en-US', { weekday: 'short' })
      if (wd in dayMap) dayMap[wd]++
    }
    const max = Math.max(1, ...Object.values(dayMap))
    return dayOrder.map(label => ({ label, value: Math.round((dayMap[label] / max) * 88) || 8 }))
  }, [history])

  // Count today's late arrivals locally (the server's own count uses UTC and can be an hour off)
  const lateToday = useMemo(() => {
    const today = todayISO()
    return history.filter((r) => r.date === today && isLate(r.marked_at)).length
  }, [history])

  const lateBreakdown = useMemo(() => {
    const today = todayISO()
    const map = {}
    for (const r of history) {
      if (r.date !== today) continue
      if (!isLate(r.marked_at)) continue
      const dept = formatDepartment(r.user?.department)
      map[dept] = (map[dept] || 0) + 1
    }
    const entries = Object.entries(map).map(([label, value]) => ({ label, value }))
    if (entries.length === 0) return [{ label: 'No late arrivals today', value: 0 }]
    return entries.slice(0, 5)
  }, [history])

  const maxLate = Math.max(...lateBreakdown.map((item) => item.value), 1)

  if (loading) return <p style={{ padding: 24, color: '#6b7280' }}>Loading analytics…</p>
  if (error) return <p className="error-msg" style={{ padding: 24 }}>{error}</p>

  return (
    <>
      <header className="reports-header">
        <h1>Analytics Reports</h1>
        <p>Attendance overview across the organisation — {history.length} records.</p>
      </header>

      <div className="reports-grid">
        <section className="report-card">
          <div className="report-card-head">
            <h3 className="report-card-title">Daily Attendance Rate</h3>
            <span className="trend-badge">
              <img src="/assets/rate-arrow-icon.png" alt="" />
              <span className="trend-value">{stats.total_users ? `${Math.round((stats.present / Math.max(1, stats.total_users)) * 100)}%` : '—'}</span>
            </span>
          </div>
          <p className="report-card-sub">Average across all departments — present {stats.present} / total {stats.total_users}</p>

          <div className="chart-bars">
            {attendanceData.map(({ label, value }) => (
              <div className="chart-bar-col" key={label}>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill" style={{ height: `${value}%` }} />
                </div>
                <span className="chart-bar-label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="report-card">
          <div className="late-icon">
            <img src="/assets/late-arrivals-icon.png" alt="Late arrivals" />
          </div>
          <h3 className="report-card-title">Late Arrivals</h3>
          <div className="late-count">{lateToday}</div>
          <p className="late-sub">Late today across all branches (after 09:00).</p>

          <div className="late-breakdown">
            {lateBreakdown.map(({ label, value }) => (
              <div key={label}>
                <div className="late-row-head">
                  <span className="late-row-label">{label}</span>
                  <span className="late-row-value">{value}</span>
                </div>
                <div className="late-progress-track">
                  <div
                    className="late-progress-fill"
                    style={{ width: `${(value / maxLate) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
