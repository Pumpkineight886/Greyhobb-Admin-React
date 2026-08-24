const attendanceData = [
  { label: 'Mon', value: 58 },
  { label: 'Tue', value: 68 },
  { label: 'Wed', value: 61 },
  { label: 'Thu', value: 79 },
  { label: 'Fri', value: 88 },
]

const lateBreakdown = [
  { label: 'Frontend', value: 15 },
  { label: 'Backend', value: 12 },
]

export default function AnalyticsReports() {
  const maxLate = Math.max(...lateBreakdown.map((item) => item.value))

  return (
    <>
      <header className="reports-header">
        <h1>Analytics Reports</h1>
        <p>Overview of attendance metrics for the current month.</p>
      </header>

      <div className="reports-grid">
        <section className="report-card">
          <div className="report-card-head">
            <h3 className="report-card-title">Daily Attendance Rate</h3>
            <span className="trend-badge">
              <img src="/assets/rate-arrow-icon.png" alt="" />
              <span className="trend-value">+2.4%</span>
            </span>
          </div>
          <p className="report-card-sub">Average across all departments</p>

          <div className="chart-bars">
            {attendanceData.map(({ label, value }) => (
              <div className="chart-bar-col" key={label}>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill" style={{ height: `${value}%` }} />
                </div>
                <span className="chart-bar-label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="report-card">
          <div className="late-icon">
            <img src="/assets/late-arrivals-icon.png" alt="Late arrivals" />
          </div>
          <h3 className="report-card-title">Late Arrivals</h3>
          <div className="late-count">42</div>
          <p className="late-sub">This week across all branches.</p>

          <div className="late-breakdown">
            {lateBreakdown.map(({ label, value }) => (
              <div key={label}>
                <div className="late-row-head">
                  <span className="late-row-label">{label}</span>
                  <span className="late-row-value">{value}</span>
                </div>
                <div className="late-progress-track">
                  <div
                    className="late-progress-fill"
                    style={{ width: `${(value / maxLate) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
