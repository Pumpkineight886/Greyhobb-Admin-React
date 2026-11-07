// Small helpers for browser-persisted admin preferences (frontend-only).
// These keep UI state across reloads until the backend exposes real endpoints.

export function readStored(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStored(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage may be unavailable (private mode / quota); ignore silently.
  }
}

export function removeStored(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
