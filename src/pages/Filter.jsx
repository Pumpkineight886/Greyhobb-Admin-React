import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STATUS_OPTIONS = [
  { id: 'present', label: 'Present', iconClass: 'fa-solid fa-check', iconClassModifier: 'tone-present' },
  { id: 'late', label: 'Late', iconClass: 'fa-solid fa-clock', iconClassModifier: 'tone-late' },
  { id: 'absent', label: 'Absent', iconClass: 'fa-solid fa-xmark', iconClassModifier: 'tone-absent' },
]

const DATE_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'custom', label: 'Custom Range' },
]

export default function Filter() {
  const navigate = useNavigate()
  const [selectedStatuses, setSelectedStatuses] = useState({
    present: true,
    late: true,
    absent: true,
  })
  const [selectedDate, setSelectedDate] = useState('week')

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  const toggleStatus = (id) => {
    setSelectedStatuses((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleApply = () => {
    console.log('Applied filters:', { selectedStatuses, selectedDate })
  }

  return (
    <div className="phone">
      <header className="header">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left" />
        </button>
        <h1>Filters</h1>
      </header>

      <div className="content">
        <section className="filter-section">
          <h2>Attendance Status</h2>
          {STATUS_OPTIONS.map((status) => (
            <label key={status.id} className="filter-option">
              <div className="option-left">
                <div className={`status-icon ${status.iconClassModifier}`}>
                  <i className={status.iconClass} />
                </div>
                {status.label}
              </div>
              <input
                type="checkbox"
                className="status-checkbox"
                checked={selectedStatuses[status.id]}
                onChange={() => toggleStatus(status.id)}
              />
              <span className="custom-checkbox">
                <i className="fa-solid fa-check" />
              </span>
            </label>
          ))}
        </section>

        <section className="date-section">
          <h2>Date Range</h2>
          {DATE_OPTIONS.map((option) => (
            <label
              key={option.id}
              className={`date-option${option.id === 'custom' ? ' custom-option' : ''}`}
            >
              {option.label}
              {option.id === 'custom' && (
                <span className="custom-date">
                  Select dates <i className="fa-solid fa-calendar-days" />
                </span>
              )}
              <input
                type="radio"
                name="date-range"
                value={option.id}
                checked={selectedDate === option.id}
                onChange={() => setSelectedDate(option.id)}
              />
              <span className="radio" />
            </label>
          ))}
        </section>

        <button type="button" className="apply-btn" onClick={handleApply}>
          Apply Filters <i className="fa-solid fa-filter" />
        </button>
      </div>
    </div>
  )
}
