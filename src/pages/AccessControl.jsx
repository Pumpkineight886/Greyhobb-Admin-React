import { useState } from 'react'

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
  const [roles, setRoles] = useState(INITIAL_ROLES)
  const [editing, setEditing] = useState(false)

  const togglePermission = (roleId, permKey) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.roleId === roleId
          ? { ...r, permissions: r.permissions.map((p) => (p.key === permKey ? { ...p, enabled: !p.enabled } : p)) }
          : r
      )
    )
  }

  return (
    <div className="aac-page">
      <div className="aac-header">
        <h1 className="aac-title">Admin Access Control</h1>
        <p className="aac-subtitle">Manage permissions and system access levels across organizational roles.</p>
        <button className="aac-create-btn">
          <img src="/assets/create-role-icon.png" alt="" />
          Create New Role
        </button>
      </div>

      <hr className="aac-divider" />

      <div className="aac-content">
        {roles.map((role) => (
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
                    disabled={role.locked || (!editing && role.roleId === 'dept-admin')}
                    onChange={() => role.roleId === 'dept-admin' && editing && togglePermission(role.roleId, perm.key)}
                  />
                  <span className="aac-toggle-track"></span>
                  <span className="aac-toggle-check"><img src="/assets/checkmark-radio-icon.png" alt="" /></span>
                </label>
              </div>
            ))}

            {role.locked ? (
              <button className="aac-locked-btn" disabled>System Default (Locked)</button>
            ) : (
              <button className="aac-edit-btn" onClick={() => setEditing(!editing)}>
                <img src="/assets/edit-icon.png" alt="" />
                {editing ? 'Save Permissions' : 'Edit Permissions'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
