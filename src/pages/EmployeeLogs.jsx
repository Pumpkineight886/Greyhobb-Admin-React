import { useEffect, useState } from 'react'
import api from '../api/axios'
import { parseServerTime } from '../lib/datetime.js'
import { categoryLabel, formatDepartment } from '../lib/users.js'

function formatTimestamp(iso) {
  const date = parseServerTime(iso)
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
        // /attendance/all is the only activity feed available from the backend.
        const res = await api.get('/attendance/all')
        if (cancelled) return
        const mapped = res.data.map((r) => {
          const ref = String(r.user_id || '').slice(0, 8)
          return {
            id: r.id,
            actor: r.user?.name || ref,
            action: 'Attendance Marked',
            description: `${r.user?.email || ''} — ${formatDepartment(r.user?.department)} · ${categoryLabel(r.user)} on ${r.date}`,
            timestamp: r.marked_at,
            ref: ref ? `user:${ref}` : '',
            flagged: false,
          }
        })
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
    const haystack = [log.actor, log.action, log.description, log.ref]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })

  if (loading) return <p style={{ padding: 24, color: '#6b7280' }}>Loading employee logs…</p>
  if (error) return <p className="error-msg" style={{ padding: 24 }}>{error}</p>

  return (
    <div className="audit-logs-page">
      <header className="al-header">
        <h1 className="al-title">Employee Logs</h1>
        <p className="al-subtitle">Attendance activity across the organisation — {logs.length} records.</p>
        <div className="al-search-wrap">
          <img src="/assets/search-icon.png" alt="" className="al-search-icon" />
          <input
            type="text"
            className="al-search-input"
            placeholder="Search logs by employee, department or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="al-content">
        {filteredLogs.length === 0 ? (
          <p className="al-empty">{logs.length === 0 ? 'No attendance records yet. Mark attendance to generate logs.' : 'No employee logs match your search.'}</p>
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
              {log.ref && (
                <div className="al-meta-row">
                  <span>Ref: {log.ref}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
