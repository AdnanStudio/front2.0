import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getLibraryStats } from '../services/libraryService';
import toast from 'react-hot-toast';
import './RoleDashboard.css';

const LibrarianDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    issuedBooks: 0,
    overdueBooks: 0,
    todayReturns: 0,
    pendingFines: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    fetchStats();

    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getLibraryStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch library statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-dashboard">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1>Welcome, {user?.name}! 📚</h1>
          <p>Librarian Dashboard - {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="current-time">{currentTime.toLocaleTimeString()}</p>
        </div>
        <div className="profile-card">
          <img src={user?.profileImage || 'https://via.placeholder.com/100'} alt={user?.name} />
          <h3>{user?.name}</h3>
          <p className="role-badge librarian-badge">Librarian</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/dashboard/library" className="action-card library">
          <i className="fas fa-book"></i>
          <h3>Library Management</h3>
          <p>Manage books, issues & fines</p>
        </Link>
        <Link to="/dashboard/notifications" className="action-card notifications">
          <i className="fas fa-bell"></i>
          <h3>Notifications</h3>
          <p>View all notifications</p>
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3f2fd' }}>
            <i className="fas fa-book" style={{ color: '#2196F3' }}></i>
          </div>
          <div className="stat-info">
            <h3>Total Books</h3>
            <p className="stat-number">{loading ? '...' : stats.totalBooks}</p>
            <span className="stat-label">In Library</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e9' }}>
            <i className="fas fa-check-circle" style={{ color: '#4caf50' }}></i>
          </div>
          <div className="stat-info">
            <h3>Available</h3>
            <p className="stat-number">{loading ? '...' : stats.availableBooks}</p>
            <span className="stat-label">Ready to Issue</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff3e0' }}>
            <i className="fas fa-book-open" style={{ color: '#ff9800' }}></i>
          </div>
          <div className="stat-info">
            <h3>Issued Books</h3>
            <p className="stat-number">{loading ? '...' : stats.issuedBooks}</p>
            <span className="stat-label">Currently Out</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ffebee' }}>
            <i className="fas fa-exclamation-triangle" style={{ color: '#f44336' }}></i>
          </div>
          <div className="stat-info">
            <h3>Overdue</h3>
            <p className="stat-number">{loading ? '...' : stats.overdueBooks}</p>
            <span className="stat-label">Books</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e5f5' }}>
            <i className="fas fa-undo" style={{ color: '#9c27b0' }}></i>
          </div>
          <div className="stat-info">
            <h3>Returns</h3>
            <p className="stat-number">{loading ? '...' : stats.todayReturns}</p>
            <span className="stat-label">Today</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff9c4' }}>
            <i className="fas fa-dollar-sign" style={{ color: '#f57f17' }}></i>
          </div>
          <div className="stat-info">
            <h3>Pending Fines</h3>
            <p className="stat-number">৳{loading ? '...' : stats.pendingFines}</p>
            <span className="stat-label">To Collect</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="content-card">
          <h2><i className="fas fa-tasks"></i> Quick Links</h2>
          <ul className="quick-links-list">
            <li>
              <Link to="/dashboard/library">
                <i className="fas fa-book"></i>
                <span>Book Inventory</span>
              </Link>
            </li>
            <li>
              <Link to="/dashboard/library">
                <i className="fas fa-exchange-alt"></i>
                <span>Issue/Return Books</span>
              </Link>
            </li>
            <li>
              <Link to="/dashboard/library">
                <i className="fas fa-money-bill-wave"></i>
                <span>Fine Management</span>
              </Link>
            </li>
            <li>
              <Link to="/dashboard/notifications">
                <i className="fas fa-bell"></i>
                <span>Notifications</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="content-card">
          <h2><i className="fas fa-info-circle"></i> Today's Summary</h2>
          <div className="summary-stats">
            <div className="summary-item">
              <i className="fas fa-book-open"></i>
              <div>
                <strong>{loading ? '...' : stats.issuedBooks}</strong>
                <span>Books Currently Issued</span>
              </div>
            </div>
            <div className="summary-item">
              <i className="fas fa-undo"></i>
              <div>
                <strong>{loading ? '...' : stats.todayReturns}</strong>
                <span>Books Returned Today</span>
              </div>
            </div>
            <div className="summary-item overdue">
              <i className="fas fa-exclamation-triangle"></i>
              <div>
                <strong>{loading ? '...' : stats.overdueBooks}</strong>
                <span>Overdue Books</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibrarianDashboard;