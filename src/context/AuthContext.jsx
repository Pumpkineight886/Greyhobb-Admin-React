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
      // If the backend reports a role and it isn't admin, this account may not use the admin app.
      // (Older backends send no role; they are allowed through until the backend is upgraded.)
      if (res.data.role && res.data.role !== 'admin') throw new Error('not-admin')
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
      if (me.data.role && me.data.role !== 'admin') {
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

  const signup = useCallback(async ({ name, email, department, school, password }) => {
    setLoading(true)
    try {
      await api.post('/auth/signup', { name, email, department, school, password })
      // auto-login after signup
      return await login(email, password)
    } finally {
      setLoading(false)
    }
  }, [login])

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
    signup,
    logout,
    fetchMe,
    setUser,
  }), [user, token, isAuthenticated, loading, initializing, login, signup, logout, fetchMe])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
