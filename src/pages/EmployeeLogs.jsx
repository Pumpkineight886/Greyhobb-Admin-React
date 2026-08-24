import { useState } from 'react'

const MOCK_AUDIT_LOGS = [
  { id: 'log-1', actor: 'J. Smith', action: 'Changed Biometric Policy', description: 'Updated strictness level for HQ terminal.', timestamp: '2023-10-24T14:32:01', ipAddress: '192.168.1.105', flagged: false },
  { id: 'log-2', actor: 'A. Davis', action: 'Deactivated User', description: 'Account ID: EMP-4092 flagged for review.', timestamp: '2023-10-24T11:15:44', ipAddress: '10.0.4.22', flagged: true },
  { id: 'log-3', actor: 'System', action: 'Automated Backup', description: 'Daily attendance records archived.', timestamp: '2023-10-24T03:00:00', location: 'Local Server', flagged: false },
  { id: 'log-4', actor: 'M. Chen', action: 'Admin Login', description: 'Successful authentication.', timestamp: '2023-10-23T21:47:12', ipAddress: '172.16.0.9', flagged: false },
]

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

  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    const query = search.trim().toLowerCase()
    if (!query) return true
    const haystack = [log.actor, log.action, log.description, log.ipAddress, log.location]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })

  return (
    <div className="audit-logs-page">
      <header className="al-header">
        <h1 className="al-title">Audit Logs</h1>
        <p className="al-subtitle">Track and monitor administrative actions.</p>
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
        {filteredLogs.map((log) => (
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
                  <span>IP Address: {log.ipAddress}</span>
                </div>
              )}
              {log.location && (
                <div className="al-meta-row">
                  <span>Location: {log.location}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <p className="al-empty">No audit logs match your search.</p>
        )}
      </div>
    </div>
  )
}
