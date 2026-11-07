import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  const isAuthenticated = !!token

  const fetchMe = useCallback(async () => {
    if (!token) {
      setInitializing(false)
      return
    }
    try {
      const res = await api.get('/auth/me')
      if (res.data.role !== 'admin') throw new Error('not-admin')
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
    } catch {
      setUser(null)
      setToken(null)
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    } finally {
      setInitializing(false)
    }
  }, [token])

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const accessToken = res.data.access_token
      localStorage.setItem('access_token', accessToken)
      setToken(accessToken)
      // fetch user profile
      const me = await api.get('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } })
      if (me.data.role !== 'admin') {
        // Valid account, but not an admin: don't keep the session.
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
        const err = new Error('Access denied')
        err.response = { data: { detail: 'Access denied. This account does not have admin access.' } }
        throw err
      }
      localStorage.setItem('user', JSON.stringify(me.data))
      setUser(me.data)
      return me.data
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    loading,
    initializing,
    login,
    logout,
    fetchMe,
    setUser,
  }), [user, token, isAuthenticated, loading, initializing, login, logout, fetchMe])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
