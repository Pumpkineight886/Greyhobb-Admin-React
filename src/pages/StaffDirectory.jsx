import { useState } from 'react'

const STAFF_DATA = [
  { name: "Alexander Chen", id: "STU-9021", status: "Enrolled", role: "Cybersecurity", weeks: "12 Weeks" },
  { name: "Beatrice Davis", id: "STU-8834", status: "Suspended", role: "Backend Dev.", weeks: "12 Weeks" },
  { name: "Carlos Gomez", id: "STU-7112", status: "Enrolled", role: "Frontend Dev.", weeks: "12 Weeks" },
  { name: "David Kim", id: "STU-9901", status: "Leave", role: "UI/UX Design", weeks: "10 Weeks" },
]

const STATUS_CLASS = {
  Enrolled: 'status-enrolled',
  Suspended: 'status-suspended',
  Leave: 'status-leave',
}

export default function StaffDirectory() {
  const [query, setQuery] = useState('')

  const filteredStaff = STAFF_DATA.filter(
    (staff) =>
      staff.name.toLowerCase().includes(query.toLowerCase()) ||
      staff.id.toLowerCase().includes(query.toLowerCase())
  )

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
          <p>Monitor and manage employee check-ins and check-outs.</p>
        </div>
        <div className="directory-header-actions">
          <button type="button" className="btn-filter">
            <img src="/assets/filter-icon.png" alt="" />
            Filter
          </button>
          <button type="button" className="btn-export">
            <img src="/assets/export-icon.png" alt="" />
            Export
          </button>
        </div>
      </div>

      <div className="staff-list">
        {filteredStaff.length === 0 ? (
          <div className="empty-state">No staff found.</div>
        ) : (
          filteredStaff.map((staff) => (
            <article key={staff.id} className="staff-card">
              <div className="staff-card-top">
                <img src="/assets/alex-mercer.png" alt={staff.name} className="staff-avatar" />
                <div className="staff-identity">
                  <span className="staff-name">{staff.name}</span>
                  <span className="staff-id">{staff.id}</span>
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
