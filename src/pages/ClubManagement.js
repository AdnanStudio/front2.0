import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clubService from '../services/clubService';
import toast from 'react-hot-toast';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  X,
  Upload,
  Save
} from 'lucide-react';
import './ClubManagement.css';

const ClubManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await clubService.getAllMembers();
      setMembers(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch club members');
      console.error('Fetch members error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      if (profileImage) {
        submitData.append('image', profileImage);
      }

      if (isEditMode) {
        await clubService.updateMember(selectedMember._id, submitData);
        toast.success('Member updated successfully!');
      } else {
        await clubService.createMember(submitData);
        toast.success('Member created successfully!');
      }

      resetForm();
      fetchMembers();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Operation failed';
      toast.error(errorMessage);
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (member) => {
    setIsEditMode(true);
    setSelectedMember(member);
    setFormData({
      name: member.name,
      description: member.description,
      order: member.order
    });
    setImagePreview(member.image?.url);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;

    try {
      await clubService.deleteMember(id);
      toast.success('Member deleted successfully');
      fetchMembers();
    } catch (error) {
      toast.error('Failed to delete member');
      console.error('Delete error:', error);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await clubService.toggleMemberStatus(id);
      toast.success('Status updated successfully');
      fetchMembers();
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Toggle status error:', error);
    }
  };

  const viewDetails = (member) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      order: 0
    });
    setProfileImage(null);
    setImagePreview(null);
    setIsEditMode(false);
    setSelectedMember(null);
    setShowModal(false);
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="club-management-page">
      <div className="page-header">
        <div className="header-left">
          <Users size={32} />
          <div>
            <h1>Club Management</h1>
            <p>Manage club members</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Add Member
        </button>
      </div>

      <div className="filters-section">
        <div className="search-form">
          <div className="search-input-group">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading members...</p>
        </div>
      ) : (
        <>
          <div className="stats-section">
            <div className="stat-item">
              <h3>{filteredMembers.length}</h3>
              <p>Total Members</p>
            </div>
            <div className="stat-item">
              <h3>{filteredMembers.filter(m => m.isActive).length}</h3>
              <p>Active</p>
            </div>
            <div className="stat-item">
              <h3>{filteredMembers.filter(m => !m.isActive).length}</h3>
              <p>Inactive</p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No members found
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member._id}>
                      <td>
                        <img
                          src={member.image?.url || 'https://via.placeholder.com/40'}
                          alt={member.name}
                          className="member-photo"
                        />
                      </td>
                      <td className="member-name">{member.name}</td>
                      <td className="description-cell">
                        {member.description.substring(0, 50)}...
                      </td>
                      <td>
                        <span className={`status-badge ${member.isActive ? 'active' : 'inactive'}`}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-view"
                            onClick={() => viewDetails(member)}
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit(member)}
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="btn-icon btn-toggle"
                            onClick={() => handleToggleStatus(member._id)}
                            title={member.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {member.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(member._id)}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Member' : 'Add Member'}</h2>
              <button onClick={resetForm} className="close-btn">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="club-form">
              <div className="form-section">
                <h3>Profile Picture</h3>
                <div className="image-upload-container">
                  <div className="image-preview">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" />
                    ) : (
                      <div className="placeholder">
                        <Upload size={40} />
                        <p>Upload Photo</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="profileImage"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="profileImage" className="upload-btn">
                    {imagePreview ? 'Change Image' : 'Choose Image'}
                  </label>
                </div>
              </div>

              <div className="form-section">
                <h3>Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter name"
                      required
                    />
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
                  </div>

                  <div className="form-group full-width">
                    <label>Description <span className="required">*</span></label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter description"
                      rows="4"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <Save size={20} />
                  {submitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Member Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-card">
                <img
                  src={selectedMember.image?.url || 'https://via.placeholder.com/150'}
                  alt={selectedMember.name}
                  className="detail-photo"
                />
                <div className="detail-info">
                  <div className="info-row">
                    <label>Name:</label>
                    <span>{selectedMember.name}</span>
                  </div>
                  <div className="info-row">
                    <label>Description:</label>
                    <span>{selectedMember.description}</span>
                  </div>
                  <div className="info-row">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedMember.isActive ? 'active' : 'inactive'}`}>
                      {selectedMember.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubManagement;