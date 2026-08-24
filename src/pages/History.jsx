import { useState } from 'react'

const HISTORY_DATA = [
  {
    day: 'Monday, Aug 18',
    records: [
      { name: 'Sarah Jenkins', id: 'EMP-001', role: 'Admin', checkIn: '08:58 AM', checkOut: '05:02 PM', status: 'present', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces' },
      { name: 'Michael Rossi', id: 'EMP-002', role: 'Staff', checkIn: '09:18 AM', checkOut: '05:10 PM', status: 'late', photo: null },
      { name: 'David Chen', id: 'EMP-003', role: 'Staff', checkIn: '08:45 AM', checkOut: '04:55 PM', status: 'present', photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop&crop=faces' },
      { name: 'Priya Patel', id: 'EMP-004', role: 'Staff', checkIn: '--', checkOut: '--', status: 'absent', photo: null },
    ],
  },
  {
    day: 'Friday, Aug 15',
    records: [
      { name: 'Sarah Jenkins', id: 'EMP-001', role: 'Admin', checkIn: '08:52 AM', checkOut: '05:05 PM', status: 'present', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces' },
      { name: 'Michael Rossi', id: 'EMP-002', role: 'Staff', checkIn: '09:01 AM', checkOut: '05:00 PM', status: 'present', photo: null },
      { name: 'David Chen', id: 'EMP-003', role: 'Staff', checkIn: '09:35 AM', checkOut: '05:15 PM', status: 'late', photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop&crop=faces' },
      { name: 'Priya Patel', id: 'EMP-004', role: 'Staff', checkIn: '08:47 AM', checkOut: '04:50 PM', status: 'present', photo: null },
    ],
  },
  {
    day: 'Thursday, Aug 14',
    records: [
      { name: 'Sarah Jenkins', id: 'EMP-001', role: 'Admin', checkIn: '09:00 AM', checkOut: '05:00 PM', status: 'present', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces' },
      { name: 'Michael Rossi', id: 'EMP-002', role: 'Staff', checkIn: '09:42 AM', checkOut: '05:20 PM', status: 'late', photo: null },
      { name: 'David Chen', id: 'EMP-003', role: 'Staff', checkIn: '--', checkOut: '--', status: 'absent', photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop&crop=faces' },
      { name: 'Priya Patel', id: 'EMP-004', role: 'Staff', checkIn: '08:55 AM', checkOut: '05:05 PM', status: 'present', photo: null },
    ],
  },
]

const STATUS_FILTERS = ['All', 'Present', 'Late', 'Absent']

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function initialsBg(name) {
  const colors = ['#7a1236', '#1d4ed8', '#047857', '#b45309', '#6d28d9', '#be185d']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function History() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [expandedDay, setExpandedDay] = useState(HISTORY_DATA[0].day)

  const filtered = HISTORY_DATA.map(day => {
    const records = day.records.filter(r => {
      const matchStatus = statusFilter === 'All' || r.status === statusFilter.toLowerCase()
      const q = search.trim().toLowerCase()
      const matchSearch = !q || r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
    return { ...day, records }
  }).filter(day => day.records.length > 0)

  const totalPresent = HISTORY_DATA.reduce((acc, d) => acc + d.records.filter(r => r.status === 'present').length, 0)
  const totalLate = HISTORY_DATA.reduce((acc, d) => acc + d.records.filter(r => r.status === 'late').length, 0)
  const totalAbsent = HISTORY_DATA.reduce((acc, d) => acc + d.records.filter(r => r.status === 'absent').length, 0)
  const totalAll = totalPresent + totalLate + totalAbsent

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance History</h1>
          <p className="page-desc">Browse daily attendance records for all employees.</p>
        </div>
      </div>

      <div className="hist-stats">
        <div className="hist-stat present">
          <p className="hist-num">{totalPresent}</p>
          <p className="hist-label">Present</p>
        </div>
        <div className="hist-stat late">
          <p className="hist-num">{totalLate}</p>
          <p className="hist-label">Late</p>
        </div>
        <div className="hist-stat absent">
          <p className="hist-num">{totalAbsent}</p>
          <p className="hist-label">Absent</p>
        </div>
        <div className="hist-stat total">
          <p className="hist-num">{totalAll}</p>
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
        {filtered.length === 0 ? (
          <p className="empty-state">No records match your search.</p>
        ) : filtered.map(day => (
          <div key={day.day}>
            <button
              type="button"
              onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
              className={`day-head${expandedDay === day.day ? ' is-open' : ''}`}
            >
              <span>{day.day}</span>
              <span className="day-head-right">
                <span className="day-count">{day.records.length} records</span>
                <svg className="day-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
              </span>
            </button>

            {expandedDay === day.day && (
              <div className="checkin-list attached">
                {day.records.map(r => (
                  <div key={r.id} className="checkin-row">
                    {r.photo ? (
                      <img className="checkin-avatar" src={r.photo} alt={r.name} />
                    ) : (
                      <div className="checkin-avatar initials" style={{ background: initialsBg(r.name), color: '#fff' }}>
                        {initials(r.name)}
                      </div>
                    )}
                    <div className="checkin-info">
                      <p className="checkin-name">{r.name}</p>
                      <p className="checkin-meta">{r.id} &middot; {r.role}</p>
                    </div>
                    <div className="checkin-status">
                      <span className={`status-badge ${r.status}`}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
                      <span className="checkin-time">
                        {r.status === 'absent' ? 'No record' : `In: ${r.checkIn} \u00B7 Out: ${r.checkOut}`}
                      </span>
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
