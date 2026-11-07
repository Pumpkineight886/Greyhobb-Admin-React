import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MenuIcon from './MenuIcon'

const MENU_ITEMS = [
  { to: '/home', icon: 'admin-user-icon.png', title: 'Home', desc: 'Overview dashboard with stats and recent check-ins.' },
  { to: '/employee-logs', icon: 'employee-logs-icon.png', title: 'Employee Logs', desc: 'Review daily attendance and activity records.' },
  { to: '/history', icon: <MenuIcon name="history" />, title: 'History', desc: 'Browse attendance history and export spreadsheets.' },
  { to: '/analytics-reports', icon: 'analytics-reports-icon.png', title: 'Analytics Reports', desc: 'Generate insights on workforce metrics.' },
  { to: '/student-directory', icon: 'student-directory-icon.png', title: 'Student Directory', desc: 'Manage and view enrolled student profiles.' },
  { to: '/staff-directory', icon: <MenuIcon name="staff" />, title: 'Staff Directory', desc: 'Manage and view staff profiles.' },
  { to: '/system-settings', icon: 'system-settings-icon.png', title: 'System Settings', desc: 'Configure global application parameters.' },
  { to: '/user-management', icon: 'user-management-icon.png', title: 'User Management', desc: 'Control access levels and credentials.' },
  { to: '/print-attendance-qr', icon: <MenuIcon name="printer" />, title: 'Print Attendance QR', desc: 'Print reception sign — students & staff scan to check in.' },
]

export default function AdminSidebar({ onClose }) {
  const { user } = useAuth()
  const displayName = user?.name || 'Admin User'
  const displayRole = user?.department ? `${user.department} • ${user?.school || 'Admin'}` : 'System Administrator'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
  return (
    <aside className="admin-menu-panel" id="admin-menu-panel" role="menu">
      <Link to="/profile" className="admin-profile-row" onClick={onClose}>
        <div className="admin-avatar" style={{ color:'#fff', fontWeight:700, fontSize:14 }}>
          {initials}
        </div>
        <div className="admin-profile-text">
          <h2 className="admin-name">{displayName}</h2>
          <p className="admin-role">{displayRole}</p>
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
              {typeof item.icon === 'string'
                ? <img src={`/assets/${item.icon}`} alt="" />
                : item.icon}
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
