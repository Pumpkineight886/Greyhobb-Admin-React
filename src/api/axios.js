import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'


// ---- "server is waking up" notice ----
// Free hosting puts the server to sleep; the first request can take up to a minute.
// If any request is still pending after 4s, tell the UI (see ServerWakeNotice).
const SLOW_AFTER_MS = 4000;
let pendingRequests = 0;
let slowTimer = null;
function announceSlow(isSlow) {
  window.dispatchEvent(new CustomEvent('api:slow', { detail: isSlow }));
}
function requestStarted() {
  pendingRequests += 1;
  if (!slowTimer) slowTimer = setTimeout(() => announceSlow(true), SLOW_AFTER_MS);
}
function requestFinished() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  if (pendingRequests === 0) {
    clearTimeout(slowTimer);
    slowTimer = null;
    announceSlow(false);
  }
}

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  requestStarted()
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => {
    requestFinished()
    return res
  },
  (err) => {
    requestFinished()
    if (err.response && err.response.status === 401) {
      const url = err.config?.url || ''
      // Don't redirect if the 401 is from login itself
      if (!url.includes('/auth/login') && !url.includes('/auth/signup')) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export default api
export { API_BASE }
