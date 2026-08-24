import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function AdminProfileEdit() {
  const [form, setForm] = useState({
    name: 'Alex Mercer',
    email: 'alex.mercer@greysoft.tech',
    department: 'Frontend',
    role: 'Senior Developer',
    employeeId: 'EMP-2023-045',
  })

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="profile-edit">
      <Link to="/profile" className="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back
      </Link>

      <div className="avatar-editor">
        <div className="avatar-editor-photo">
          <img src="/assets/alex-mercer.png" alt="Alex Mercer" />
        </div>
        <button type="button" className="btn-mini">Change Photo</button>
      </div>

      <form className="edit-form" onSubmit={(e) => e.preventDefault()}>
        <div className="field">
          <label htmlFor="edit-name">Full Name</label>
          <input id="edit-name" type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="edit-email">Email</label>
          <input id="edit-email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="edit-department">Department</label>
          <input id="edit-department" type="text" value={form.department} onChange={(e) => handleChange('department', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="edit-role">Role</label>
          <input id="edit-role" type="text" value={form.role} onChange={(e) => handleChange('role', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="edit-employee-id">Employee ID</label>
          <input id="edit-employee-id" type="text" value={form.employeeId} readOnly />
        </div>

        <div className="form-actions">
          <Link to="/profile" className="btn btn-outline">Cancel</Link>
          <button type="submit" className="submit-btn">Save Changes</button>
        </div>
      </form>
    </div>
  )
}
