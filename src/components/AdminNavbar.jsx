import { Link } from 'react-router-dom'

export default function AdminNavbar({ onToggleSidebar }) {
  return (
    <header className="admin-navbar">
      <div className="admin-navbar-left">
        <button
          className="hamburger-btn"
          id="hamburger-btn"
          aria-haspopup="true"
          aria-expanded="false"
          aria-controls="admin-menu-panel"
          onClick={onToggleSidebar}
        >
          <img src="/assets/hamburger-icon.png" alt="Toggle menu" />
        </button>
      </div>
      <span className="admin-navbar-title">Greyhobb Technologies</span>
      <Link to="/profile" className="navbar-action-btn" aria-label="View profile">
        <img src="/assets/admin-profile-icon.png" alt="" />
      </Link>
    </header>
  )
}
