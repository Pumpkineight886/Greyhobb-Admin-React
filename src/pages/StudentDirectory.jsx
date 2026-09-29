import { useEffect, useState } from 'react'
import api from '../api/axios'

function initials(name) {
  return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function StudentDirectory() {
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
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
        if (!cancelled) setError(err.response?.data?.detail || err.message || 'Failed to load students')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Derive “status” from created_at recency for demo; backend has no status field
  const withStatus = users.map(u => {
    // Simple heuristic: if department contains "Suspended" etc not applicable -> default Enrolled
    // We add a synthetic status based on email domain or just Enrolled
    return { ...u, status: 'Enrolled', role: u.department, weeks: new Date(u.created_at).toLocaleDateString() }
  })

  const FILTERS = ['All', 'Enrolled', 'Suspended', 'Leave']

  const filtered = withStatus.filter((staff) => {
    const matchesFilter = activeFilter === 'All' || staff.status === activeFilter
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch =
      query === '' ||
      staff.name.toLowerCase().includes(query) ||
      staff.id.toLowerCase().includes(query) ||
      staff.email.toLowerCase().includes(query)
    return matchesFilter && matchesSearch
  })

  if (loading) return <p style={{ padding: 24, color: '#6b7280' }}>Loading students…</p>
  if (error) return <p className="error-msg" style={{ padding: 24 }}>{error}</p>

  return (
    <section>
      <div className="page-header">
        <div>
          <h2 className="page-title">Student Directory</h2>
          <p className="page-desc">Live from <code>GET /auth/users</code> — {users.length} total. Filter locally.</p>
        </div>
      </div>
      <div className="search-wrap">
        <img src="/assets/search-icon.png" alt="" className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search students by name, email or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="filter-row chips">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`filter-chip${activeFilter === filter ? ' is-active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="staff-list">
        {filtered.length === 0 ? (
          <div className="empty-state">No students match your search.</div>
        ) : (
          filtered.map((staff) => (
            <article key={staff.id} className="staff-card">
              <div className="staff-card-top">
                <div className="staff-avatar placeholder" aria-hidden="true">
                  {initials(staff.name)}
                </div>
                <div className="staff-identity">
                  <h3 className="staff-name">{staff.name}</h3>
                  <p className="staff-id">{staff.email} · {staff.id.slice(0,8)}</p>
                </div>
                <span className={`status-badge status-${staff.status.toLowerCase()}`}>
                  {staff.status}
                </span>
              </div>
              <div className="staff-card-bottom">
                <span className="staff-role">{staff.role} — {staff.school}</span>
                <span className="staff-weeks">{staff.weeks}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
