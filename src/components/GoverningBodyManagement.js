import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import './../pages/Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://malkhanagarcollege.onrender.com/api';

const GoverningBodyManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    role: 'সদস্য',
    description: '',
    phone: '',
    email: '',
    order: 0
  });

  const [imageFile, setImageFile] = useState(null);

  const roles = ['সভাপতি', 'সদস্য সচিব', 'সদস্য'];

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/governing-body`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (editingMember) {
        await axios.put(
          `${API_URL}/governing-body/${editingMember._id}`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        toast.success('Member updated successfully!');
      } else {
        await axios.post(
          `${API_URL}/governing-body`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        toast.success('Member added successfully!');
      }
      
      resetForm();
      fetchMembers();
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error(error.response?.data?.message || 'Failed to save member');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      designation: member.designation,
      role: member.role,
      description: member.description,
      phone: member.phone || '',
      email: member.email || '',
      order: member.order || 0
    });
    setImagePreview(member.image?.url || null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/governing-body/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Member deleted successfully!');
        fetchMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
        toast.error('Failed to delete member');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      designation: '',
      role: 'সদস্য',
      description: '',
      phone: '',
      email: '',
      order: 0
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingMember(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>🏛️ Governing Body Management</h2>
          <p>Manage governing body members and their information</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Member'}
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '30px' }}>
        <div className="stat-card" style={{ background: '#dbeafe', borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ color: '#1e40af' }}>Total Members</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e3a8a' }}>{members.length}</p>
        </div>
        <div className="stat-card" style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ color: '#92400e' }}>President</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#78350f' }}>
            {members.filter(m => m.role === 'সভাপতি').length}
          </p>
        </div>
        <div className="stat-card" style={{ background: '#d1fae5', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ color: '#065f46' }}>Secretary</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#064e3b' }}>
            {members.filter(m => m.role === 'সদস্য সচিব').length}
          </p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>{editingMember ? 'Edit Member' : 'Add New Member'}</h3>
          
          <form onSubmit={handleSubmit} className="form-grid">
            {/* Image Upload */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Member Photo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {imagePreview && (
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid #3b82f6'
                  }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ flex: 1 }}
                />
              </div>
              <small style={{ color: '#6b7280', marginTop: '5px', display: 'block' }}>
                Recommended: Square image, max 5MB
              </small>
            </div>

            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., জনাব মোহাম্মদ আলী"
                required
              />
            </div>

            <div className="form-group">
              <label>Designation *</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="e.g., উপজেলা নির্বাহী অফিসার"
                required
              />
            </div>

            <div className="form-group">
              <label>Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                min="0"
              />
              <small style={{ color: '#6b7280' }}>Display order (lower first)</small>
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g., 01711223344"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g., member@example.com"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Member's role and responsibilities..."
                required
              ></textarea>
            </div>

            <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingMember ? 'Update Member' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members Table */}
      <div className="table-container">
        {members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            <i className="fas fa-users" style={{ fontSize: '48px', marginBottom: '15px' }}></i>
            <p>No members found</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member._id}>
                  <td>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: '#f3f4f6'
                    }}>
                      {member.image?.url ? (
                        <img 
                          src={member.image.url} 
                          alt={member.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          color: '#9ca3af'
                        }}>
                          👤
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong>{member.name}</strong>
                  </td>
                  <td>{member.designation}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: member.role === 'সভাপতি' ? '#dbeafe' : 
                                 member.role === 'সদস্য সচিব' ? '#fef3c7' : '#e5e7eb',
                      color: member.role === 'সভাপতি' ? '#1e40af' : 
                             member.role === 'সদস্য সচিব' ? '#92400e' : '#4b5563'
                    }}>
                      {member.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>
                      {member.phone && <div>{member.phone}</div>}
                      {member.email && <div style={{ color: '#6b7280' }}>{member.email}</div>}
                    </div>
                  </td>
                  <td>{member.order}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(member)}
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
                        onClick={() => handleDelete(member._id)}
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

export default GoverningBodyManagement;
