import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  BookOpen,
  Users,
  Award,
  Eye,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react';
import subjectService from '../services/subjectService';
import { getAllClasses } from '../services/classService';
import { getAllTeachers } from '../services/teacherService';
import './Subjects.css';

const Subjects = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    department: '',
    isActive: '',
    class: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    department: 'General',
    class: '',
    teacher: '',
    credits: 1,
    type: 'Theory',
    passingMarks: 33,
    totalMarks: 100,
    isActive: true
  });

  // ============ Load Data ============
  useEffect(() => {
    fetchSubjects();
    fetchClasses();
    fetchTeachers();
  }, []);

  useEffect(() => {
    filterSubjects();
  }, [subjects, searchTerm, filters]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectService.getAllSubjects();
      setSubjects(response.data);
    } catch (error) {
      toast.error(error.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await getAllClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await getAllTeachers();
      setTeachers(response.data);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  // ============ Filter Function ============
  const filterSubjects = () => {
    let filtered = subjects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (subject) =>
          subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(
        (subject) => subject.department === filters.department
      );
    }

    // Active status filter
    if (filters.isActive !== '') {
      filtered = filtered.filter(
        (subject) => subject.isActive === (filters.isActive === 'true')
      );
    }

    // Class filter
    if (filters.class) {
      filtered = filtered.filter(
        (subject) => subject.class?._id === filters.class
      );
    }

    setFilteredSubjects(filtered);
  };

  // ============ Form Handlers ============
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      department: 'General',
      class: '',
      teacher: '',
      credits: 1,
      type: 'Theory',
      passingMarks: 33,
      totalMarks: 100,
      isActive: true
    });
  };

  // ============ CRUD Operations ============
  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      await subjectService.createSubject(formData);
      toast.success('Subject created successfully!');
      setShowAddModal(false);
      resetForm();
      fetchSubjects();
    } catch (error) {
      toast.error(error.message || 'Failed to create subject');
    }
  };

  const handleEditClick = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      department: subject.department,
      class: subject.class?._id || '',
      teacher: subject.teacher?._id || '',
      credits: subject.credits,
      type: subject.type,
      passingMarks: subject.passingMarks,
      totalMarks: subject.totalMarks,
      isActive: subject.isActive
    });
    setShowEditModal(true);
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    try {
      await subjectService.updateSubject(selectedSubject._id, formData);
      toast.success('Subject updated successfully!');
      setShowEditModal(false);
      resetForm();
      setSelectedSubject(null);
      fetchSubjects();
    } catch (error) {
      toast.error(error.message || 'Failed to update subject');
    }
  };

  const handleDeleteClick = (subject) => {
    setSelectedSubject(subject);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await subjectService.deleteSubject(selectedSubject._id);
      toast.success('Subject deleted successfully!');
      setShowDeleteModal(false);
      setSelectedSubject(null);
      fetchSubjects();
    } catch (error) {
      toast.error(error.message || 'Failed to delete subject');
    }
  };

  const handleToggleStatus = async (subject) => {
    try {
      await subjectService.toggleSubjectStatus(subject._id);
      toast.success(
        `Subject ${!subject.isActive ? 'activated' : 'deactivated'} successfully!`
      );
      fetchSubjects();
    } catch (error) {
      toast.error(error.message || 'Failed to update subject status');
    }
  };

  // ============ Statistics ============
  const stats = {
    total: subjects.length,
    active: subjects.filter((s) => s.isActive).length,
    theory: subjects.filter((s) => s.type === 'Theory').length,
    practical: subjects.filter((s) => s.type === 'Practical').length
  };

  return (
    <div className="subjects-container">
      {/* Header */}
      <div className="subjects-header">
        <div className="header-left">
          <h1>
            <BookOpen size={28} />
            Subjects Management
          </h1>
          <p>Manage all subjects and courses</p>
        </div>
        <button className="btn-add" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Add New Subject
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Subjects</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.active}</h3>
            <p>Active Subjects</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.theory}</h3>
            <p>Theory Subjects</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.practical}</h3>
            <p>Practical Subjects</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="subjects-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          className="btn-filter"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          Filters
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Department</label>
            <select
              value={filters.department}
              onChange={(e) =>
                setFilters({ ...filters, department: e.target.value })
              }
            >
              <option value="">All Departments</option>
              <option value="Science">Science</option>
              <option value="Arts">Arts</option>
              <option value="Commerce">Commerce</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.isActive}
              onChange={(e) =>
                setFilters({ ...filters, isActive: e.target.value })
              }
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Class</label>
            <select
              value={filters.class}
              onChange={(e) =>
                setFilters({ ...filters, class: e.target.value })
              }
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - {cls.section}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn-clear-filter"
            onClick={() =>
              setFilters({ department: '', isActive: '', class: '' })
            }
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Subjects Table */}
      <div className="subjects-table-container">
        {loading ? (
          <div className="loading-spinner">Loading subjects...</div>
        ) : filteredSubjects.length === 0 ? (
          <div className="no-data">
            <BookOpen size={48} />
            <p>No subjects found</p>
          </div>
        ) : (
          <table className="subjects-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Type</th>
                <th>Credits</th>
                <th>Class</th>
                <th>Teacher</th>
                <th>Marks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((subject) => (
                <tr key={subject._id}>
                  <td>
                    <span className="subject-code">{subject.code}</span>
                  </td>
                  <td>
                    <strong>{subject.name}</strong>
                  </td>
                  <td>
                    <span className={`badge badge-${subject.department.toLowerCase()}`}>
                      {subject.department}
                    </span>
                  </td>
                  <td>{subject.type}</td>
                  <td>{subject.credits}</td>
                  <td>
                    {subject.class ? (
                      <span>
                        {subject.class.name} - {subject.class.section}
                      </span>
                    ) : (
                      <span className="text-muted">Not Assigned</span>
                    )}
                  </td>
                  <td>
                    {subject.teacher ? (
                      <span>{subject.teacher.name}</span>
                    ) : (
                      <span className="text-muted">Not Assigned</span>
                    )}
                  </td>
                  <td>
                    {subject.passingMarks}/{subject.totalMarks}
                  </td>
                  <td>
                    <button
                      className={`status-badge ${
                        subject.isActive ? 'active' : 'inactive'
                      }`}
                      onClick={() => handleToggleStatus(subject)}
                    >
                      {subject.isActive ? (
                        <>
                          <CheckCircle size={14} /> Active
                        </>
                      ) : (
                        <>
                          <XCircle size={14} /> Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon edit"
                        onClick={() => handleEditClick(subject)}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDeleteClick(subject)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Subject</h2>
              <button
                className="btn-close"
                onClick={() => setShowAddModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddSubject}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Subject Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Mathematics"
                  />
                </div>

                <div className="form-group">
                  <label>Subject Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., MATH101"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Subject description..."
                  />
                </div>

                <div className="form-group">
                  <label>Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Commerce">Commerce</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Class</label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} - {cls.section}
                      </option>
                    ))}
                  </select>
                </div>

                {/* <div className="form-group">
                  <label>Teacher</label>
                  <select
                    name="teacher"
                    value={formData.teacher}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div> */}

                <div className="form-group">
                  <label>Credits </label>
                  <input
                    type="number"
                    name="credits"
                    value={formData.credits}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Passing Marks *</label>
                  <input
                    type="number"
                    name="passingMarks"
                    value={formData.passingMarks}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Total Marks *</label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span>Active Subject</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={20} />
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Subject</h2>
              <button
                className="btn-close"
                onClick={() => setShowEditModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubject}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Subject Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Subject Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Commerce">Commerce</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Class</label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} - {cls.section}
                      </option>
                    ))}
                  </select>
                </div>

                {/* <div className="form-group">
                  <label>Teacher</label>
                  <select
                    name="teacher"
                    value={formData.teacher}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div> */}

                <div className="form-group">
                  <label>Credits </label>
                  <input
                    type="number"
                    name="credits"
                    value={formData.credits}
                    onChange={handleInputChange}
                    
                  />
                </div>

                <div className="form-group">
                  <label>Passing Marks *</label>
                  <input
                    type="number"
                    name="passingMarks"
                    value={formData.passingMarks}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Total Marks *</label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span>Active Subject</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Edit2 size={20} />
                  Update Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="modal-content modal-small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button
                className="btn-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <p>
                Are you sure you want to delete the subject{' '}
                <strong>{selectedSubject?.name}</strong>?
              </p>
              <p className="text-danger">This action cannot be undone.</p>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteConfirm}>
                <Trash2 size={20} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;