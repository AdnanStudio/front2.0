import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './Dashboard.css';

const ClubManagement = () => {
  const [clubs, setClubs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    advisor: '',
    president: '',
    vicePresident: '',
    meetingDay: '',
    meetingTime: '',
    meetingVenue: '',
    members: [],
    establishedDate: '',
    budget: '',
    activities: '',
    achievements: '',
    status: 'active'
  });

  const clubCategories = [
    'Academic',
    'Sports',
    'Arts & Culture',
    'Science & Technology',
    'Social Service',
    'Debate & Public Speaking',
    'Environmental',
    'Literature',
    'Music',
    'Drama & Theatre',
    'Photography',
    'Other'
  ];

  const statuses = ['active', 'inactive', 'suspended'];
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = () => {
    // Mock data - Replace with API call
    const mockClubs = [
      {
        _id: '1',
        name: 'Science Club',
        description: 'Exploring the wonders of science through experiments and projects',
        category: 'Science & Technology',
        advisor: 'Dr. Kamal Hossain',
        president: 'Rafiq Ahmed (Class 10)',
        vicePresident: 'Fatima Khan (Class 10)',
        meetingDay: 'Thursday',
        meetingTime: '3:00 PM',
        meetingVenue: 'Science Lab',
        members: ['S001', 'S002', 'S003', 'S004', 'S005'],
        establishedDate: '2020-01-15',
        budget: '25000',
        activities: 'Science Fair, Lab Sessions, Guest Lectures',
        achievements: '1st Prize in District Science Fair 2025',
        status: 'active'
      },
      {
        _id: '2',
        name: 'Debate Club',
        description: 'Developing critical thinking and public speaking skills',
        category: 'Debate & Public Speaking',
        advisor: 'Ms. Ayesha Rahman',
        president: 'Sohel Rana (Class 9)',
        vicePresident: 'Nadia Islam (Class 9)',
        meetingDay: 'Tuesday',
        meetingTime: '4:00 PM',
        meetingVenue: 'Auditorium',
        members: ['S006', 'S007', 'S008'],
        establishedDate: '2019-09-01',
        budget: '15000',
        activities: 'Weekly Debates, Inter-school Competitions',
        achievements: 'Winner of National Debate Championship 2024',
        status: 'active'
      },
      {
        _id: '3',
        name: 'Art Club',
        description: 'Expressing creativity through various art forms',
        category: 'Arts & Culture',
        advisor: 'Mr. Habib Khan',
        president: 'Meena Das (Class 8)',
        vicePresident: 'Arif Hasan (Class 8)',
        meetingDay: 'Friday',
        meetingTime: '2:30 PM',
        meetingVenue: 'Art Room',
        members: ['S009', 'S010'],
        establishedDate: '2021-03-20',
        budget: '20000',
        activities: 'Art Exhibitions, Painting Workshops, Cultural Programs',
        achievements: 'Best Art Display Award 2025',
        status: 'active'
      }
    ];
    
    setClubs(mockClubs);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      if (editingClub) {
        // Update existing club
        setClubs(clubs.map(c => 
          c._id === editingClub._id 
            ? { ...formData, _id: c._id } 
            : c
        ));
        toast.success('Club updated successfully!');
      } else {
        // Add new club
        const newClub = {
          ...formData,
          _id: Date.now().toString(),
          members: []
        };
        setClubs([...clubs, newClub]);
        toast.success('Club added successfully!');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving club:', error);
      toast.error('Failed to save club');
    }
  };

  const handleEdit = (club) => {
    setEditingClub(club);
    setFormData({
      name: club.name,
      description: club.description,
      category: club.category,
      advisor: club.advisor,
      president: club.president,
      vicePresident: club.vicePresident,
      meetingDay: club.meetingDay,
      meetingTime: club.meetingTime,
      meetingVenue: club.meetingVenue,
      members: club.members || [],
      establishedDate: club.establishedDate,
      budget: club.budget,
      activities: club.activities,
      achievements: club.achievements,
      status: club.status
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this club?')) {
      setClubs(clubs.filter(c => c._id !== id));
      toast.success('Club deleted successfully!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      advisor: '',
      president: '',
      vicePresident: '',
      meetingDay: '',
      meetingTime: '',
      meetingVenue: '',
      members: [],
      establishedDate: '',
      budget: '',
      activities: '',
      achievements: '',
      status: 'active'
    });
    setEditingClub(null);
    setShowForm(false);
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = 
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.advisor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === '' || club.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'inactive':
        return '#6b7280';
      case 'suspended':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>🎯 Club Management</h2>
          <p>Manage school clubs and extracurricular activities</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Club'}
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '25px' }}>
        <div className="stat-card" style={{ background: '#dbeafe', borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ color: '#1e40af' }}>Total Clubs</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e3a8a' }}>{clubs.length}</p>
        </div>
        <div className="stat-card" style={{ background: '#d1fae5', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ color: '#065f46' }}>Active Clubs</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#064e3b' }}>
            {clubs.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="stat-card" style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ color: '#92400e' }}>Total Members</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#78350f' }}>
            {clubs.reduce((sum, c) => sum + (c.members?.length || 0), 0)}
          </p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>{editingClub ? 'Edit Club' : 'Add New Club'}</h3>
          
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Club Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Science Club"
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {clubCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Club Advisor *</label>
              <input
                type="text"
                name="advisor"
                value={formData.advisor}
                onChange={handleInputChange}
                placeholder="e.g., Dr. Kamal Hossain"
                required
              />
            </div>

            <div className="form-group">
              <label>Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>President</label>
              <input
                type="text"
                name="president"
                value={formData.president}
                onChange={handleInputChange}
                placeholder="e.g., Rafiq Ahmed (Class 10)"
              />
            </div>

            <div className="form-group">
              <label>Vice President</label>
              <input
                type="text"
                name="vicePresident"
                value={formData.vicePresident}
                onChange={handleInputChange}
                placeholder="e.g., Fatima Khan (Class 10)"
              />
            </div>

            <div className="form-group">
              <label>Meeting Day</label>
              <select
                name="meetingDay"
                value={formData.meetingDay}
                onChange={handleInputChange}
              >
                <option value="">Select Day</option>
                {weekDays.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Meeting Time</label>
              <input
                type="time"
                name="meetingTime"
                value={formData.meetingTime}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Meeting Venue</label>
              <input
                type="text"
                name="meetingVenue"
                value={formData.meetingVenue}
                onChange={handleInputChange}
                placeholder="e.g., Science Lab"
              />
            </div>

            <div className="form-group">
              <label>Established Date</label>
              <input
                type="date"
                name="establishedDate"
                value={formData.establishedDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Annual Budget (৳)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="e.g., 25000"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describe the club's purpose and objectives..."
                required
              ></textarea>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Activities</label>
              <textarea
                name="activities"
                value={formData.activities}
                onChange={handleInputChange}
                rows="2"
                placeholder="e.g., Science Fair, Lab Sessions, Guest Lectures"
              ></textarea>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Achievements</label>
              <textarea
                name="achievements"
                value={formData.achievements}
                onChange={handleInputChange}
                rows="2"
                placeholder="List major achievements and awards..."
              ></textarea>
            </div>

            <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingClub ? 'Update Club' : 'Add Club'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="search-filter-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by club name, category, or advisor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {clubCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Clubs Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '20px',
        marginTop: '25px'
      }}>
        {filteredClubs.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '40px', 
            color: '#9ca3af' 
          }}>
            <i className="fas fa-users" style={{ fontSize: '48px', marginBottom: '15px' }}></i>
            <p>No clubs found</p>
          </div>
        ) : (
          filteredClubs.map(club => (
            <div 
              key={club._id} 
              style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 0.3s'
              }}
            >
              {/* Club Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#2c3e50' }}>
                    {club.name}
                  </h3>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '500',
                    background: '#e0e7ff',
                    color: '#4338ca'
                  }}>
                    {club.category}
                  </span>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: getStatusColor(club.status) + '20',
                  color: getStatusColor(club.status)
                }}>
                  {club.status.charAt(0).toUpperCase() + club.status.slice(1)}
                </span>
              </div>

              {/* Description */}
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px', lineHeight: '1.5' }}>
                {club.description}
              </p>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <i className="fas fa-user-tie" style={{ color: '#6b7280', width: '16px' }}></i>
                  <span style={{ color: '#4b5563' }}><strong>Advisor:</strong> {club.advisor}</span>
                </div>
                
                {club.president && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <i className="fas fa-crown" style={{ color: '#f59e0b', width: '16px' }}></i>
                    <span style={{ color: '#4b5563' }}><strong>President:</strong> {club.president}</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <i className="fas fa-users" style={{ color: '#6b7280', width: '16px' }}></i>
                  <span style={{ color: '#4b5563' }}><strong>Members:</strong> {club.members?.length || 0}</span>
                </div>

                {club.meetingDay && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <i className="fas fa-calendar" style={{ color: '#6b7280', width: '16px' }}></i>
                    <span style={{ color: '#4b5563' }}>
                      <strong>Meetings:</strong> {club.meetingDay}, {club.meetingTime}
                    </span>
                  </div>
                )}

                {club.budget && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <i className="fas fa-money-bill-wave" style={{ color: '#10b981', width: '16px' }}></i>
                    <span style={{ color: '#4b5563' }}>
                      <strong>Budget:</strong> ৳{parseInt(club.budget).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Achievements */}
              {club.achievements && (
                <div style={{
                  background: '#fef3c7',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <i className="fas fa-trophy" style={{ color: '#f59e0b', fontSize: '14px' }}></i>
                    <strong style={{ fontSize: '12px', color: '#92400e' }}>Achievement:</strong>
                  </div>
                  <p style={{ fontSize: '12px', color: '#78350f', margin: 0 }}>
                    {club.achievements}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  onClick={() => handleEdit(club)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#dbeafe',
                    color: '#1e40af',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button
                  onClick={() => handleDelete(club._id)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClubManagement;
