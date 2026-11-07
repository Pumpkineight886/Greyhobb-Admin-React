import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      return
    }
    try {
      await login(email.trim(), password)
      navigate('/home', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Check your credentials.'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f8', padding: 20 }}>
      <div style={{ background: '#fff', border: '1px solid #eeeeee', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', padding: 32, width: '100%', maxWidth: 420 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#7a1236', margin: '0 0 6px' }}>Welcome back</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 20px' }}>Sign in to Greyhobb Admin</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input id="login-email" type="email" placeholder="you@greysoft.tech" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input id="login-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
          Admin accounts are created by the system administrator.
        </p>
        {import.meta.env.DEV && (
          <p style={{ marginTop: 12, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
            API: {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
          </p>
        )}
      </div>
    </div>
  )
}
