import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const AdminProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/attendance/history");
        if (!cancelled) setHistory(res.data);
      } catch {
        if (!cancelled) setHistory([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true };
  }, []);

  const display = user || { name: "Admin User", email: "-", department: "-", school: "-", id: "-", created_at: new Date().toISOString() };

  const infoRows = [
    { icon: "/assets/employee-id-icon.png", label: "Employee ID", value: display.id ? display.id.slice(0, 8).toUpperCase() : "-" },
    { icon: "/assets/department-icon.png", label: "Department", value: display.department || "-" },
    { icon: "/assets/email-icon.png", label: "Email", value: display.email || "-" },
    { icon: "/assets/employee-id-icon.png", label: "School", value: display.school || "-" },
  ];

  const daysPresent = history.length;
  // Absent not tracked; compute 0
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div className="profile-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar" style={{ background: "#7a1236", color: "#fff", fontWeight: 800, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {(display.name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)}
          </div>
          <Link to="/profile-edit" className="profile-edit-badge">
            <img src="/assets/edit-icon-light.png" alt="Edit profile" />
          </Link>
        </div>

        <h1 className="profile-name">{display.name}</h1>
        <p className="profile-role">{display.department} {display.school ? `• ${display.school}` : ""}</p>

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
              {loading ? <p className="stat-number">…</p> : <p className="stat-number">{daysPresent}</p>}
              <p className="stat-label">Days Present (self)</p>
            </div>
          </div>

          <div className="stat-card is-absent">
            <span className="stat-icon-circle">
              <img src="/assets/calender-x-icon.png" alt="" />
            </span>
            <div>
              <p className="stat-number">—</p>
              <p className="stat-label">Days Absent</p>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>Live from <code>GET /auth/me</code> and <code>GET /attendance/history</code></p>
      </section>

      <button type="button" className="add-btn profile-logout" onClick={handleLogout}>
        Logout
      </button>
    </>
  );
};

export default AdminProfile;
