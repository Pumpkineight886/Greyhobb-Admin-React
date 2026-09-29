import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', department: '', school: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.department.trim() || !form.school.trim() || !form.password.trim()) {
      setError('All fields are required.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        school: form.school.trim(),
        password: form.password,
      })
      navigate('/home', { replace: true })
    } catch (err) {
      const detail = err.response?.data?.detail
      let msg = 'Signup failed.'
      if (typeof detail === 'string') msg = detail
      else if (Array.isArray(detail)) msg = detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
      else if (detail) msg = JSON.stringify(detail)
      setError(msg)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f8', padding: 20 }}>
      <div style={{ background: '#fff', border: '1px solid #eeeeee', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', padding: 32, width: '100%', maxWidth: 480 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#7a1236', margin: '0 0 6px' }}>Create account</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 20px' }}>Join Greyhobb Smart Attendance</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="su-name">Full Name</label>
            <input id="su-name" type="text" placeholder="Alex Mercer" value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="su-email">Email</label>
            <input id="su-email" type="email" placeholder="alex@greysoft.tech" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="su-dept">Department</label>
            <input id="su-dept" type="text" placeholder="Frontend" value={form.department} onChange={(e) => handleChange('department', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="su-school">School</label>
            <input id="su-school" type="text" placeholder="Engineering" value={form.school} onChange={(e) => handleChange('school', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="su-pass">Password</label>
            <input id="su-pass" type="password" placeholder="••••••••" value={form.password} onChange={(e) => handleChange('password', e.target.value)} />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
          Already have account? <Link to="/login" style={{ color: '#7a1236', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
