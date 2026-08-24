import React from "react";
import { Link } from "react-router-dom";

const infoRows = [
  {
    icon: "/assets/employee-id-icon.png",
    label: "Employee ID",
    value: "EMP-2023-045",
  },
  {
    icon: "/assets/department-icon.png",
    label: "Department",
    value: "Frontend",
  },
  {
    icon: "/assets/email-icon.png",
    label: "Email",
    value: "alex.mercer@greysoft.tech",
  },
];

const AdminProfile = () => {
  return (
    <>
      <div className="profile-card">
        <div className="profile-avatar-wrap">
          <img
            src="/assets/alex-mercer.png"
            alt="Alex Mercer"
            className="profile-avatar"
          />
          <Link to="/profile-edit" className="profile-edit-badge">
            <img src="/assets/edit-icon-light.png" alt="Edit profile" />
          </Link>
        </div>

        <h1 className="profile-name">Alex Mercer</h1>
        <p className="profile-role">Senior Developer</p>

        <ul className="profile-info-list">
          {infoRows.map((row) => (
            <li key={row.label} className="profile-info-row">
              <span className="profile-info-icon">
                <img src={row.icon} alt={row.label} />
              </span>
              <div className="profile-info-text">
                <p className="profile-info-label">{row.label}</p>
                <p className="profile-info-value">{row.value}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <section className="weekly-summary">
        <div className="weekly-summary-head">
          <h2>Weekly Summary</h2>
          <Link to="/history" className="view-history-link">
            View Full History
            <img src="/assets/right-arrow-icon.png" alt="" />
          </Link>
        </div>

        <div className="summary-stats-grid">
          <div className="stat-card is-present">
            <span className="stat-icon-circle">
              <img src="/assets/calender-check-icon.png" alt="" />
            </span>
            <div>
              <p className="stat-number">4</p>
              <p className="stat-label">Days Present</p>
            </div>
          </div>

          <div className="stat-card is-absent">
            <span className="stat-icon-circle">
              <img src="/assets/calender-x-icon.png" alt="" />
            </span>
            <div>
              <p className="stat-number">0</p>
              <p className="stat-label">Days Absent</p>
            </div>
          </div>
        </div>
      </section>

      <button type="button" className="add-btn profile-logout">
        Logout
      </button>
    </>
  );
};

export default AdminProfile;
