import { NavLink, Link } from 'react-router-dom'

const MENU_ITEMS = [
  { to: '/employee-logs', icon: 'employee-logs-icon.png', title: 'Employee Logs', desc: 'Review daily attendance and activity records.' },
  { to: '/analytics-reports', icon: 'analytics-reports-icon.png', title: 'Analytics Reports', desc: 'Generate insights on workforce metrics.' },
  { to: '/student-directory', icon: 'student-directory-icon.png', title: 'Student Directory', desc: 'Manage and view enrolled student profiles.' },
  { to: '/system-settings', icon: 'system-settings-icon.png', title: 'System Settings', desc: 'Configure global application parameters.' },
  { to: '/user-management', icon: 'user-management-icon.png', title: 'User Management', desc: 'Control access levels and credentials.' },
]

export default function AdminSidebar({ onClose }) {
  return (
    <aside className="admin-menu-panel" id="admin-menu-panel" role="menu">
      <Link to="/profile" className="admin-profile-row" onClick={onClose}>
        <div className="admin-avatar">
          <img src="/assets/admin-user-icon.png" alt="" />
        </div>
        <div className="admin-profile-text">
          <h2 className="admin-name">Admin User</h2>
          <p className="admin-role">System Administrator</p>
        </div>
      </Link>

      <nav className="admin-menu-list">
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `admin-menu-item${isActive ? ' is-active' : ''}`}
            role="menuitem"
            onClick={onClose}
          >
            <span className="admin-menu-icon">
              <img src={`/assets/${item.icon}`} alt="" />
            </span>
            <span className="admin-menu-text">
              <span className="admin-menu-title">{item.title}</span>
              <span className="admin-menu-desc">{item.desc}</span>
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
