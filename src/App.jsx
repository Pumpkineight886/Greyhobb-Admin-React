import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
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
      </Route>
    </Routes>
  )
}

export default App
