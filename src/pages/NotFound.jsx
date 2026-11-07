import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
        textAlign: 'center',
        background: '#f7f7f8',
      }}
    >
      <p style={{ fontSize: 72, fontWeight: 800, color: '#7a1236', margin: 0, lineHeight: 1 }}>404</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Page not found</h1>
      <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        to="/home"
        style={{
          marginTop: 8,
          padding: '10px 20px',
          borderRadius: 10,
          background: '#7a1236',
          color: '#fff',
          fontWeight: 600,
          fontSize: 14,
          textDecoration: 'none',
        }}
      >
        Back to dashboard
      </Link>
    </div>
  )
}
