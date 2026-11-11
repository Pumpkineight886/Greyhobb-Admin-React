import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing, user } = useAuth()

  if (initializing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#6b7280' }}>
        Loading...
      </div>
    )
  }

  if (!isAuthenticated || (user?.role && user.role !== 'admin')) {
    return <Navigate to="/login" replace />
  }

  return children
}
