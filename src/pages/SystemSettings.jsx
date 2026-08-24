import { Link } from 'react-router-dom'

const SECURITY_LINKS = [
  {
    id: 'access-control',
    label: 'Admin Access Control',
    icon: '/assets/admin-access-control-icon.png',
    to: '/access-control',
  },
  {
    id: 'biometric-policies',
    label: 'Biometric Policies',
    icon: '/assets/fingerprint-biometric-icon.png',
    to: '/biometrics',
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    icon: '/assets/audit-logs-icon.png',
    to: '/employee-logs',
  },
]

function Toggle({ defaultChecked = false, label }) {
  return (
    <label className="admin-toggle">
      <input type="checkbox" defaultChecked={defaultChecked} aria-label={label} />
      <span className="admin-toggle-track" />
    </label>
  )
}

export default function SystemSettings() {
  return (
    <section className="admin-settings-page">
      <div className="admin-heading">
        <h1>System Settings</h1>
        <p>Manage global configurations and administrative preferences.</p>
      </div>

      <div className="admin-card-grid">
        <article className="admin-card admin-card--span-2">
          <header className="admin-card-header">
            <img src="/assets/knob-settings-icon.png" alt="" />
            <h2>General Configuration</h2>
          </header>

          <div className="admin-setting-row">
            <div className="admin-setting-text">
              <h3>Require Location Services</h3>
              <p>Enforce GPS tracking for mobile attendance scans.</p>
            </div>
            <Toggle defaultChecked label="Require Location Services" />
          </div>

          <div className="admin-setting-row">
            <div className="admin-setting-text">
              <h3>Automatic Clock-Out</h3>
              <p>Automatically sign out employees at end of scheduled shift.</p>
            </div>
            <Toggle label="Automatic Clock-Out" />
          </div>

          <div className="admin-select-row">
            <label htmlFor="default-timezone">Default Timezone</label>
            <div className="admin-select-wrap">
              <select id="default-timezone" defaultValue="EST">
                <option value="EST">EST</option>
                <option value="CST">CST</option>
                <option value="MST">MST</option>
                <option value="PST">PST</option>
              </select>
              <img src="/assets/arrow-dropdown-icon.png" alt="" />
            </div>
          </div>
        </article>

        <article className="admin-card">
          <header className="admin-card-header">
            <img src="/assets/shield-security-icon.png" alt="" />
            <h2>Security</h2>
          </header>

          {SECURITY_LINKS.map(({ id, label, icon, to }) => (
            <Link key={id} to={to} className="admin-list-row">
              <img src={icon} alt="" className="admin-list-icon" />
              <span>{label}</span>
              <img src="/assets/arrow-right-icon.png" alt="" className="admin-list-chevron" />
            </Link>
          ))}
        </article>

        <article className="admin-card">
          <header className="admin-card-header">
            <img src="/assets/alert-svgrepo-com.svg" alt="" />
            <h2>Alerts</h2>
          </header>

          <div className="admin-setting-row">
            <div className="admin-setting-text">
              <h3>Missing Scan Alerts</h3>
            </div>
            <Toggle defaultChecked label="Missing Scan Alerts" />
          </div>

          <div className="admin-setting-row">
            <div className="admin-setting-text">
              <h3>Overtime Threshold</h3>
            </div>
            <Toggle label="Overtime Threshold" />
          </div>
        </article>

        <article className="admin-card admin-card--span-2">
          <header className="admin-card-header">
            <img src="/assets/command-prompt-svgrepo-com.svg" alt="" />
            <h2>Advanced Options</h2>
          </header>

          <p className="admin-warning-text">
            These actions affect the entire system and cannot be undone. Proceed only if you
            understand the consequences.
          </p>

          <div className="admin-btn-row">
            <button type="button" className="admin-btn">
              Data Export
            </button>
            <button type="button" className="admin-btn admin-btn-danger">
              Factory Reset
            </button>
          </div>
        </article>
      </div>
    </section>
  )
}
