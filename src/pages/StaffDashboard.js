import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import './RoleDashboard.css';

const StaffDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="role-dashboard">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1>Welcome, {user?.name}! 👋</h1>
          <p>Staff Dashboard - {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="current-time">{currentTime.toLocaleTimeString()}</p>
        </div>
        <div className="profile-card">
          <img src={user?.profileImage || 'https://via.placeholder.com/100'} alt={user?.name} />
          <h3>{user?.name}</h3>
          <p className="role-badge staff-badge">Staff</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/dashboard/notifications" className="action-card notifications">
          <i className="fas fa-bell"></i>
          <h3>Notifications</h3>
          <p>View all notifications</p>
        </Link>
        <Link to="/dashboard/notices" className="action-card notices">
          <i className="fas fa-clipboard"></i>
          <h3>Notice Management</h3>
          <p>Manage school notices</p>
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3f2fd' }}>
            <i className="fas fa-tasks" style={{ color: '#2196F3' }}></i>
          </div>
          <div className="stat-info">
            <h3>Tasks</h3>
            <p className="stat-number">12</p>
            <span className="stat-label">Pending</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e5f5' }}>
            <i className="fas fa-calendar-check" style={{ color: '#9c27b0' }}></i>
          </div>
          <div className="stat-info">
            <h3>Attendance</h3>
            <p className="stat-number">95%</p>
            <span className="stat-label">This Month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff3e0' }}>
            <i className="fas fa-clipboard-list" style={{ color: '#ff9800' }}></i>
          </div>
          <div className="stat-info">
            <h3>Notices</h3>
            <p className="stat-number">8</p>
            <span className="stat-label">Active</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e9' }}>
            <i className="fas fa-bell" style={{ color: '#4caf50' }}></i>
          </div>
          <div className="stat-info">
            <h3>Notifications</h3>
            <p className="stat-number">5</p>
            <span className="stat-label">Unread</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="content-card">
          <h2><i className="fas fa-tasks"></i> Quick Links</h2>
          <ul className="quick-links-list">
            <li>
              <Link to="/dashboard/notifications">
                <i className="fas fa-bell"></i>
                <span>Notifications</span>
              </Link>
            </li>
            <li>
              <Link to="/dashboard/notices">
                <i className="fas fa-clipboard"></i>
                <span>Notice Management</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="content-card">
          <h2><i className="fas fa-bell"></i> Recent Activities</h2>
          <ul className="notification-list">
            <li>
              <div className="notification-icon">📢</div>
              <div className="notification-content">
                <p>Staff meeting scheduled for tomorrow</p>
                <span>2 hours ago</span>
              </div>
            </li>
            <li>
              <div className="notification-icon">📝</div>
              <div className="notification-content">
                <p>New policy document uploaded</p>
                <span>5 hours ago</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;