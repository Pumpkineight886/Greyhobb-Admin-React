import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { parseServerTime } from '../lib/datetime.js'
import { isLate } from '../lib/attendance.js'
import { isStaff, isStudent, normalizeDepartment } from '../lib/users.js'
import { buildDetailedFromHistory, buildSummaryFromHistory, downloadCSV, todayStamp } from '../lib/export.js'

const STATUS_FILTERS = ['All', 'Present', 'Late']

const DEPARTMENT_GROUPS = [
  { key: 'all', label: 'All Records', test: () => true },
  { key: 'staff', label: 'Staff', test: (u) => isStaff(u) },
  { key: 'frontend', label: 'Frontend Students', test: (u) => isStudent(u) && normalizeDepartment(u.department) === 'frontend' },
  { key: 'backend', label: 'Backend Students', test: (u) => isStudent(u) && normalizeDepartment(u.department) === 'backend' },
  { key: 'ui_ux', label: 'UI/UX Students', test: (u) => isStudent(u) && normalizeDepartment(u.department) === 'ui_ux' },
  { key: 'cyber_security', label: 'Cyber Security Students', test: (u) => isStudent(u) && normalizeDepartment(u.department) === 'cyber_security' },
  { key: 'data_analytics', label: 'Data Analytics Students', test: (u) => isStudent(u) && normalizeDepartment(u.department) === 'data_analytics' },
  { key: 'social_media_management', label: 'Social Media Management Students', test: (u) => isStudent(u) && normalizeDepartment(u.department) === 'social_media_management' },
]

function initials(name) {
  return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function initialsBg(name) {
  const colors = ['#7a1236', '#1d4ed8', '#047857', '#b45309', '#6d28d9', '#be185d']
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function formatDay(dateStr) {
  // dateStr like "2026-08-26" -> Monday, Aug 26
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
}

export default function History() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [expandedDay, setExpandedDay] = useState(null)
  const [raw, setRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        // Use /attendance/all so admin sees everyone, not just self
        const res = await api.get('/attendance/all')
        if (cancelled) return
        setRaw(res.data)
        // expand first day by default
        if (res.data.length > 0) {
          const firstDate = res.data[0].date
          setExpandedDay(firstDate)
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || err.message || 'Failed to load history')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const selectedGroup = DEPARTMENT_GROUPS.find((group) => group.key === departmentFilter) || DEPARTMENT_GROUPS[0]

  const groupHasData = useMemo(
    () => raw.some((record) => selectedGroup.test(record.user || {})),
    [raw, selectedGroup]
  )

  const grouped = useMemo(() => {
    // group by date string
    const map = new Map()
    for (const r of raw) {
      const date = r.date
      if (!map.has(date)) map.set(date, [])
      map.get(date).push(r)
    }
    // sort dates desc
    const entries = Array.from(map.entries()).sort((a, b) => new Date(b[0]) - new Date(a[0]))
    return entries.map(([date, records]) => {
      const filtered = records.filter((r) => {
        const late = isLate(r.marked_at)
        const status = late ? 'late' : 'present'
        const matchStatus = statusFilter === 'All' || status === statusFilter.toLowerCase()
        const q = search.trim().toLowerCase()
        const matchSearch = !q
          || (r.user?.name || '').toLowerCase().includes(q)
          || (r.user?.email || '').toLowerCase().includes(q)
          || String(r.user_id || '').toLowerCase().includes(q)
        const matchDepartment = selectedGroup.test(r.user || {})
        return matchStatus && matchSearch && matchDepartment
      })
      // map to display shape
      const displayRecords = filtered.map((r) => {
        const late = isLate(r.marked_at)
        const checkIn = parseServerTime(r.marked_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        return {
          id: r.id,
          name: r.user?.name || 'Unknown',
          email: r.user?.email || '',
          uid: r.user_id,
          role: r.user?.department || r.user?.school || '—',
          checkIn,
          checkOut: '--',
          status: late ? 'late' : 'present',
          photo: null,
        }
      })
      return { day: formatDay(date), rawDate: date, records: displayRecords }
    }).filter((d) => d.records.length > 0)
  }, [raw, search, statusFilter, selectedGroup])

  // Flatten the already-filtered groups so export respects search + department + status
  const exportFlat = useMemo(() => {
    return grouped.flatMap((d) => d.records.map((r) => ({ ...r, rawDate: d.rawDate, day: d.day })))
  }, [grouped])

  const totals = useMemo(() => {
    let present = 0, late = 0
    for (const r of exportFlat) {
      if (r.status === 'late') late++
      else present++
    }
    // absent not computable without total users * days; show 0 for now
    return { present, late, absent: 0, total: exportFlat.length }
  }, [exportFlat])

  function exportSuffix() {
    return departmentFilter === 'all' ? '' : `-${departmentFilter.replace(/_/g, '-')}`
  }

  function handleExportDetailed() {
    const rows = buildDetailedFromHistory(exportFlat)
    downloadCSV(`attendance-detailed${exportSuffix()}-${todayStamp()}.csv`, rows)
  }

  function handleExportSummary() {
    const rows = buildSummaryFromHistory(exportFlat)
    downloadCSV(`attendance-summary${exportSuffix()}-${todayStamp()}.csv`, rows)
  }

  if (loading) return <div style={{ padding: 24, color: '#6b7280' }}>Loading attendance history…</div>
  if (error) return <div style={{ padding: 24 }}><p className="error-msg">{error}</p></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance History</h1>
          <p className="page-desc">Browse daily attendance records. Filter by department, status or name — exports use the current filters.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-outline" onClick={handleExportSummary} disabled={exportFlat.length === 0}>
            Export Summary
          </button>
          <button type="button" className="btn btn-outline" onClick={handleExportDetailed} disabled={exportFlat.length === 0}>
            Export Detailed
          </button>
        </div>
      </div>

      <div className="hist-stats">
        <div className="hist-stat present">
          <p className="hist-num">{totals.present}</p>
          <p className="hist-label">Present</p>
        </div>
        <div className="hist-stat late">
          <p className="hist-num">{totals.late}</p>
          <p className="hist-label">Late</p>
        </div>
        <div className="hist-stat total">
          <p className="hist-num">{totals.total}</p>
          <p className="hist-label">Total Records</p>
        </div>
      </div>

      <div className="al-search-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input
          type="text"
          className="al-search-input"
          placeholder="Search by name or employee ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-row" style={{ marginBottom: 14 }}>
        <select
          className="dropdown-btn"
          value={departmentFilter}
          onChange={e => setDepartmentFilter(e.target.value)}
          style={{ appearance: 'auto', flex: '0 1 280px', minWidth: 0 }}
          aria-label="Filter by department"
        >
          <option value="all">All Records</option>
          {DEPARTMENT_GROUPS.filter((group) => group.key !== 'all').map((group) => (
            <option key={group.key} value={group.key}>{group.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-row chips">
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            type="button"
            className={`filter-chip${statusFilter === f ? ' is-active' : ''}`}
            onClick={() => setStatusFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="history-days">
        {grouped.length === 0 ? (
          <p className="empty-state">
            {selectedGroup.key !== 'all' && !groupHasData
              ? `No attendance data for ${selectedGroup.label} yet.`
              : 'No records match your search or filters.'}
          </p>
        ) : grouped.map(day => (
          <div key={day.rawDate}>
            <button
              type="button"
              onClick={() => setExpandedDay(expandedDay === day.rawDate ? null : day.rawDate)}
              className={`day-head${expandedDay === day.rawDate ? ' is-open' : ''}`}
            >
              <span>{day.day}</span>
              <span className="day-head-right">
                <span className="day-count">{day.records.length} records</span>
                <svg className="day-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
              </span>
            </button>

            {expandedDay === day.rawDate && (
              <div className="checkin-list attached">
                {day.records.map(r => (
                  <div key={r.id} className="checkin-row">
                    <div className="checkin-avatar initials" style={{ background: initialsBg(r.name), color: '#fff' }}>
                      {initials(r.name)}
                    </div>
                    <div className="checkin-info">
                      <p className="checkin-name">{r.name}</p>
                      <p className="checkin-meta">{r.uid.slice(0,8)} · {r.role} · {r.email}</p>
                    </div>
                    <div className="checkin-status">
                      <span className={`status-badge ${r.status}`}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
                      <span className="checkin-time">In: {r.checkIn} · Out: {r.checkOut}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
