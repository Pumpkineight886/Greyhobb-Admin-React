import { useState } from 'react'

const STAFF_DATA = [
  { name: 'Alexander Chen', id: 'STU-9021', status: 'Enrolled', role: 'Cybersecurity', weeks: '12 Weeks' },
  { name: 'Beatrice Davis', id: 'STU-8834', status: 'Suspended', role: 'Backend Dev.', weeks: '12 Weeks' },
  { name: 'Carlos Gomez', id: 'STU-7112', status: 'Enrolled', role: 'Frontend Dev.', weeks: '12 Weeks' },
  { name: 'David Kim', id: 'STU-9901', status: 'Leave', role: 'UI/UX Design', weeks: '10 Weeks' },
]

const FILTERS = ['All', 'Enrolled', 'Suspended', 'Leave']

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function StudentDirectory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const filteredStaff = STAFF_DATA.filter((staff) => {
    const matchesFilter = activeFilter === 'All' || staff.status === activeFilter
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch =
      query === '' ||
      staff.name.toLowerCase().includes(query) ||
      staff.id.toLowerCase().includes(query)
    return matchesFilter && matchesSearch
  })

  return (
    <section>
      <div className="search-wrap">
        <img src="/assets/search-icon.png" alt="" className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search staff by name or ID..."
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
        {filteredStaff.length === 0 ? (
          <div className="empty-state">No students match your search.</div>
        ) : (
          filteredStaff.map((staff) => (
            <article key={staff.id} className="staff-card">
              <div className="staff-card-top">
                <div className="staff-avatar placeholder" aria-hidden="true">
                  {initials(staff.name)}
                </div>
                <div className="staff-identity">
                  <h3 className="staff-name">{staff.name}</h3>
                  <p className="staff-id">{staff.id}</p>
                </div>
                <span className={`status-badge status-${staff.status.toLowerCase()}`}>
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
