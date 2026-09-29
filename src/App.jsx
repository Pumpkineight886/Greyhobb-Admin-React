import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminHome from './pages/AdminHome'
import EmployeeLogs from './pages/EmployeeLogs'
import AnalyticsReports from './pages/AnalyticsReports'
import StudentDirectory from './pages/StudentDirectory'
import StaffDirectory from './pages/StaffDirectory'
import History from './pages/History'
import Filter from './pages/Filter'
import SystemSettings from './pages/SystemSettings'
import AdminProfile from './pages/AdminProfile'
import AdminProfileEdit from './pages/AdminProfileEdit'
import AccessControl from './pages/AccessControl'
import Biometrics from './pages/Biometrics'
import UserManagement from './pages/UserManagement'
import PrintAttendanceQR from './pages/PrintAttendanceQR'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<AdminHome />} />
        <Route path="employee-logs" element={<EmployeeLogs />} />
        <Route path="analytics-reports" element={<AnalyticsReports />} />
        <Route path="student-directory" element={<StudentDirectory />} />
        <Route path="staff-directory" element={<StaffDirectory />} />
        <Route path="history" element={<History />} />
        <Route path="filter" element={<Filter />} />
        <Route path="system-settings" element={<SystemSettings />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="profile-edit" element={<AdminProfileEdit />} />
        <Route path="access-control" element={<AccessControl />} />
        <Route path="biometrics" element={<Biometrics />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="print-attendance-qr" element={<PrintAttendanceQR />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
