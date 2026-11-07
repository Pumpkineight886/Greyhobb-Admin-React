import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const MAX_PHOTO_BYTES = 1024 * 1024

export default function AdminProfileEdit() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    school: '',
    employeeId: '',
  })
  const [photo, setPhoto] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        school: user.school || '',
        employeeId: user.id ? user.id.slice(0,8).toUpperCase() : '',
      })
      setPhoto(user.photo || '')
    }
  }, [user])

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file.')
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('Image must be 1 MB or smaller.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setPhoto(String(reader.result || ''))
      setPhotoError('')
    }
    reader.onerror = () => setPhotoError('Could not read that image.')
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.department.trim() || !form.school.trim()) {
      setError('Name, department and school are required.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        department: form.department.trim(),
        school: form.school.trim(),
      }
      if (photo) payload.photo = photo
      const res = await api.put('/auth/me', payload)
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
      navigate('/profile')
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-edit">
      <Link to="/profile" className="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back
      </Link>

      <div className="avatar-editor">
        {photo ? (
          <img src={photo} alt="Profile" className="avatar-editor-photo" style={{ objectFit: 'cover' }} />
        ) : (
          <div className="avatar-editor-photo" style={{ background: '#7a1236', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 28 }}>
            {(form.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
        <button type="button" className="btn-mini" onClick={() => fileRef.current?.click()}>
          Change Photo
        </button>
        {photoError && <p className="error-msg">{photoError}</p>}
      </div>

      <form className="edit-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="edit-name">Full Name</label>
          <input id="edit-name" type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="edit-email">Email</label>
          <input id="edit-email" type="email" value={form.email} readOnly style={{ background: '#f9fafb', color: '#9ca3af' }} />
        </div>
        <div className="field">
          <label htmlFor="edit-department">Department</label>
          <input id="edit-department" type="text" value={form.department} onChange={(e) => handleChange('department', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="edit-school">School</label>
          <input id="edit-school" type="text" value={form.school} onChange={(e) => handleChange('school', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="edit-employee-id">Employee ID</label>
          <input id="edit-employee-id" type="text" value={form.employeeId} readOnly />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <div className="form-actions">
          <Link to="/profile" className="btn btn-outline">Cancel</Link>
          <button type="submit" className="submit-btn" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  )
}
