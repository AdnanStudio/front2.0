import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import BookInventory from './BookInventory';
import BookIssue from './BookIssue';
import FineManagement from './FineManagement';
import { getLibraryStats } from '../services/libraryService';
import './LibraryManagement.css';

const LibraryManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('inventory');
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
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getLibraryStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error(error.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'inventory':
        return <BookInventory onUpdate={fetchStats} />;
      case 'issue':
        return <BookIssue onUpdate={fetchStats} />;
      case 'fines':
        return <FineManagement onUpdate={fetchStats} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading library data...</p>
      </div>
    );
  }

  return (
    <div className="library-management">
      <div className="library-header">
        <h1>📚 Library Management System</h1>
        <p>Manage books, issues, returns, and fines</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3f2fd' }}>
            <i className="fas fa-book" style={{ color: '#2196F3' }}></i>
          </div>
          <div className="stat-info">
            <h3>Total Books</h3>
            <p className="stat-number">{stats.totalBooks}</p>
            <span className="stat-label">In Library</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e9' }}>
            <i className="fas fa-check-circle" style={{ color: '#4caf50' }}></i>
          </div>
          <div className="stat-info">
            <h3>Available</h3>
            <p className="stat-number">{stats.availableBooks}</p>
            <span className="stat-label">Ready to Issue</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff3e0' }}>
            <i className="fas fa-book-open" style={{ color: '#ff9800' }}></i>
          </div>
          <div className="stat-info">
            <h3>Issued</h3>
            <p className="stat-number">{stats.issuedBooks}</p>
            <span className="stat-label">Currently Out</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ffebee' }}>
            <i className="fas fa-exclamation-triangle" style={{ color: '#f44336' }}></i>
          </div>
          <div className="stat-info">
            <h3>Overdue</h3>
            <p className="stat-number">{stats.overdueBooks}</p>
            <span className="stat-label">Books</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e5f5' }}>
            <i className="fas fa-undo" style={{ color: '#9c27b0' }}></i>
          </div>
          <div className="stat-info">
            <h3>Today's Returns</h3>
            <p className="stat-number">{stats.todayReturns}</p>
            <span className="stat-label">Books</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff9c4' }}>
            <i className="fas fa-dollar-sign" style={{ color: '#f57f17' }}></i>
          </div>
          <div className="stat-info">
            <h3>Pending Fines</h3>
            <p className="stat-number">৳{stats.pendingFines}</p>
            <span className="stat-label">To Collect</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="library-tabs">
        <button
          className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <i className="fas fa-box"></i> Book Inventory
        </button>
        <button
          className={`tab-button ${activeTab === 'issue' ? 'active' : ''}`}
          onClick={() => setActiveTab('issue')}
        >
          <i className="fas fa-exchange-alt"></i> Issue/Return
        </button>
        <button
          className={`tab-button ${activeTab === 'fines' ? 'active' : ''}`}
          onClick={() => setActiveTab('fines')}
        >
          <i className="fas fa-money-bill-wave"></i> Fine Management
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default LibraryManagement;