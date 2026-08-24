import { useState, useRef, useEffect } from 'react'

const INITIAL_USERS = [
  { id: 1, name: 'Sarah Jenkins', email: 'sarah.j@greysoft.com', role: 'Admin', status: 'Active', lastLogin: '2 mins ago', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
  { id: 2, name: 'Michael Rossi', email: 'm.rossi@greysoft.com', role: 'Staff', status: 'Active', lastLogin: '4 hrs ago', photo: null },
  { id: 3, name: 'David Chen', email: 'd.chen@greysoft.com', role: 'Staff', status: 'Inactive', lastLogin: '3 days ago', photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=faces' },
]

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function UserManagement() {
  const [users, setUsers] = useState(INITIAL_USERS)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [statusFilter, setStatusFilter] = useState('Status')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalName, setModalName] = useState('')
  const [modalEmail, setModalEmail] = useState('')
  const [modalRole, setModalRole] = useState('Staff')
  const [formError, setFormError] = useState('')
  const [openRoleDrop, setOpenRoleDrop] = useState(false)
  const [openStatusDrop, setOpenStatusDrop] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null); setOpenRoleDrop(false); setOpenStatusDrop(false)
      }
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const filtered = users.filter(u => {
    const q = query.trim().toLowerCase()
    return (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      && (roleFilter === 'All Roles' || u.role === roleFilter)
      && (statusFilter === 'Status' || u.status === statusFilter)
  })

  const toggleStatus = (id) => { setUsers(p => p.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u)); setOpenMenuId(null) }
  const removeUser = (id) => { setUsers(p => p.filter(u => u.id !== id)); setOpenMenuId(null) }
  const addUser = (e) => {
    e.preventDefault()
    if (!modalName.trim() || !modalEmail.trim()) { setFormError('Name and email are required.'); return }
    if (!/^\S+@\S+\.\S+$/.test(modalEmail)) { setFormError('Enter a valid email address.'); return }
    setUsers(p => [{ id: Date.now(), name: modalName.trim(), email: modalEmail.trim(), role: modalRole, status: 'Active', lastLogin: 'Never', photo: null }, ...p])
    setShowModal(false); setModalName(''); setModalEmail(''); setModalRole('Staff'); setFormError('')
  }

  return (
    <div className="app">
      <main>
        <div className="page-header">
          <div>
            <h2 className="page-title">User Management</h2>
            <p className="page-desc">Manage application access, roles, and security policies.</p>
          </div>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" /></svg>
            Add New User
          </button>
        </div>

        <div className="filter-card">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Search users by name or email..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <div className="filter-row" ref={menuRef}>
            <div className="dropdown" style={{ position: 'relative', flex: 1 }}>
              <button className="dropdown-btn" onClick={e => { e.stopPropagation(); setOpenRoleDrop(!openRoleDrop); setOpenStatusDrop(false) }}>
                <span>{roleFilter}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <div className={`dropdown-menu${openRoleDrop ? ' open' : ''}`}>
                {['All Roles', 'Admin', 'Staff'].map(v => (
                  <button key={v} onClick={() => { setRoleFilter(v); setOpenRoleDrop(false) }}>{v}</button>
                ))}
              </div>
            </div>
            <div className="dropdown" style={{ position: 'relative', flex: 1 }}>
              <button className="dropdown-btn" onClick={e => { e.stopPropagation(); setOpenStatusDrop(!openStatusDrop); setOpenRoleDrop(false) }}>
                <span>{statusFilter}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <div className={`dropdown-menu${openStatusDrop ? ' open' : ''}`}>
                {['Status', 'Active', 'Inactive'].map(v => (
                  <button key={v} onClick={() => { setStatusFilter(v); setOpenStatusDrop(false) }}>{v}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card-list">
          {filtered.length === 0 ? (
            <p className="empty-state">No users match your search.</p>
          ) : filtered.map(u => (
            <div key={u.id} className="user-card">
              <div className="user-top">
                <div className="user-info">
                  {u.photo ? <img className="user-avatar" src={u.photo} alt={u.name} /> : <div className="user-avatar">{initials(u.name)}</div>}
                  <div><p className="user-name">{u.name}</p><p className="user-email">{u.email}</p></div>
                </div>
                <button className="menu-btn" onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="4" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="10" cy="16" r="1.5" /></svg>
                </button>
                <div className={`menu-dropdown${openMenuId === u.id ? ' open' : ''}`}>
                  <button onClick={() => toggleStatus(u.id)}>{u.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                  <button className="danger" onClick={() => removeUser(u.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    Remove user
                  </button>
                </div>
              </div>
              <div className="user-bottom">
                <div className="badges">
                  <span className={`badge ${u.role === 'Admin' ? 'admin' : 'staff'}`}>{u.role.toUpperCase()}</span>
                  <span className={`badge ${u.status === 'Active' ? 'active' : 'inactive'}`}>{u.status.toUpperCase()}</span>
                </div>
                <div className="last-login"><p className="label">Last Login</p><p className="value">{u.lastLogin}</p></div>
              </div>
            </div>
          ))}
        </div>
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
                <label>Role</label>
                <div className="role-toggle">
                  {['Admin', 'Staff'].map(r => (
                    <button key={r} type="button" className={modalRole === r ? 'selected' : ''} onClick={() => setModalRole(r)}>{r}</button>
                  ))}
                </div>
              </div>
              {formError && <p className="error-msg">{formError}</p>}
              <button type="submit" className="submit-btn">Add User</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
