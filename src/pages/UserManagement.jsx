import { useEffect, useRef, useState } from 'react'
import api from '../api/axios'

function initials(name) {
  return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [statusFilter, setStatusFilter] = useState('Status')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalName, setModalName] = useState('')
  const [modalEmail, setModalEmail] = useState('')
  const [modalDepartment, setModalDepartment] = useState('')
  const [modalSchool, setModalSchool] = useState('')
  const [modalPassword, setModalPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const menuRef = useRef(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/auth/users')
      // Map backend User to display shape
      const mapped = res.data.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.department || 'Staff',
        department: u.department,
        school: u.school,
        status: 'Active',
        lastLogin: new Date(u.created_at).toLocaleDateString(),
        photo: null,
        created_at: u.created_at,
      }))
      setUsers(mapped)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const filtered = users.filter(u => {
    const q = query.trim().toLowerCase()
    return (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      && (roleFilter === 'All Roles' || u.role === roleFilter || u.department === roleFilter)
      && (statusFilter === 'Status' || u.status === statusFilter)
  })

  const addUser = async (e) => {
    e.preventDefault()
    if (!modalName.trim() || !modalEmail.trim() || !modalDepartment.trim() || !modalSchool.trim() || !modalPassword.trim()) {
      setFormError('All fields are required.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(modalEmail)) { setFormError('Enter a valid email address.'); return }
    if (modalPassword.length < 6) { setFormError('Password must be at least 6 characters.'); return }
    setSubmitting(true)
    setFormError('')
    try {
      await api.post('/auth/signup', {
        name: modalName.trim(),
        email: modalEmail.trim(),
        department: modalDepartment.trim(),
        school: modalSchool.trim(),
        password: modalPassword,
      })
      setShowModal(false)
      setModalName(''); setModalEmail(''); setModalDepartment(''); setModalSchool(''); setModalPassword(''); setFormError('')
      await fetchUsers()
    } catch (err) {
      const detail = err.response?.data?.detail
      let msg = 'Failed to create user.'
      if (typeof detail === 'string') msg = detail
      else if (Array.isArray(detail)) msg = detail.map(d => d.msg || JSON.stringify(d)).join(', ')
      else if (detail) msg = JSON.stringify(detail)
      setFormError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app">
      <main>
        <div className="page-header">
          <div>
            <h2 className="page-title">User Management</h2>
            <p className="page-desc">Live users from <code>GET /auth/users</code> — backed by MySQL/SQLite via FastAPI.</p>
          </div>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" /></svg>
            Add New User
          </button>
        </div>

        {error && <p className="error-msg" style={{ marginBottom: 12 }}>{error}</p>}

        <div className="filter-card">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Search users by name or email..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <div className="filter-row" ref={menuRef}>
            <div className="dropdown" style={{ position: 'relative', flex: 1 }}>
              <select className="dropdown-btn" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ appearance: 'auto' }}>
                <option>All Roles</option>
                <option>Frontend</option>
                <option>Backend</option>
                <option>Admin</option>
                <option>Staff</option>
              </select>
            </div>
            <div className="dropdown" style={{ position: 'relative', flex: 1 }}>
              <select className="dropdown-btn" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ appearance: 'auto' }}>
                <option>Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <button className="btn btn-outline" onClick={fetchUsers} disabled={loading}>{loading ? '...' : 'Refresh'}</button>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: 24 }}>Loading users…</p>
        ) : (
          <div className="card-list">
            {filtered.length === 0 ? (
              <p className="empty-state">No users match your search. {users.length === 0 ? 'Create a user to get started.' : ''}</p>
            ) : filtered.map(u => (
              <div key={u.id} className="user-card">
                <div className="user-top">
                  <div className="user-info">
                    <div className="user-avatar">{initials(u.name)}</div>
                    <div><p className="user-name">{u.name}</p><p className="user-email">{u.email}</p></div>
                  </div>
                  <button className="menu-btn" onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="4" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="10" cy="16" r="1.5" /></svg>
                  </button>
                  <div className={`menu-dropdown${openMenuId === u.id ? ' open' : ''}`}>
                    <button onClick={() => { navigator.clipboard.writeText(u.id); setOpenMenuId(null) }}>Copy ID</button>
                    <button className="danger" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Remove (not implemented)</button>
                  </div>
                </div>
                <div className="user-bottom">
                  <div className="badges">
                    <span className="badge staff">{u.department?.toUpperCase() || 'STAFF'}</span>
                    <span className="badge active">{u.status.toUpperCase()}</span>
                  </div>
                  <div className="last-login"><p className="label">School</p><p className="value">{u.school}</p></div>
                </div>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '8px 0 0' }}>ID: {u.id} · Created: {new Date(u.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button onClick={() => { setShowModal(false); setFormError('') }}>&times;</button>
            </div>
            <form onSubmit={addUser}>
              <div className="field">
                <label>Full Name</label>
                <input type="text" placeholder="Enter full name" value={modalName} onChange={e => setModalName(e.target.value)} />
              </div>
              <div className="field">
                <label>Email Address</label>
                <input type="email" placeholder="user@greysoft.com" value={modalEmail} onChange={e => setModalEmail(e.target.value)} />
              </div>
              <div className="field">
                <label>Department</label>
                <input type="text" placeholder="e.g. Frontend" value={modalDepartment} onChange={e => setModalDepartment(e.target.value)} />
              </div>
              <div className="field">
                <label>School</label>
                <input type="text" placeholder="e.g. Engineering" value={modalSchool} onChange={e => setModalSchool(e.target.value)} />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" placeholder="••••••" value={modalPassword} onChange={e => setModalPassword(e.target.value)} />
              </div>
              {formError && <p className="error-msg">{formError}</p>}
              <button type="submit" className="submit-btn" disabled={submitting}>{submitting ? 'Creating…' : 'Add User'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
