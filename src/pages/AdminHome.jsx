function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

const stats = [
  { id: 'present', label: 'Present', value: 35, tone: 'present', Icon: CheckIcon },
  { id: 'late', label: 'Late', value: 4, tone: 'late', Icon: ClockIcon },
  { id: 'absent', label: 'Absent', value: 3, tone: 'absent', Icon: XIcon },
]

const recentCheckins = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Front Desk',
    time: 'Checked in · 7:42 AM',
    status: 'present',
    initials: 'SJ',
  },
  {
    id: 2,
    name: 'Michael Chang',
    role: 'IT Support',
    time: 'Checked in · 8:16 AM',
    status: 'late',
    initials: 'MC',
  },
  {
    id: 3,
    name: 'David Okafor',
    role: 'Security',
    time: 'Checked in · 8:24 AM',
    status: 'present',
    initials: 'DO',
  },
]

export default function AdminHome() {
  return (
    <>
      <section className="overview">
        <div className="overview-row">
          <div>
            <h1>Overview</h1>
            <p>Today&rsquo;s Attendance Summary</p>
          </div>
          <div className="overview-actions">
            <button type="button" className="pill-btn">
              <CalendarIcon />
              Today
            </button>
          </div>
        </div>
      </section>

      <section className="stat-grid">
        {stats.map(({ id, label, value, tone, Icon }) => (
          <article key={id} className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">{label}</span>
              <span className={`stat-icon ${tone}`}>
                <Icon />
              </span>
            </div>
            <div className="stat-value-row">
              <span className="stat-value">{value}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="checkins">
        <h2>Recent Check-ins</h2>
        <div className="checkin-list">
          {recentCheckins.map(({ id, name, role, time, status, initials }) => (
            <div key={id} className="checkin-row">
              <div className="checkin-avatar initials">{initials}</div>
              <div className="checkin-info">
                <div className="checkin-name">{name}</div>
                <div className="checkin-meta">{role}</div>
              </div>
              <div className="checkin-status">
                <span className={`status-badge ${status}`}>{status}</span>
                <span className="checkin-time">{time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
