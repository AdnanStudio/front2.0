import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import teacherListService from '../services/teacherListService';
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
import './TeacherListManagement.css';

const TeacherListManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    phone: '',
    email: '',
    qualification: '',
    subjects: '',
    experience: '',
    order: 0
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await teacherListService.getAllTeachers(params);
      setTeachers(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch teachers');
      console.error('Fetch teachers error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTeachers();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

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
    if (!formData.name || !formData.designation) {
      toast.error('Name and designation are required');
      return false;
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email');
        return false;
      }
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
        await teacherListService.updateTeacher(selectedTeacher._id, submitData);
        toast.success('Teacher updated successfully!');
      } else {
        await teacherListService.createTeacher(submitData);
        toast.success('Teacher created successfully!');
      }

      resetForm();
      fetchTeachers();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Operation failed';
      toast.error(errorMessage);
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (teacher) => {
    setIsEditMode(true);
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      designation: teacher.designation,
      phone: teacher.phone || '',
      email: teacher.email || '',
      qualification: teacher.qualification || '',
      subjects: Array.isArray(teacher.subjects) ? teacher.subjects.join(', ') : '',
      experience: teacher.experience || '',
      order: teacher.order
    });
    setImagePreview(teacher.image?.url);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;

    try {
      await teacherListService.deleteTeacher(id);
      toast.success('Teacher deleted successfully');
      fetchTeachers();
    } catch (error) {
      toast.error('Failed to delete teacher');
      console.error('Delete error:', error);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await teacherListService.toggleTeacherStatus(id);
      toast.success('Status updated successfully');
      fetchTeachers();
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Toggle status error:', error);
    }
  };

  const viewDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      designation: '',
      phone: '',
      email: '',
      qualification: '',
      subjects: '',
      experience: '',
      order: 0
    });
    setProfileImage(null);
    setImagePreview(null);
    setIsEditMode(false);
    setSelectedTeacher(null);
    setShowModal(false);
  };

  return (
    <div className="teacher-list-management-page">
      <div className="page-header">
        <div className="header-left">
          <Users size={32} />
          <div>
            <h1>Teacher List Management</h1>
            <p>Manage public teacher directory</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Add Teacher
        </button>
      </div>

      <div className="filters-section">
        <div className="search-form">
          <div className="search-input-group">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, designation or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading teachers...</p>
        </div>
      ) : (
        <>
          <div className="stats-section">
            <div className="stat-item">
              <h3>{teachers.length}</h3>
              <p>Total Teachers</p>
            </div>
            <div className="stat-item">
              <h3>{teachers.filter(t => t.isActive).length}</h3>
              <p>Active</p>
            </div>
            <div className="stat-item">
              <h3>{teachers.filter(t => !t.isActive).length}</h3>
              <p>Inactive</p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Subjects</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No teachers found
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
                    <tr key={teacher._id}>
                      <td>
                        <img
                          src={teacher.image?.url || 'https://via.placeholder.com/40'}
                          alt={teacher.name}
                          className="teacher-photo"
                        />
                      </td>
                      <td className="teacher-name">{teacher.name}</td>
                      <td>{teacher.designation}</td>
                      <td>{teacher.phone || 'N/A'}</td>
                      <td>{teacher.email || 'N/A'}</td>
                      <td>
                        {Array.isArray(teacher.subjects) && teacher.subjects.length > 0
                          ? teacher.subjects.join(', ')
                          : 'N/A'}
                      </td>
                      <td>
                        <span className={`status-badge ${teacher.isActive ? 'active' : 'inactive'}`}>
                          {teacher.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-view"
                            onClick={() => viewDetails(teacher)}
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit(teacher)}
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="btn-icon btn-toggle"
                            onClick={() => handleToggleStatus(teacher._id)}
                            title={teacher.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {teacher.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(teacher._id)}
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
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Teacher' : 'Add Teacher'}</h2>
              <button onClick={resetForm} className="close-btn">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="teacher-form">
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
                <h3>Basic Information</h3>
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
                    <label>Designation <span className="required">*</span></label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      placeholder="e.g., Senior Lecturer"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Academic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Qualification</label>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      placeholder="e.g., M.Sc in Mathematics"
                    />
                  </div>

                  <div className="form-group">
                    <label>Experience</label>
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="e.g., 10 years"
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
                    <label>Subjects (comma-separated)</label>
                    <input
                      type="text"
                      name="subjects"
                      value={formData.subjects}
                      onChange={handleInputChange}
                      placeholder="e.g., Mathematics, Physics, Chemistry"
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
      {showDetailsModal && selectedTeacher && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Teacher Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-card">
                <img
                  src={selectedTeacher.image?.url || 'https://via.placeholder.com/150'}
                  alt={selectedTeacher.name}
                  className="detail-photo"
                />
                <div className="detail-info">
                  <div className="info-row">
                    <label>Name:</label>
                    <span>{selectedTeacher.name}</span>
                  </div>
                  <div className="info-row">
                    <label>Designation:</label>
                    <span>{selectedTeacher.designation}</span>
                  </div>
                  <div className="info-row">
                    <label>Phone:</label>
                    <span>{selectedTeacher.phone || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <label>Email:</label>
                    <span>{selectedTeacher.email || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <label>Qualification:</label>
                    <span>{selectedTeacher.qualification || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <label>Subjects:</label>
                    <span>
                      {Array.isArray(selectedTeacher.subjects) && selectedTeacher.subjects.length > 0
                        ? selectedTeacher.subjects.join(', ')
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="info-row">
                    <label>Experience:</label>
                    <span>{selectedTeacher.experience || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedTeacher.isActive ? 'active' : 'inactive'}`}>
                      {selectedTeacher.isActive ? 'Active' : 'Inactive'}
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

export default TeacherListManagement;