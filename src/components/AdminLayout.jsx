import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import AdminNavbar from './AdminNavbar'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)')
    const applyDefault = () => setSidebarOpen(mq.matches)
    applyDefault()
    mq.addEventListener('change', applyDefault)
    return () => mq.removeEventListener('change', applyDefault)
  }, [])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !window.matchMedia('(min-width: 900px)').matches) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)
  const closeSidebar = () => {
    if (!window.matchMedia('(min-width: 900px)').matches) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className={`admin-shell${sidebarOpen ? ' sidebar-open' : ''}`} id="admin-shell">
      <AdminNavbar onToggleSidebar={toggleSidebar} />
      <div className="admin-body">
        <AdminSidebar onClose={closeSidebar} />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
      <div className="dropdown-backdrop" id="dropdown-backdrop" onClick={closeSidebar} />
    </div>
  )
}
