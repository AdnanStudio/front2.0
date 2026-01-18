/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import teacherService from '../services/teacherService';
import subjectService from '../services/subjectService';
import toast from 'react-hot-toast';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  BookOpen,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './Teachers.css';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [filterSubject, currentPage]);

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getAllSubjects({ isActive: true });
      setSubjects(data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 9
      };
      if (filterSubject) params.subject = filterSubject;
      if (searchTerm) params.search = searchTerm;

      const data = await teacherService.getAllTeachers(params);
      setTeachers(data.data);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.count || 0);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTeachers();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await teacherService.deleteTeacher(id);
        toast.success('Teacher deleted successfully');
        fetchTeachers();
      } catch (error) {
        toast.error(error.message || 'Failed to delete teacher');
      }
    }
  };

  const viewTeacherDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setShowModal(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="teachers-page">
      <div className="page-header">
        <div className="header-left">
          <GraduationCap size={32} />
          <div>
            <h1>Teachers Management</h1>
            <p>Manage all teachers in your school</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => navigate('/dashboard/teachers/add')}>
          <Plus size={20} />
          Add Teacher
        </button>
      </div>

      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-search">Search</button>
        </form>

        <div className="filter-group">
          <BookOpen size={20} />
          <select value={filterSubject} onChange={(e) => {
            setFilterSubject(e.target.value);
            setCurrentPage(1);
          }}>
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading teachers...</p>
        </div>
      ) : (
        <>
          <div className="teachers-stats">
            <div className="stat-item">
              <h3>{totalCount}</h3>
              <p>Total Teachers</p>
            </div>
            <div className="stat-item">
              <h3>{teachers.filter(t => t.userId?.isActive).length}</h3>
              <p>Active</p>
            </div>
            <div className="stat-item">
              <h3>{subjects.length}</h3>
              <p>Subjects Available</p>
            </div>
          </div>

          <div className="teachers-grid">
            {teachers.length === 0 ? (
              <div className="no-data">
                <GraduationCap size={64} />
                <p>No teachers found</p>
                <button onClick={() => navigate('/dashboard/teachers/add')} className="btn-primary">
                  Add First Teacher
                </button>
              </div>
            ) : (
              teachers.map((teacher) => (
                <div key={teacher._id} className="teacher-card">
                  <div className="teacher-card-header">
                    <img
                      src={teacher.userId?.profileImage || 'https://via.placeholder.com/100'}
                      alt={teacher.userId?.name}
                      className="teacher-avatar"
                    />
                    <span className={`status-badge ${teacher.userId?.isActive ? 'active' : 'inactive'}`}>
                      {teacher.userId?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="teacher-card-body">
                    <h3>{teacher.userId?.name}</h3>
                    <p className="teacher-id">ID: {teacher.employeeId}</p>
                    <p className="teacher-qualification">{teacher.qualification}</p>
                    
                    <div className="teacher-subjects">
                      {teacher.subjects?.slice(0, 2).map((sub) => (
                        <span key={sub._id} className="subject-tag">{sub.name}</span>
                      ))}
                      {teacher.subjects?.length > 2 && (
                        <span className="subject-tag more">+{teacher.subjects.length - 2}</span>
                      )}
                    </div>

                    <div className="teacher-info">
                      <div className="info-item">
                        <Phone size={14} />
                        <span>{teacher.userId?.phone || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <Mail size={14} />
                        <span>{teacher.userId?.email}</span>
                      </div>
                    </div>

                    <div className="teacher-footer">
                      <span className="experience-badge">
                        {teacher.experience} years exp.
                      </span>
                      <span className="salary-badge">
                        ৳{teacher.salary?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="teacher-card-actions">
                    <button
                      className="btn-icon btn-view"
                      onClick={() => viewTeacherDetails(teacher)}
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => navigate(`/dashboard/teachers/edit/${teacher._id}`)}
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(teacher._id)}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
                Previous
              </button>
              
              <div className="pagination-numbers">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Teacher Details Modal */}
      {showModal && selectedTeacher && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Teacher Details</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="teacher-detail-card">
                <img
                  src={selectedTeacher.userId?.profileImage || 'https://via.placeholder.com/150'}
                  alt={selectedTeacher.userId?.name}
                  className="detail-photo"
                />
                <div className="detail-info">
                  <div className="info-row">
                    <label>Name:</label>
                    <span>{selectedTeacher.userId?.name}</span>
                  </div>
                  <div className="info-row">
                    <label>Employee ID:</label>
                    <span>{selectedTeacher.employeeId}</span>
                  </div>
                  <div className="info-row">
                    <label>Email:</label>
                    <span>{selectedTeacher.userId?.email}</span>
                  </div>
                  <div className="info-row">
                    <label>Phone:</label>
                    <span>{selectedTeacher.userId?.phone || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <label>Date of Birth:</label>
                    <span>
                      {selectedTeacher.userId?.dateOfBirth 
                        ? new Date(selectedTeacher.userId.dateOfBirth).toLocaleDateString() 
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="info-row">
                    <label>Subjects:</label>
                    <span>{selectedTeacher.subjects?.map(s => s.name).join(', ') || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <label>Classes:</label>
                    <span>{selectedTeacher.classes?.map(c => `${c.name}-${c.section}`).join(', ') || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <label>Qualification:</label>
                    <span>{selectedTeacher.qualification}</span>
                  </div>
                  <div className="info-row">
                    <label>Experience:</label>
                    <span>{selectedTeacher.experience} years</span>
                  </div>
                  <div className="info-row">
                    <label>Salary:</label>
                    <span>৳{selectedTeacher.salary?.toLocaleString()}</span>
                  </div>
                  <div className="info-row">
                    <label>Joining Date:</label>
                    <span>{new Date(selectedTeacher.joiningDate).toLocaleDateString()}</span>
                  </div>
                  <div className="info-row">
                    <label>Address:</label>
                    <span>{selectedTeacher.userId?.address || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <label>Status:</label>
                    <span className={selectedTeacher.userId?.isActive ? 'status-active' : 'status-inactive'}>
                      {selectedTeacher.userId?.isActive ? 'Active' : 'Inactive'}
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

export default Teachers;