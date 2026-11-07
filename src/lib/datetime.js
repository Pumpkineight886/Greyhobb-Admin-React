// Backend timestamps are naive UTC (no timezone suffix), e.g.
// "2026-10-08T07:46:00". A browser would read that as local time, showing
// one hour behind in WAT (UTC+1). parseServerTime treats timezone-less
// timestamps as UTC and leaves date-only values as local calendar dates.

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
const HAS_TZ = /(?:[zZ]|[+-]\d{2}:?\d{2})$/

export function parseServerTime(value) {
  if (value instanceof Date) return value
  if (value === null || value === undefined || value === '') return new Date(NaN)

  const s = String(value).trim()
  if (DATE_ONLY.test(s)) return new Date(`${s}T00:00:00`)
  if (HAS_TZ.test(s)) return new Date(s)

  return new Date(`${s.replace(' ', 'T')}Z`)
}
