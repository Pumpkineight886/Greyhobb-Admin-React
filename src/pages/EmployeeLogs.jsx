import { useEffect, useState } from 'react'
import api from '../api/axios'

function formatTimestamp(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function EmployeeLogs() {
  const [search, setSearch] = useState('')
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        // Use attendance/all as audit trail fallback — each attendance is a log
        const res = await api.get('/attendance/all')
        if (cancelled) return
        const mapped = res.data.map((r) => ({
          id: r.id,
          actor: r.user?.name || r.user_id.slice(0,8),
          action: 'Marked Attendance',
          description: `${r.user?.email || ''} — ${r.user?.department || ''} / ${r.user?.school || ''} on ${r.date}`,
          timestamp: r.marked_at,
          ipAddress: `user:${r.user_id.slice(0,8)}`,
          flagged: false,
        }))
        // most recent first (already sorted desc)
        setLogs(mapped)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || err.message || 'Failed to load logs')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filteredLogs = logs.filter((log) => {
    const query = search.trim().toLowerCase()
    if (!query) return true
    const haystack = [log.actor, log.action, log.description, log.ipAddress]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })

  if (loading) return <p style={{ padding: 24, color: '#6b7280' }}>Loading audit logs…</p>
  if (error) return <p className="error-msg" style={{ padding: 24 }}>{error}</p>

  return (
    <div className="audit-logs-page">
      <header className="al-header">
        <h1 className="al-title">Audit Logs</h1>
        <p className="al-subtitle">Live attendance audit trail from <code>GET /attendance/all</code> — {logs.length} records.</p>
        <div className="al-search-wrap">
          <img src="/assets/search-icon.png" alt="" className="al-search-icon" />
          <input
            type="text"
            className="al-search-input"
            placeholder="Search logs by actor, action, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="al-content">
        {filteredLogs.length === 0 ? (
          <p className="al-empty">{logs.length === 0 ? 'No attendance records yet. Mark attendance to generate logs.' : 'No audit logs match your search.'}</p>
        ) : filteredLogs.map((log) => (
          <div key={log.id} className={`al-card${log.flagged ? ' flagged' : ''}`}>
            <div className="al-card-icon">
              <img src="/assets/audit-logs-icon.png" alt="" />
            </div>
            <div className="al-card-body">
              <p className="al-actor">{log.actor}</p>
              <p className="al-action">{log.action}</p>
              <p className="al-desc">{log.description}</p>
              <div className="al-meta-row strong">
                <span>{formatTimestamp(log.timestamp)}</span>
              </div>
              {log.ipAddress && (
                <div className="al-meta-row">
                  <span>Ref: {log.ipAddress}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
