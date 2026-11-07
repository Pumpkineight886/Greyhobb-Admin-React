import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { parseServerTime } from '../lib/datetime.js'
import { isLate } from '../lib/attendance.js'
import { buildDetailedFromHistory, downloadCSV, todayStamp } from '../lib/export.js'
import {
  SCHOOL_LABELS,
  STUDENT_CATEGORIES,
  categoryLabel,
  formatDayLong,
  formatDepartment,
  isStaff,
  normalizeSchool,
} from '../lib/users.js'

function initials(name) {
  return (name || '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function displayId(id) {
  return String(id || '').slice(0, 8).toUpperCase()
}

function checkInTime(markedAt) {
  return parseServerTime(markedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function joinDate(value) {
  const raw = String(value || '').slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? formatDayLong(raw) : '—'
}

function slugify(value) {
  return String(value || 'user').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export default function UserDirectory({ mode }) {
  const isStaffMode = mode === 'staff'
  const [users, setUsers] = useState([])
  const [attendance, setAttendance] = useState([])
  const [statsAvailable, setStatsAvailable] = useState(true)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [reloadKey, setReloadKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [usersRes, attendanceRes] = await Promise.allSettled([
          api.get('/auth/users'),
          api.get('/attendance/all'),
        ])
        if (usersRes.status !== 'fulfilled') throw usersRes.reason
        if (cancelled) return
        setUsers(usersRes.value.data || [])
        if (attendanceRes.status === 'fulfilled') {
          setAttendance(attendanceRes.value.data || [])
          setStatsAvailable(true)
        } else {
          setAttendance([])
          setStatsAvailable(false)
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || err.message || 'Failed to load directory')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [reloadKey])

  const attendanceByUser = useMemo(() => {
    const map = new Map()
    for (const record of attendance) {
      const key = record.user_id
      if (!key) continue
      if (!map.has(key)) {
        map.set(key, { present: 0, late: 0, total: 0, lastRaw: '', records: [] })
      }
      const entry = map.get(key)
      const late = isLate(record.marked_at)
      if (late) entry.late += 1
      else entry.present += 1
      entry.total += 1
      entry.records.push(record)
      if (record.date && record.date > entry.lastRaw) entry.lastRaw = record.date
    }
    return map
  }, [attendance])

  const directoryUsers = useMemo(
    () => users.filter((u) => (isStaffMode ? isStaff(u) : !isStaff(u))),
    [users, isStaffMode],
  )

  const filterOptions = useMemo(() => {
    if (isStaffMode) return []
    const present = new Set(directoryUsers.map((u) => normalizeSchool(u)))
    const ordered = STUDENT_CATEGORIES.filter((key) => present.has(key))
    if (present.has('unknown')) ordered.push('unknown')
    return ['All', ...ordered].map((key) => ({
      key,
      label: key === 'All' ? 'All' : (SCHOOL_LABELS[key] || 'Other'),
      count: key === 'All' ? directoryUsers.length : directoryUsers.filter((u) => normalizeSchool(u) === key).length,
    }))
  }, [directoryUsers, isStaffMode])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return directoryUsers.filter((u) => {
      const matchesFilter = activeFilter === 'All' || normalizeSchool(u) === activeFilter
      if (!matchesFilter) return false
      if (!q) return true
      return (
        String(u.name || '').toLowerCase().includes(q) ||
        String(u.email || '').toLowerCase().includes(q) ||
        String(u.id || '').toLowerCase().includes(q) ||
        String(u.department || '').toLowerCase().includes(q)
      )
    })
  }, [directoryUsers, query, activeFilter])

  function handleExportAll() {
    const rows = filtered.map((u) => {
      const stats = attendanceByUser.get(u.id)
      return {
        Name: u.name || '',
        Email: u.email || '',
        ID: displayId(u.id),
        Department: formatDepartment(u.department),
        Category: categoryLabel(u),
        Present: stats?.present ?? 0,
        Late: stats?.late ?? 0,
        TotalRecords: stats?.total ?? 0,
        LastSeen: stats?.lastRaw ? formatDayLong(stats.lastRaw) : '—',
        Joined: joinDate(u.created_at),
      }
    })
    const label = isStaffMode ? 'staff' : 'students'
    downloadCSV(`greyhobb-${label}-${todayStamp()}.csv`, rows)
  }

  function handleExportUser(user) {
    const stats = attendanceByUser.get(user.id)
    if (!stats || stats.records.length === 0) {
      alert(`No attendance records for ${user.name || 'this user'} yet.`)
      return
    }
    const flat = stats.records
      .slice()
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .map((r) => ({
        rawDate: r.date,
        day: formatDayLong(r.date),
        name: user.name || '',
        email: user.email || '',
        uid: displayId(user.id),
        role: formatDepartment(user.department),
        checkIn: checkInTime(r.marked_at),
        status: isLate(r.marked_at) ? 'late' : 'present',
      }))
    downloadCSV(`attendance-${slugify(user.name)}-${todayStamp()}.csv`, buildDetailedFromHistory(flat))
  }

  if (loading) {
    return <p style={{ padding: 24, color: '#6b7280' }}>Loading {isStaffMode ? 'staff' : 'students'}…</p>
  }
  if (error) return <p className="error-msg" style={{ padding: 24 }}>{error}</p>

  return (
    <section className={isStaffMode ? 'staff-directory' : 'student-directory'}>
      <div className="search-wrap">
        <img src="/assets/search-icon.png" alt="" className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={`Search ${isStaffMode ? 'staff' : 'students'} by name, email, ID or department...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="directory-header">
        <div>
          <h1>{isStaffMode ? 'Staff Directory' : 'Student Directory'}</h1>
          <p>
            {directoryUsers.length} {isStaffMode ? 'staff members' : 'students'} across all programmes.
            {!statsAvailable && ' Attendance statistics are unavailable right now.'}
          </p>
        </div>
        <div className="directory-header-actions">
          <button type="button" className="btn-filter" onClick={() => setReloadKey((k) => k + 1)}>
            <img src="/assets/filter-icon.png" alt="" />
            Refresh
          </button>
          <button type="button" className="btn-export" onClick={handleExportAll}>
            <img src="/assets/export-icon.png" alt="" />
            Export
          </button>
        </div>
      </div>

      {!isStaffMode && filterOptions.length > 1 && (
        <div className="filter-row chips">
          {filterOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`filter-chip${activeFilter === option.key ? ' is-active' : ''}`}
              onClick={() => setActiveFilter(option.key)}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      )}

      <div className="staff-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            No {isStaffMode ? 'staff' : 'students'} match your search.
          </div>
        ) : (
          filtered.map((user) => {
            const stats = attendanceByUser.get(user.id)
            const lastSeen = stats?.lastRaw ? formatDayLong(stats.lastRaw) : ''
            return (
              <article key={user.id} className="staff-card">
                <div className="staff-card-top">
                  <div className="staff-avatar placeholder" aria-hidden="true">
                    {initials(user.name)}
                  </div>
                  <div className="staff-identity">
                    <h3 className="staff-name">{user.name}</h3>
                    <p className="staff-id">{user.email} · {displayId(user.id)}</p>
                  </div>
                  <span className="badge staff">{categoryLabel(user)}</span>
                </div>
                <div className="staff-card-bottom">
                  <span className="staff-role">
                    {formatDepartment(user.department)}
                    {statsAvailable && ` · ${stats?.present ?? 0} present · ${stats?.late ?? 0} late`}
                  </span>
                  <span className="staff-weeks">
                    {statsAvailable
                      ? (lastSeen ? `Last seen: ${lastSeen}` : 'No check-ins yet')
                      : `Joined: ${joinDate(user.created_at)}`}
                  </span>
                  <button
                    type="button"
                    className="card-export-btn"
                    onClick={() => handleExportUser(user)}
                    title={`Export ${user.name}'s attendance`}
                  >
                    Export
                  </button>
                </div>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
