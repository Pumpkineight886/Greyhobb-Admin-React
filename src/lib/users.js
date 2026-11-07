// Shared user classification helpers.
// The backend stores the user's programme in `school` (sent by the student
// signup form) and their training area in `department`.

export const SCHOOL_LABELS = {
  student: 'Student',
  siwes: 'SIWES',
  corp_member: 'Corp Member',
  tutor: 'Tutor',
  staff: 'Staff',
}

export const STUDENT_CATEGORIES = ['student', 'siwes', 'corp_member', 'tutor']

const DEPARTMENT_LABELS = {
  frontend: 'Frontend',
  backend: 'Backend',
  cyber_security: 'Cyber Security',
  'ui/ux': 'UI/UX',
  data_analytics: 'Data Analytics',
  social_media_management: 'Social Media Management',
}

export function normalizeSchool(user) {
  const raw = String(user?.school || '').trim().toLowerCase()
  if (!raw) return 'unknown'

  const key = raw.replace(/[\s-]+/g, '_')
  if (SCHOOL_LABELS[key]) return key
  if (key.includes('staff')) return 'staff'
  if (key.includes('siwes')) return 'siwes'
  if (key.includes('corp')) return 'corp_member'
  if (key.includes('tutor')) return 'tutor'
  if (key.includes('student')) return 'student'
  return 'unknown'
}

const DEPARTMENT_ALIASES = {
  frontend: 'frontend',
  backend: 'backend',
  'ui/ux': 'ui_ux',
  'ui_ux': 'ui_ux',
  'ui ux': 'ui_ux',
  'cyber_security': 'cyber_security',
  'cybersecurity': 'cyber_security',
  'cyber security': 'cyber_security',
  'data_analytics': 'data_analytics',
  'data analytics': 'data_analytics',
  'social_media_management': 'social_media_management',
  'social media management': 'social_media_management',
}

export function normalizeDepartment(value) {
  const raw = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_')
  return DEPARTMENT_ALIASES[raw] || raw
}

export function isStaff(user) {
  return normalizeSchool(user) === 'staff'
}

export function isStudent(user) {
  return STUDENT_CATEGORIES.includes(normalizeSchool(user))
}

export function categoryLabel(user) {
  return SCHOOL_LABELS[normalizeSchool(user)] || (String(user?.school || '').trim() || 'Unspecified')
}

export function formatDepartment(value) {
  const raw = String(value || '').trim()
  if (!raw) return '—'
  const mapped = DEPARTMENT_LABELS[raw.toLowerCase()]
  if (mapped) return mapped
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatDayLong(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
