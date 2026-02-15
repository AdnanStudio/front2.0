import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './Dashboard.css';

const TeacherTrainingManagement = () => {
  const [trainings, setTrainings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trainer: '',
    trainingType: '',
    startDate: '',
    endDate: '',
    duration: '',
    venue: '',
    totalSeats: '',
    participants: [],
    status: 'upcoming',
    budget: '',
    materials: ''
  });

  const trainingTypes = [
    'Pedagogical Skills',
    'Subject Knowledge',
    'Technology Integration',
    'Classroom Management',
    'Assessment & Evaluation',
    'Student Psychology',
    'Leadership Development',
    'Special Education',
    'Soft Skills',
    'Other'
  ];

  const statuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = () => {
    // Mock data - Replace with API call
    const mockTrainings = [
      {
        _id: '1',
        title: 'Digital Teaching Methods',
        description: 'Learn modern digital teaching techniques',
        trainer: 'Dr. Rahman Ahmed',
        trainingType: 'Technology Integration',
        startDate: '2026-02-10',
        endDate: '2026-02-12',
        duration: '3 days',
        venue: 'Training Hall, Main Building',
        totalSeats: 30,
        participants: ['T001', 'T002', 'T003'],
        status: 'upcoming',
        budget: '50000',
        materials: 'Laptop, Projector, Handouts'
      },
      {
        _id: '2',
        title: 'Effective Classroom Management',
        description: 'Strategies for better classroom control',
        trainer: 'Prof. Sultana Begum',
        trainingType: 'Classroom Management',
        startDate: '2026-01-20',
        endDate: '2026-01-22',
        duration: '3 days',
        venue: 'Conference Room',
        totalSeats: 25,
        participants: ['T004', 'T005'],
        status: 'completed',
        budget: '40000',
        materials: 'Training Manual, Case Studies'
      }
    ];
    
    setTrainings(mockTrainings);
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
      if (editingTraining) {
        // Update existing training
        setTrainings(trainings.map(t => 
          t._id === editingTraining._id 
            ? { ...formData, _id: t._id } 
            : t
        ));
        toast.success('Training updated successfully!');
      } else {
        // Add new training
        const newTraining = {
          ...formData,
          _id: Date.now().toString(),
          participants: []
        };
        setTrainings([...trainings, newTraining]);
        toast.success('Training added successfully!');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving training:', error);
      toast.error('Failed to save training');
    }
  };

  const handleEdit = (training) => {
    setEditingTraining(training);
    setFormData({
      title: training.title,
      description: training.description,
      trainer: training.trainer,
      trainingType: training.trainingType,
      startDate: training.startDate,
      endDate: training.endDate,
      duration: training.duration,
      venue: training.venue,
      totalSeats: training.totalSeats,
      participants: training.participants || [],
      status: training.status,
      budget: training.budget,
      materials: training.materials
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this training?')) {
      setTrainings(trainings.filter(t => t._id !== id));
      toast.success('Training deleted successfully!');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      trainer: '',
      trainingType: '',
      startDate: '',
      endDate: '',
      duration: '',
      venue: '',
      totalSeats: '',
      participants: [],
      status: 'upcoming',
      budget: '',
      materials: ''
    });
    setEditingTraining(null);
    setShowForm(false);
  };

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = 
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.trainer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.trainingType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === '' || training.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return '#3b82f6';
      case 'ongoing':
        return '#f59e0b';
      case 'completed':
        return '#10b981';
      case 'cancelled':
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
          <h2>🎓 Teacher Training Management</h2>
          <p>Manage professional development programs for teachers</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Training'}
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '25px' }}>
        <div className="stat-card" style={{ background: '#dbeafe', borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ color: '#1e40af' }}>Total Trainings</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e3a8a' }}>{trainings.length}</p>
        </div>
        <div className="stat-card" style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ color: '#92400e' }}>Upcoming</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#78350f' }}>
            {trainings.filter(t => t.status === 'upcoming').length}
          </p>
        </div>
        <div className="stat-card" style={{ background: '#d1fae5', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ color: '#065f46' }}>Completed</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#064e3b' }}>
            {trainings.filter(t => t.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>{editingTraining ? 'Edit Training' : 'Add New Training'}</h3>
          
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Training Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Digital Teaching Methods"
                required
              />
            </div>

            <div className="form-group">
              <label>Trainer Name *</label>
              <input
                type="text"
                name="trainer"
                value={formData.trainer}
                onChange={handleInputChange}
                placeholder="e.g., Dr. Rahman Ahmed"
                required
              />
            </div>

            <div className="form-group">
              <label>Training Type *</label>
              <select
                name="trainingType"
                value={formData.trainingType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Type</option>
                {trainingTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
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
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 3 days, 2 weeks"
              />
            </div>

            <div className="form-group">
              <label>Total Seats *</label>
              <input
                type="number"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Venue *</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                placeholder="e.g., Training Hall, Main Building"
                required
              />
            </div>

            <div className="form-group">
              <label>Budget (৳)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="e.g., 50000"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describe the training objectives and content..."
                required
              ></textarea>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Materials Needed</label>
              <textarea
                name="materials"
                value={formData.materials}
                onChange={handleInputChange}
                rows="2"
                placeholder="e.g., Laptop, Projector, Handouts, Training Manual"
              ></textarea>
            </div>

            <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingTraining ? 'Update Training' : 'Add Training'}
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
            placeholder="Search by title, trainer, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          {statuses.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Trainings List */}
      <div className="table-container">
        {filteredTrainings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            <i className="fas fa-graduation-cap" style={{ fontSize: '48px', marginBottom: '15px' }}></i>
            <p>No trainings found</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Training Title</th>
                <th>Trainer</th>
                <th>Type</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Venue</th>
                <th>Seats</th>
                <th>Status</th>
                <th>Budget</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrainings.map(training => (
                <tr key={training._id}>
                  <td>
                    <strong>{training.title}</strong>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {training.description.substring(0, 50)}...
                    </div>
                  </td>
                  <td>{training.trainer}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: '#e0e7ff',
                      color: '#4338ca'
                    }}>
                      {training.trainingType}
                    </span>
                  </td>
                  <td>
                    <div>{new Date(training.startDate).toLocaleDateString()}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      to {new Date(training.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>{training.duration}</td>
                  <td>{training.venue}</td>
                  <td>
                    <span style={{ fontWeight: '600' }}>
                      {training.participants.length} / {training.totalSeats}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: getStatusColor(training.status) + '20',
                      color: getStatusColor(training.status)
                    }}>
                      {training.status.charAt(0).toUpperCase() + training.status.slice(1)}
                    </span>
                  </td>
                  <td>৳{parseInt(training.budget).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(training)}
                        style={{
                          padding: '6px 12px',
                          background: '#dbeafe',
                          color: '#1e40af',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(training._id)}
                        style={{
                          padding: '6px 12px',
                          background: '#fee2e2',
                          color: '#991b1b',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TeacherTrainingManagement;
