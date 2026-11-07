// CSV export helpers — frontend-only, no backend change needed.
// Works with already-filtered data so search/department filters carry over to the file.

function escapeCell(value) {
  const s = value === null || value === undefined ? '' : String(value)
  // Quote if contains comma, quote, or newline; double up quotes per RFC 4180
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function toCSV(rows) {
  if (!rows || rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [headers.map(escapeCell).join(',')]
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCell(row[h])).join(','))
  }
  // BOM so Excel opens UTF-8 correctly
  return '﻿' + lines.join('\n')
}

export function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) {
    alert('No records to export for current filter.')
    return
  }
  const csv = toCSV(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function todayStamp() {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

// flat: [{ rawDate, day, name, email, uid, role, checkIn, status }]
export function buildDetailedFromHistory(flat) {
  return flat.map((r) => ({
    Name: r.name,
    Email: r.email,
    ID: r.uid,
    Department: r.role,
    CheckIn: r.checkIn,
    Date: r.day,
    Status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
  }))
}

// One row per student: early/on-time vs late breakdown
export function buildSummaryFromHistory(flat) {
  const map = new Map()
  for (const r of flat) {
    const key = r.uid || r.email || r.name
    if (!map.has(key)) {
      map.set(key, {
        Name: r.name,
        Email: r.email,
        ID: r.uid,
        Department: r.role,
        Present: 0,
        Late: 0,
        TotalRecords: 0,
        LastSeen: r.day,
        _lastRaw: r.rawDate,
      })
    }
    const entry = map.get(key)
    if (r.status === 'late') entry.Late += 1
    else entry.Present += 1
    entry.TotalRecords += 1
    // rawDate is YYYY-MM-DD so string compare works for latest, display day format
    if (r.rawDate > entry._lastRaw) {
      entry._lastRaw = r.rawDate
      entry.LastSeen = r.day
    }
  }
  // One row per student, no duplicate OnTime column (Present covers it)
  return Array.from(map.values()).map(({ _lastRaw, ...rest }) => rest)
}
