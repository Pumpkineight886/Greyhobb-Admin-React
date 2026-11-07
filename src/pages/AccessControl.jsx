import { useEffect, useState } from 'react'
import { readStored, writeStored } from '../lib/storage.js'

const ROLES_KEY = 'greyhobb.access.roles'

const DEFAULT_PERMISSIONS = [
  { key: 'manage_users', label: 'Manage Users', enabled: false },
  { key: 'view_reports', label: 'View Reports', enabled: true },
  { key: 'change_settings', label: 'Change System Settings', enabled: false },
]

const INITIAL_ROLES = [
  {
    roleId: 'super-admin',
    name: 'Super Admin',
    description: 'Full system access',
    locked: true,
    permissions: [
      { key: 'manage_users', label: 'Manage Users', enabled: true },
      { key: 'view_reports', label: 'View Reports', enabled: true },
      { key: 'change_settings', label: 'Change System Settings', enabled: true },
    ],
  },
  {
    roleId: 'dept-admin',
    name: 'Dept Admin',
    description: 'Departmental oversight',
    locked: false,
    permissions: [
      { key: 'manage_users_dept', label: 'Manage Users (Dept Only)', enabled: true },
      { key: 'view_reports', label: 'View Reports', enabled: true },
      { key: 'change_settings', label: 'Change System Settings', enabled: false },
    ],
  },
]

export default function AccessControl() {
  const [roles, setRoles] = useState(() => {
    const stored = readStored(ROLES_KEY, null)
    return Array.isArray(stored) && stored.length > 0 ? stored : INITIAL_ROLES
  })
  const [editingId, setEditingId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    writeStored(ROLES_KEY, roles)
  }, [roles])

  const togglePermission = (roleId, permKey) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.roleId === roleId
          ? { ...r, permissions: r.permissions.map((p) => (p.key === permKey ? { ...p, enabled: !p.enabled } : p)) }
          : r
      )
    )
  }

  function createRole(event) {
    event.preventDefault()
    const name = newName.trim()
    if (!name) {
      setFormError('Role name is required.')
      return
    }
    const roleId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `role-${Date.now()}`
    if (roles.some((role) => role.roleId === roleId)) {
      setFormError('A role with this name already exists.')
      return
    }
    setRoles((prev) => [
      ...prev,
      {
        roleId,
        name,
        description: newDescription.trim() || 'Custom role',
        locked: false,
        permissions: DEFAULT_PERMISSIONS.map((permission) => ({ ...permission })),
      },
    ])
    setNewName('')
    setNewDescription('')
    setFormError('')
    setShowCreate(false)
  }

  return (
    <div className="aac-page">
      <div className="aac-header">
        <h1 className="aac-title">Admin Access Control</h1>
        <p className="aac-subtitle">Manage permissions and system access levels across organizational roles.</p>
        <button className="aac-create-btn" onClick={() => { setShowCreate((open) => !open); setFormError('') }}>
          <img src="/assets/create-role-icon.png" alt="" />
          Create New Role
        </button>
      </div>

      {showCreate && (
        <form className="aac-card" onSubmit={createRole} style={{ marginBottom: 20 }}>
          <div className="aac-card-header">
            <div>
              <p className="aac-role-name">New Role</p>
              <p className="aac-role-desc">Custom role with default permissions</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            <input
              className="search-input"
              type="text"
              placeholder="Role name (e.g. Attendance Manager)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              className="search-input"
              type="text"
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
          {formError && <p className="error-msg">{formError}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="aac-edit-btn">
              <img src="/assets/edit-icon.png" alt="" />
              Create Role
            </button>
            <button type="button" className="aac-locked-btn" onClick={() => { setShowCreate(false); setFormError('') }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <hr className="aac-divider" />

      <div className="aac-content">
        {roles.map((role) => {
          const isEditing = editingId === role.roleId
          return (
            <div key={role.roleId} className="aac-card" data-role={role.roleId}>
              <div className="aac-card-header">
                <div>
                  <p className="aac-role-name">{role.name}</p>
                  <p className="aac-role-desc">{role.description}</p>
                </div>
                <img src={role.locked ? '/assets/checkmark-radio-icon.png' : '/assets/dept-admin-icon.png'} alt="" />
              </div>

              {role.permissions.map((perm) => (
                <div key={perm.key} className="aac-perm-row">
                  <span className="aac-perm-label">{perm.label}</span>
                  <label className="aac-toggle">
                    <input
                      type="checkbox"
                      checked={perm.enabled}
                      disabled={role.locked || !isEditing}
                      onChange={() => togglePermission(role.roleId, perm.key)}
                    />
                    <span className="aac-toggle-track"></span>
                    <span className="aac-toggle-check"><img src="/assets/checkmark-radio-icon.png" alt="" /></span>
                  </label>
                </div>
              ))}

              {role.locked ? (
                <button className="aac-locked-btn" disabled>System Default (Locked)</button>
              ) : (
                <button className="aac-edit-btn" onClick={() => setEditingId(isEditing ? null : role.roleId)}>
                  <img src="/assets/edit-icon.png" alt="" />
                  {isEditing ? 'Save Permissions' : 'Edit Permissions'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 16 }}>
        Roles are saved on this device.
      </p>
    </div>
  )
}
