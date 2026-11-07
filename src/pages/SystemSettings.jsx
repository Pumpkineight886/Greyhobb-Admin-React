import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { parseServerTime } from '../lib/datetime.js'
import { isLate } from '../lib/attendance.js'
import { buildDetailedFromHistory, downloadCSV, todayStamp } from '../lib/export.js'
import { formatDayLong, formatDepartment } from '../lib/users.js'
import { readStored, writeStored, removeStored } from '../lib/storage.js'

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
    label: 'Employee Logs',
    icon: '/assets/audit-logs-icon.png',
    to: '/employee-logs',
  },
]

const SETTINGS_KEY = 'greyhobb.systemSettings'

const DEFAULT_SETTINGS = {
  requireLocation: true,
  autoClockOut: false,
  missingScanAlerts: true,
  overtimeThreshold: false,
  timezone: 'Africa/Lagos',
}

const TIMEZONES = [
  { value: 'Africa/Lagos', label: 'WAT — West Africa Time (UTC+1)' },
  { value: 'UTC', label: 'UTC — Coordinated Universal Time' },
  { value: 'Europe/London', label: 'GMT — London' },
  { value: 'America/New_York', label: 'EST — New York' },
  { value: 'America/Chicago', label: 'CST — Chicago' },
  { value: 'America/Denver', label: 'MST — Denver' },
  { value: 'America/Los_Angeles', label: 'PST — Los Angeles' },
]

function Toggle({ checked, onChange, label }) {
  return (
    <label className="admin-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
      <span className="admin-toggle-track" />
    </label>
  )
}

export default function SystemSettings() {
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...readStored(SETTINGS_KEY, {}) }))
  const [exporting, setExporting] = useState(false)

  function update(key, value) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      writeStored(SETTINGS_KEY, next)
      return next
    })
  }

  function resetLocalSettings() {
    if (!window.confirm('Reset all system settings saved in this browser to their defaults? Server data is not affected.')) return
    removeStored(SETTINGS_KEY)
    setSettings({ ...DEFAULT_SETTINGS })
  }

  async function handleDataExport() {
    setExporting(true)
    try {
      const [usersRes, attendanceRes] = await Promise.allSettled([
        api.get('/auth/users'),
        api.get('/attendance/all'),
      ])

      let exported = 0

      if (usersRes.status === 'fulfilled') {
        const rows = (usersRes.value.data || []).map((u) => ({
          Name: u.name || '',
          Email: u.email || '',
          ID: String(u.id || '').slice(0, 8).toUpperCase(),
          Department: formatDepartment(u.department),
          Programme: u.school || '',
          Created: u.created_at ? parseServerTime(u.created_at).toLocaleString() : '',
        }))
        downloadCSV(`greyhobb-users-${todayStamp()}.csv`, rows)
        exported += 1
      }

      if (attendanceRes.status === 'fulfilled') {
        const flat = (attendanceRes.value.data || []).map((r) => ({
          rawDate: r.date,
          day: formatDayLong(r.date),
          name: r.user?.name || 'Unknown',
          email: r.user?.email || '',
          uid: String(r.user_id || '').slice(0, 8).toUpperCase(),
          role: formatDepartment(r.user?.department),
          checkIn: parseServerTime(r.marked_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          status: isLate(r.marked_at) ? 'late' : 'present',
        }))
        downloadCSV(`greyhobb-attendance-${todayStamp()}.csv`, buildDetailedFromHistory(flat))
        exported += 1
      }

      if (exported === 0) {
        alert('Could not reach the server. Nothing was exported.')
      }
    } finally {
      setExporting(false)
    }
  }

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
            <Toggle
              checked={settings.requireLocation}
              onChange={(v) => update('requireLocation', v)}
              label="Require Location Services"
            />
          </div>

          <div className="admin-setting-row">
            <div className="admin-setting-text">
              <h3>Automatic Clock-Out</h3>
              <p>Automatically sign out employees at end of scheduled shift.</p>
            </div>
            <Toggle
              checked={settings.autoClockOut}
              onChange={(v) => update('autoClockOut', v)}
              label="Automatic Clock-Out"
            />
          </div>

          <div className="admin-select-row">
            <label htmlFor="default-timezone">Default Timezone</label>
            <div className="admin-select-wrap">
              <select
                id="default-timezone"
                value={settings.timezone}
                onChange={(e) => update('timezone', e.target.value)}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
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
            <Toggle
              checked={settings.missingScanAlerts}
              onChange={(v) => update('missingScanAlerts', v)}
              label="Missing Scan Alerts"
            />
          </div>

          <div className="admin-setting-row">
            <div className="admin-setting-text">
              <h3>Overtime Threshold</h3>
            </div>
            <Toggle
              checked={settings.overtimeThreshold}
              onChange={(v) => update('overtimeThreshold', v)}
              label="Overtime Threshold"
            />
          </div>
        </article>

        <article className="admin-card admin-card--span-2">
          <header className="admin-card-header">
            <img src="/assets/command-prompt-svgrepo-com.svg" alt="" />
            <h2>Advanced Options</h2>
          </header>

          <p className="admin-warning-text">
            Preferences on this page are saved on this device.
          </p>

          <div className="admin-btn-row">
            <button type="button" className="admin-btn" onClick={handleDataExport} disabled={exporting}>
              {exporting ? 'Preparing…' : 'Data Export'}
            </button>
            <button type="button" className="admin-btn admin-btn-danger" onClick={resetLocalSettings}>
              Reset Local Settings
            </button>
          </div>
        </article>
      </div>
    </section>
  )
}
