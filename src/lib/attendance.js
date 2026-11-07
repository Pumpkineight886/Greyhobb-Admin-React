// Single source of truth for the late/on-time rule in the admin frontend.
// (Backend should own this eventually — see the backend follow-up list.)

import { parseServerTime } from './datetime.js'

export const LATE_CUTOFF_HOUR = 9
export const LATE_CUTOFF_MINUTE = 0

export function isLate(markedAt) {
  const d = parseServerTime(markedAt)
  if (Number.isNaN(d.getTime())) return false
  const hours = d.getHours()
  const minutes = d.getMinutes()
  return hours > LATE_CUTOFF_HOUR || (hours === LATE_CUTOFF_HOUR && minutes > LATE_CUTOFF_MINUTE)
}

export function isLateTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return hours > LATE_CUTOFF_HOUR || (hours === LATE_CUTOFF_HOUR && minutes > LATE_CUTOFF_MINUTE)
}

export function todayISO() {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

// Monday of the current week as "YYYY-MM-DD".
export function weekStartISO() {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff)
  const month = String(monday.getMonth() + 1).padStart(2, '0')
  const date = String(monday.getDate()).padStart(2, '0')
  return `${monday.getFullYear()}-${month}-${date}`
}
