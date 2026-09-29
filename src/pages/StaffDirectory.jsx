import { useEffect, useState } from 'react'
import api from '../api/axios'

const STATUS_CLASS = {
  Enrolled: 'status-enrolled',
  Suspended: 'status-suspended',
  Leave: 'status-leave',
}

function initials(name) {
  return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
}

export default function StaffDirectory() {
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await api.get('/auth/users')
        if (!cancelled) setUsers(res.data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || err.message || 'Failed to load staff')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = users
    .map(u => ({
      name: u.name,
      id: u.id.slice(0,8).toUpperCase(),
      fullId: u.id,
      email: u.email,
      status: 'Enrolled',
      role: u.department,
      weeks: u.school,
      created: u.created_at,
    }))
    .filter(
      (staff) =>
        staff.name.toLowerCase().includes(query.toLowerCase()) ||
        staff.id.toLowerCase().includes(query.toLowerCase()) ||
        staff.email.toLowerCase().includes(query.toLowerCase())
    )

  if (loading) return <p style={{ padding: 24, color: '#6b7280' }}>Loading staff…</p>
  if (error) return <p className="error-msg" style={{ padding: 24 }}>{error}</p>

  return (
    <section className="staff-directory">
      <div className="search-wrap">
        <img src="/assets/search-icon.png" alt="" className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search staff..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="directory-header">
        <div>
          <h1>Daily Attendance Logs</h1>
          <p>Live staff directory from <code>GET /auth/users</code> — {users.length} users. Monitor and manage employee check-ins.</p>
        </div>
        <div className="directory-header-actions">
          <button type="button" className="btn-filter" onClick={() => window.location.reload()}>
            <img src="/assets/filter-icon.png" alt="" />
            Refresh
          </button>
          <button type="button" className="btn-export" onClick={() => alert('Export: integrate CSV from /attendance/all')}>
            <img src="/assets/export-icon.png" alt="" />
            Export
          </button>
        </div>
      </div>

      <div className="staff-list">
        {filtered.length === 0 ? (
          <div className="empty-state">No staff found.</div>
        ) : (
          filtered.map((staff) => (
            <article key={staff.fullId} className="staff-card">
              <div className="staff-card-top">
                <div className="staff-avatar placeholder">{initials(staff.name)}</div>
                <div className="staff-identity">
                  <span className="staff-name">{staff.name}</span>
                  <span className="staff-id">{staff.email} · {staff.id}</span>
                </div>
                <span className={`status-badge ${STATUS_CLASS[staff.status]}`}>
                  {staff.status}
                </span>
              </div>
              <div className="staff-card-bottom">
                <span className="staff-role">{staff.role}</span>
                <span className="staff-weeks">{staff.weeks}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
