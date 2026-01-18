import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentService from '../services/studentService';
import classService from '../services/classService';
import toast from 'react-hot-toast';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './Students.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Dynamic classes and sections
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(20);

  const navigate = useNavigate();

  // Fetch classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch students when filters change
  useEffect(() => {
    fetchStudents();
  }, [filterClass, filterSection]);

  // Update sections when class changes
  useEffect(() => {
    if (filterClass) {
      updateSections(filterClass);
    } else {
      setSections([]);
      setFilterSection('');
    }
  }, [filterClass]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterClass, filterSection]);

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await classService.getAllClasses();
      setClasses(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch classes');
      console.error('Fetch classes error:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const updateSections = (classId) => {
    const selectedClass = classes.find(c => c._id === classId);
    if (selectedClass) {
      // Get all classes with same name to collect all sections
      const sameName = classes.filter(c => c.name === selectedClass.name);
      const uniqueSections = [...new Set(sameName.map(c => c.section))].sort();
      setSections(uniqueSections);
    } else {
      setSections([]);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filterClass) {
        // Find the class name from class ID
        const selectedClass = classes.find(c => c._id === filterClass);
        if (selectedClass) {
          params.class = selectedClass.name;
        }
      }
      
      if (filterSection) {
        params.section = filterSection;
      }

      const data = await studentService.getAllStudents(params);
      setStudents(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch students');
      console.error('Fetch students error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.deleteStudent(id);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await studentService.toggleStudentStatus(id);
      toast.success('Student status updated');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.userId?.name.toLowerCase().includes(searchLower) ||
      student.studentId.toLowerCase().includes(searchLower) ||
      student.userId?.email.toLowerCase().includes(searchLower)
    );
  });

  // Pagination calculations
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="students-page">
      <div className="page-header">
        <div className="header-left">
          <Users size={32} />
          <div>
            <h1>Students Management</h1>
            <p>Manage all students in your school</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => navigate('/dashboard/students/add')}>
          <Plus size={20} />
          Add Student
        </button>
      </div>

      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, ID or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-search">Search</button>
        </form>

        <div className="filter-group">
          <Filter size={20} />
          <select 
            value={filterClass} 
            onChange={(e) => setFilterClass(e.target.value)}
            disabled={loadingClasses}
          >
            <option value="">
              {loadingClasses ? 'Loading...' : 'All Classes'}
            </option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>

          <select 
            value={filterSection} 
            onChange={(e) => setFilterSection(e.target.value)}
            disabled={!filterClass || sections.length === 0}
          >
            <option value="">
              {!filterClass ? 'Select class first' : 'All Sections'}
            </option>
            {sections.map((section) => (
              <option key={section} value={section}>
                Section {section}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading students...</p>
        </div>
      ) : (
        <>
          <div className="students-stats">
            <div className="stat-item">
              <h3>{filteredStudents.length}</h3>
              <p>Total Students</p>
            </div>
            <div className="stat-item">
              <h3>{filteredStudents.filter(s => s.userId?.isActive).length}</h3>
              <p>Active</p>
            </div>
            <div className="stat-item">
              <h3>{filteredStudents.filter(s => !s.userId?.isActive).length}</h3>
              <p>Inactive</p>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="table-container desktop-view">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Roll</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">
                      No students found
                    </td>
                  </tr>
                ) : (
                  currentStudents.map((student) => (
                    <tr key={student._id}>
                      <td>
                        <img
                          src={student.userId?.profileImage || 'https://via.placeholder.com/40'}
                          alt={student.userId?.name}
                          className="student-photo"
                        />
                      </td>
                      <td>{student.studentId}</td>
                      <td className="student-name">{student.userId?.name}</td>
                      <td>{student.class?.name || student.class}</td>
                      <td>{student.section}</td>
                      <td>{student.rollNumber}</td>
                      <td>{student.userId?.phone || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${student.userId?.isActive ? 'active' : 'inactive'}`}>
                          {student.userId?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-view"
                            onClick={() => viewStudentDetails(student)}
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => navigate(`/dashboard/students/edit/${student._id}`)}
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="btn-icon btn-toggle"
                            onClick={() => handleToggleStatus(student._id)}
                            title={student.userId?.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {student.userId?.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(student._id)}
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

          {/* Mobile Card View */}
          <div className="mobile-view">
            {currentStudents.length === 0 ? (
              <div className="no-data">No students found</div>
            ) : (
              currentStudents.map((student) => (
                <div key={student._id} className="student-card">
                  <div className="student-card-header">
                    <img
                      src={student.userId?.profileImage || 'https://via.placeholder.com/60'}
                      alt={student.userId?.name}
                      className="student-card-photo"
                    />
                    <div className="student-card-info">
                      <h3>{student.userId?.name}</h3>
                      <p className="student-id">{student.studentId}</p>
                      <span className={`status-badge ${student.userId?.isActive ? 'active' : 'inactive'}`}>
                        {student.userId?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="student-card-details">
                    <div className="detail-row">
                      <span className="label">Class:</span>
                      <span className="value">{student.class?.name || student.class} - {student.section}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Roll:</span>
                      <span className="value">{student.rollNumber}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Contact:</span>
                      <span className="value">{student.userId?.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="student-card-actions">
                    <button
                      className="btn-icon btn-view"
                      onClick={() => viewStudentDetails(student)}
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => navigate(`/dashboard/students/edit/${student._id}`)}
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="btn-icon btn-toggle"
                      onClick={() => handleToggleStatus(student._id)}
                      title="Toggle"
                    >
                      {student.userId?.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(student._id)}
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
          {filteredStudents.length > studentsPerPage && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length} students
              </div>
              
              <div className="pagination">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>

                <div className="pagination-numbers">
                  {getPageNumbers().map((number, index) => (
                    <button
                      key={index}
                      onClick={() => typeof number === 'number' && paginate(number)}
                      className={`pagination-number ${currentPage === number ? 'active' : ''} ${number === '...' ? 'dots' : ''}`}
                      disabled={number === '...'}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Student Details Modal */}
      {showModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Details</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="student-detail-card">
                <img
                  src={selectedStudent.userId?.profileImage || 'https://via.placeholder.com/150'}
                  alt={selectedStudent.userId?.name}
                  className="detail-photo"
                />
                <div className="detail-info">
                  <div className="info-row">
                    <label>Name:</label>
                    <span>{selectedStudent.userId?.name}</span>
                  </div>
                  <div className="info-row">
                    <label>Student ID:</label>
                    <span>{selectedStudent.studentId}</span>
                  </div>
                  <div className="info-row">
                    <label>Email:</label>
                    <span>{selectedStudent.userId?.email}</span>
                  </div>
                  <div className="info-row">
                    <label>Phone:</label>
                    <span>{selectedStudent.userId?.phone || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <label>Class:</label>
                    <span>{selectedStudent.class?.name || selectedStudent.class} - Section {selectedStudent.section}</span>
                  </div>
                  <div className="info-row">
                    <label>Roll Number:</label>
                    <span>{selectedStudent.rollNumber}</span>
                  </div>
                  <div className="info-row">
                    <label>Blood Group:</label>
                    <span>{selectedStudent.bloodGroup || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <label>Guardian Name:</label>
                    <span>{selectedStudent.guardianName}</span>
                  </div>
                  <div className="info-row">
                    <label>Guardian Phone:</label>
                    <span>{selectedStudent.guardianPhone}</span>
                  </div>
                  <div className="info-row">
                    <label>Address:</label>
                    <span>{selectedStudent.userId?.address || 'N/A'}</span>
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

export default Students;



// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import studentService from '../services/studentService';
// import toast from 'react-hot-toast';
// import { 
//   Users, 
//   Plus, 
//   Search, 
//   Edit, 
//   Trash2, 
//   Eye,
//   Filter,
//   UserCheck,
//   UserX
// } from 'lucide-react';
// import './Students.css';

// const Students = () => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterClass, setFilterClass] = useState('');
//   const [filterSection, setFilterSection] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);

//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchStudents();
//   }, [filterClass, filterSection]);

//   const fetchStudents = async () => {
//     try {
//       setLoading(true);
//       const params = {};
//       if (filterClass) params.class = filterClass;
//       if (filterSection) params.section = filterSection;
//       if (searchTerm) params.search = searchTerm;

//       const data = await studentService.getAllStudents(params);
//       setStudents(data.data);
//     } catch (error) {
//       toast.error('Failed to fetch students');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     fetchStudents();
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this student?')) {
//       try {
//         await studentService.deleteStudent(id);
//         toast.success('Student deleted successfully');
//         fetchStudents();
//       } catch (error) {
//         toast.error('Failed to delete student');
//       }
//     }
//   };

//   const handleToggleStatus = async (id) => {
//     try {
//       await studentService.toggleStudentStatus(id);
//       toast.success('Student status updated');
//       fetchStudents();
//     } catch (error) {
//       toast.error('Failed to update status');
//     }
//   };

//   const viewStudentDetails = (student) => {
//     setSelectedStudent(student);
//     setShowModal(true);
//   };

//   return (
//     <div className="students-page">
//       <div className="page-header">
//         <div className="header-left">
//           <Users size={32} />
//           <div>
//             <h1>Students Management</h1>
//             <p>Manage all students in your school</p>
//           </div>
//         </div>
//         <button className="btn-primary" onClick={() => navigate('/dashboard/students/add')}>
//           <Plus size={20} />
//           Add Student
//         </button>
//       </div>

//       <div className="filters-section">
//         <form onSubmit={handleSearch} className="search-form">
//           <div className="search-input-group">
//             <Search size={20} />
//             <input
//               type="text"
//               placeholder="Search by name or student ID..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <button type="submit" className="btn-search">Search</button>
//         </form>

//         <div className="filter-group">
//           <Filter size={20} />
//           <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
//             <option value="">All Classes</option>
//             <option value="Class 6">Class 6</option>
//             <option value="Class 7">Class 7</option>
//             <option value="Class 8">Class 8</option>
//             <option value="Class 9">Class 9</option>
//             <option value="Class 10">Class 10</option>
//           </select>

//           <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
//             <option value="">All Sections</option>
//             <option value="A">Section A</option>
//             <option value="B">Section B</option>
//             <option value="C">Section C</option>
//           </select>
//         </div>
//       </div>

//       {loading ? (
//         <div className="loading-container">
//           <div className="spinner"></div>
//           <p>Loading students...</p>
//         </div>
//       ) : (
//         <>
//           <div className="students-stats">
//             <div className="stat-item">
//               <h3>{students.length}</h3>
//               <p>Total Students</p>
//             </div>
//             <div className="stat-item">
//               <h3>{students.filter(s => s.userId?.isActive).length}</h3>
//               <p>Active</p>
//             </div>
//             <div className="stat-item">
//               <h3>{students.filter(s => !s.userId?.isActive).length}</h3>
//               <p>Inactive</p>
//             </div>
//           </div>

//           <div className="table-container">
//             <table className="data-table">
//               <thead>
//                 <tr>
//                   <th>Photo</th>
//                   <th>Student ID</th>
//                   <th>Name</th>
//                   <th>Class</th>
//                   <th>Section</th>
//                   <th>Roll</th>
//                   <th>Contact</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {students.length === 0 ? (
//                   <tr>
//                     <td colSpan="9" className="no-data">
//                       No students found
//                     </td>
//                   </tr>
//                 ) : (
//                   students.map((student) => (
//                     <tr key={student._id}>
//                       <td>
//                         <img
//                           src={student.userId?.profileImage || 'https://via.placeholder.com/40'}
//                           alt={student.userId?.name}
//                           className="student-photo"
//                         />
//                       </td>
//                       <td>{student.studentId}</td>
//                       <td className="student-name">{student.userId?.name}</td>
//                       <td>{student.class}</td>
//                       <td>{student.section}</td>
//                       <td>{student.rollNumber}</td>
//                       <td>{student.userId?.phone || 'N/A'}</td>
//                       <td>
//                         <span className={`status-badge ${student.userId?.isActive ? 'active' : 'inactive'}`}>
//                           {student.userId?.isActive ? 'Active' : 'Inactive'}
//                         </span>
//                       </td>
//                       <td>
//                         <div className="action-buttons">
//                           <button
//                             className="btn-icon btn-view"
//                             onClick={() => viewStudentDetails(student)}
//                             title="View Details"
//                           >
//                             <Eye size={18} />
//                           </button>
//                           <button
//                             className="btn-icon btn-edit"
//                             onClick={() => navigate(`/dashboard/students/edit/${student._id}`)}
//                             title="Edit"
//                           >
//                             <Edit size={18} />
//                           </button>
//                           <button
//                             className="btn-icon btn-toggle"
//                             onClick={() => handleToggleStatus(student._id)}
//                             title={student.userId?.isActive ? 'Deactivate' : 'Activate'}
//                           >
//                             {student.userId?.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
//                           </button>
//                           <button
//                             className="btn-icon btn-delete"
//                             onClick={() => handleDelete(student._id)}
//                             title="Delete"
//                           >
//                             <Trash2 size={18} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}

//       {/* Student Details Modal */}
//       {showModal && selectedStudent && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>Student Details</h2>
//               <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
//             </div>
//             <div className="modal-body">
//               <div className="student-detail-card">
//                 <img
//                   src={selectedStudent.userId?.profileImage || 'https://via.placeholder.com/150'}
//                   alt={selectedStudent.userId?.name}
//                   className="detail-photo"
//                 />
//                 <div className="detail-info">
//                   <div className="info-row">
//                     <label>Name:</label>
//                     <span>{selectedStudent.userId?.name}</span>
//                   </div>
//                   <div className="info-row">
//                     <label>Student ID:</label>
//                     <span>{selectedStudent.studentId}</span>
//                   </div>
//                   <div className="info-row">
//                     <label>Email:</label>
//                     <span>{selectedStudent.userId?.email}</span>
//                   </div>
//                   <div className="info-row">
//                     <label>Phone:</label>
//                     <span>{selectedStudent.userId?.phone || 'N/A'}</span>
//                   </div>
//                   <div className="info-row">
//                     <label>Class:</label>
//                     <span>{selectedStudent.class} - Section {selectedStudent.section}</span>
//                   </div>
//                   <div className="info-row">
//                     <label>Roll Number:</label>
//                     <span>{selectedStudent.rollNumber}</span>
//                   </div>
//                   <div className="info-row">
//                     <label>Blood Group:</label>
//                     <span>{selectedStudent.bloodGroup || 'N/A'}</span>
//                   </div>
//                   <div className="info-row">
//                     <label>Guardian Name:</label>
//                     <span>{selectedStudent.guardianName}</span>
//                   </div>
//                   <div className="info-row">
//                     <label>Guardian Phone:</label>
//                     <span>{selectedStudent.guardianPhone}</span>
//                   </div>
//                   <div className="info-row">
//                     <label>Address:</label>
//                     <span>{selectedStudent.userId?.address || 'N/A'}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Students;