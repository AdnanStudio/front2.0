import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Download, 
  Trash2, 
  Eye,
  Filter,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './AdmissionList.css';

const AdmissionList = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAdmissions();
  }, [pagination.page]);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://backend-yfp1.onrender.com/api/admissions?page=${pagination.page}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAdmissions(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch admissions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAdmissions();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admission?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://backend-yfp1.onrender.com/api/admissions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Admission deleted successfully');
      fetchAdmissions();
    } catch (error) {
      toast.error('Failed to delete admission');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL admissions? This cannot be undone!')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete('https://backend-yfp1.onrender.com/api/admissions', {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('All admissions deleted successfully');
      fetchAdmissions();
    } catch (error) {
      toast.error('Failed to delete all admissions');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://backend-yfp1.onrender.com/api/admissions/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admissions_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Excel file downloaded successfully');
    } catch (error) {
      toast.error('Failed to export admissions');
    }
  };

  const viewDetails = (admission) => {
    setSelectedAdmission(admission);
    setShowModal(true);
  };

  const getAdmissionTypeBadge = (type) => {
    const badges = {
      'inter_first_year': { label: 'Inter 1st Year', color: '#3b82f6' },
      'honours_first_year': { label: 'Honours 1st Year', color: '#10b981' },
      'degree_first_year': { label: 'Degree 1st Year', color: '#f59e0b' }
    };
    return badges[type] || { label: type, color: '#6b7280' };
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { label: 'Pending', color: '#f59e0b' },
      'approved': { label: 'Approved', color: '#10b981' },
      'rejected': { label: 'Rejected', color: '#ef4444' }
    };
    return badges[status] || { label: status, color: '#6b7280' };
  };

  const filteredAdmissions = admissions.filter(adm => {
    const matchesType = !filterType || adm.admissionType === filterType;
    const matchesSearch = !searchQuery || 
      adm.studentNameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.mobileNumber.includes(searchQuery);
    return matchesType && matchesSearch;
  });

  return (
    <div className="admissions-page">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <FileText size={32} />
          <div>
            <h1>Admission Applications</h1>
            <p>Manage all admission requests</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary btn-export" onClick={handleExport}>
            <Download size={20} />
            Export Excel
          </button>
          <button className="btn-danger btn-delete-all" onClick={handleDeleteAll}>
            <Trash2 size={20} />
            Delete All
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, reg no, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-search">Search</button>
        </form>

        <div className="filter-group">
          <Filter size={20} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="inter_first_year">Inter 1st Year</option>
            <option value="honours_first_year">Honours 1st Year</option>
            <option value="degree_first_year">Degree 1st Year</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading admissions...</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="students-stats">
            <div className="stat-item">
              <h3>{filteredAdmissions.length}</h3>
              <p>Total Applications</p>
            </div>
            <div className="stat-item">
              <h3>{filteredAdmissions.filter(a => a.status === 'pending').length}</h3>
              <p>Pending</p>
            </div>
            <div className="stat-item">
              <h3>{filteredAdmissions.filter(a => a.status === 'approved').length}</h3>
              <p>Approved</p>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Reg No</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Mobile</th>
                  <th>SSC GPA</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">
                      No admissions found
                    </td>
                  </tr>
                ) : (
                  filteredAdmissions.map((admission) => {
                    const typeBadge = getAdmissionTypeBadge(admission.admissionType);
                    const statusBadge = getStatusBadge(admission.status);

                    return (
                      <tr key={admission._id}>
                        <td>
                          <img
                            src={admission.profilePicture?.url || 'https://via.placeholder.com/40'}
                            alt={admission.studentNameEnglish}
                            className="student-photo"
                          />
                        </td>
                        <td className="reg-no">{admission.registrationNumber}</td>
                        <td className="student-name">
                          <div>
                            <strong>{admission.studentNameEnglish}</strong>
                            <small>{admission.studentNameBangla}</small>
                          </div>
                        </td>
                        <td>
                          <span 
                            className="status-badge" 
                            style={{ backgroundColor: typeBadge.color }}
                          >
                            {typeBadge.label}
                          </span>
                        </td>
                        <td>{admission.mobileNumber}</td>
                        <td className="gpa">{admission.sscGPA}</td>
                        <td>
                          <span 
                            className="status-badge" 
                            style={{ backgroundColor: statusBadge.color }}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td>{new Date(admission.submittedAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon btn-view"
                              onClick={() => viewDetails(admission)}
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              className="btn-icon btn-delete"
                              onClick={() => handleDelete(admission._id)}
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination-container">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="pagination-btn"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>

              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="pagination-btn"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      {showModal && selectedAdmission && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Admission Details</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="student-detail-card">
                <img 
                  src={selectedAdmission.profilePicture?.url || 'https://via.placeholder.com/150'}
                  alt={selectedAdmission.studentNameEnglish}
                  className="detail-photo"
                />
                <div className="detail-info">
                  <div className="info-row">
                    <label>Reg No:</label>
                    <span>{selectedAdmission.registrationNumber}</span>
                  </div>
                  <div className="info-row">
                    <label>Name (English):</label>
                    <span>{selectedAdmission.studentNameEnglish}</span>
                  </div>
                  <div className="info-row">
                    <label>Name (Bangla):</label>
                    <span>{selectedAdmission.studentNameBangla}</span>
                  </div>
                  <div className="info-row">
                    <label>Father:</label>
                    <span>{selectedAdmission.fatherNameEnglish}</span>
                  </div>
                  <div className="info-row">
                    <label>Mother:</label>
                    <span>{selectedAdmission.motherNameEnglish}</span>
                  </div>
                  <div className="info-row">
                    <label>Mobile:</label>
                    <span>{selectedAdmission.mobileNumber}</span>
                  </div>
                  <div className="info-row">
                    <label>SSC Board:</label>
                    <span>{selectedAdmission.sscBoard}</span>
                  </div>
                  <div className="info-row">
                    <label>SSC GPA:</label>
                    <span>{selectedAdmission.sscGPA}</span>
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

export default AdmissionList;



// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import toast, { Toaster } from 'react-hot-toast';
// import { 
//   Download, 
//   Trash2, 
//   Eye,
//   Filter,
//   Search,
//   Users,
//   FileText,
//   ChevronLeft,
//   ChevronRight
// } from 'lucide-react';
// import './AdmissionList.css';

// const AdmissionList = () => {
//   const [admissions, setAdmissions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 20,
//     total: 0,
//     pages: 0
//   });
//   const [filterType, setFilterType] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedAdmission, setSelectedAdmission] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchAdmissions();
//   }, [pagination.page]);

//   const fetchAdmissions = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(
//         `https://backend-yfp1.onrender.com/api/admissions?page=${pagination.page}`,
//         {
//           headers: { Authorization: `Bearer ${token}` }
//         }
//       );

//       setAdmissions(response.data.data);
//       setPagination(response.data.pagination);
//     } catch (error) {
//       toast.error('Failed to fetch admissions');
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     fetchAdmissions();
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this admission?')) return;

//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete(`https://backend-yfp1.onrender.com/api/admissions/${id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       toast.success('Admission deleted successfully');
//       fetchAdmissions();
//     } catch (error) {
//       toast.error('Failed to delete admission');
//     }
//   };

//   const handleDeleteAll = async () => {
//     if (!window.confirm('Are you sure you want to delete ALL admissions? This cannot be undone!')) return;

//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete('https://backend-yfp1.onrender.com/api/admissions', {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       toast.success('All admissions deleted successfully');
//       fetchAdmissions();
//     } catch (error) {
//       toast.error('Failed to delete all admissions');
//     }
//   };

//   const handleExport = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('https://backend-yfp1.onrender.com/api/admissions/export', {
//         headers: { Authorization: `Bearer ${token}` },
//         responseType: 'blob'
//       });

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `admissions_${new Date().toISOString().split('T')[0]}.xlsx`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();

//       toast.success('Excel file downloaded successfully');
//     } catch (error) {
//       toast.error('Failed to export admissions');
//     }
//   };

//   const viewDetails = (admission) => {
//     setSelectedAdmission(admission);
//     setShowModal(true);
//   };

//   const getAdmissionTypeBadge = (type) => {
//     const badges = {
//       'inter_first_year': { label: 'Inter 1st Year', color: '#3b82f6' },
//       'honours_first_year': { label: 'Honours 1st Year', color: '#10b981' },
//       'degree_first_year': { label: 'Degree 1st Year', color: '#f59e0b' }
//     };
//     return badges[type] || { label: type, color: '#6b7280' };
//   };

//   const getStatusBadge = (status) => {
//     const badges = {
//       'pending': { label: 'Pending', color: '#f59e0b' },
//       'approved': { label: 'Approved', color: '#10b981' },
//       'rejected': { label: 'Rejected', color: '#ef4444' }
//     };
//     return badges[status] || { label: status, color: '#6b7280' };
//   };

//   const filteredAdmissions = admissions.filter(adm => {
//     const matchesType = !filterType || adm.admissionType === filterType;
//     const matchesSearch = !searchQuery || 
//       adm.studentNameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       adm.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       adm.mobileNumber.includes(searchQuery);
//     return matchesType && matchesSearch;
//   });

//   return (
//     <div className="admissions-page">
//       <Toaster position="top-right" />

//       {/* Header - Students.js Style */}
//       <div className="page-header">
//         <div className="header-left">
//           <FileText size={32} />
//           <div>
//             <h1>Admission Applications</h1>
//             <p>Manage all admission requests</p>
//           </div>
//         </div>
//         <div className="header-actions">
//           <button className="btn-primary btn-export" onClick={handleExport}>
//             <Download size={20} />
//             Export Excel
//           </button>
//           <button className="btn-danger btn-delete-all" onClick={handleDeleteAll}>
//             <Trash2 size={20} />
//             Delete All
//           </button>
//         </div>
//       </div>

//       {/* Filters Section */}
//       <div className="filters-section">
//         <form onSubmit={handleSearch} className="search-form">
//           <div className="search-input-group">
//             <Search size={20} />
//             <input
//               type="text"
//               placeholder="Search by name, reg no, or mobile..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//           <button type="submit" className="btn-search">Search</button>
//         </form>

//         <div className="filter-group">
//           <Filter size={20} />
//           <select
//             value={filterType}
//             onChange={(e) => setFilterType(e.target.value)}
//             className="filter-select"
//           >
//             <option value="">All Types</option>
//             <option value="inter_first_year">Inter 1st Year</option>
//             <option value="honours_first_year">Honours 1st Year</option>
//             <option value="degree_first_year">Degree 1st Year</option>
//           </select>
//         </div>
//       </div>

//       {loading ? (
//         <div className="loading-container">
//           <div className="spinner"></div>
//           <p>Loading admissions...</p>
//         </div>
//       ) : (
//         <>
//           {/* Stats */}
//           <div className="students-stats">
//             <div className="stat-item">
//               <h3>{filteredAdmissions.length}</h3>
//               <p>Total Applications</p>
//             </div>
//             <div className="stat-item">
//               <h3>{filteredAdmissions.filter(a => a.status === 'pending').length}</h3>
//               <p>Pending</p>
//             </div>
//             <div className="stat-item">
//               <h3>{filteredAdmissions.filter(a => a.status === 'approved').length}</h3>
//               <p>Approved</p>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="table-container">
//             <table className="data-table">
//               <thead>
//                 <tr>
//                   <th>Photo</th>
//                   <th>Reg No</th>
//                   <th>Name</th>
//                   <th>Type</th>
//                   <th>Mobile</th>
//                   <th>SSC GPA</th>
//                   <th>Status</th>
//                   <th>Submitted</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredAdmissions.length === 0 ? (
//                   <tr>
//                     <td colSpan="9" className="no-data">
//                       No admissions found
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredAdmissions.map((admission) => {
//                     const typeBadge = getAdmissionTypeBadge(admission.admissionType);
//                     const statusBadge = getStatusBadge(admission.status);

//                     return (
//                       <tr key={admission._id}>
//                         <td>
//                           <img
//                             src={admission.profilePicture?.url || 'https://via.placeholder.com/40'}
//                             alt={admission.studentNameEnglish}
//                             className="student-photo"
//                           />
//                         </td>
//                         <td className="reg-no">{admission.registrationNumber}</td>
//                         <td className="student-name">
//                           <div>
//                             <strong>{admission.studentNameEnglish}</strong>
//                             <small>{admission.studentNameBangla}</small>
//                           </div>
//                         </td>
//                         <td>
//                           <span 
//                             className="status-badge" 
//                             style={{ backgroundColor: typeBadge.color }}
//                           >
//                             {typeBadge.label}
//                           </span>
//                         </td>
//                         <td>{admission.mobileNumber}</td>
//                         <td className="gpa">{admission.sscGPA}</td>
//                         <td>
//                           <span 
//                             className="status-badge" 
//                             style={{ backgroundColor: statusBadge.color }}
//                           >
//                             {statusBadge.label}
//                           </span>
//                         </td>
//                         <td>{new Date(admission.submittedAt).toLocaleDateString()}</td>
//                         <td>
//                           <div className="action-buttons">
//                             <button
//                               className="btn-icon btn-view"
//                               onClick={() => viewDetails(admission)}
//                               title="View Details"
//                             >
//                               <Eye size={18} />
//                             </button>
//                             <button
//                               className="btn-icon btn-delete"
//                               onClick={() => handleDelete(admission._id)}
//                               title="Delete"
//                             >
//                               <Trash2 size={18} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {pagination.pages > 1 && (
//             <div className="pagination-container">
//               <button
//                 onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
//                 disabled={pagination.page === 1}
//                 className="pagination-btn"
//               >
//                 <ChevronLeft size={18} />
//                 Previous
//               </button>

//               <span className="pagination-info">
//                 Page {pagination.page} of {pagination.pages}
//               </span>

//               <button
//                 onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
//                 disabled={pagination.page === pagination.pages}
//                 className="pagination-btn"
//               >
//                 Next
//                 <ChevronRight size={18} />
//               </button>
//             </div>
//           )}
//         </>
//       )}

//       {/* Details Modal */}
//       {showModal && selectedAdmission && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>Admission Details</h2>
//               <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
//             </div>
//             <div className="modal-body">
//               <div className="student-detail-card">
//                 <img 
//                   src={selectedAdmission.profilePicture?.url || 'https://via.placeholder.com/150'}
//                   alt={selectedAdmission.studentNameEnglish}
//                   className="detail-photo"
//                 />
//                 <div className="detail-info">
//                   <div className="info-row">
//                     <label>Reg No:</label>
//                     <span>{selectedAdmission.registrationNumber}</span>
//                   </div>
//                   <div className="info-row">
//                     <label>Name (English):</label>
//                     <span>{selectedAdmission.studentNameEnglish}</span>
//                   </div>
//                   <div className="info-row">
//                     <label>Name (Bangla):</label>
//                     <span>{selectedAdmission.studentNameBangla}</span>
//                   </div>
//                   <div className="info-row">
//                     <label>Father:</label>
//                     <span>{selectedAdmission.fatherNameEnglish}</span>
//                   </div>
//                   <div className="info-row">
//                     <label>Mother:</label>
//                     <span>{selectedAdmission.motherNameEnglish}</span>
//                   </div>
//                   <div className="info-row">
//                     <label>Mobile:</label>
//                     <span>{selectedAdmission.mobileNumber}</span>
//                   </div>
//                   <div className="info-row">
//                     <label>SSC Board:</label>
//                     <span>{selectedAdmission.sscBoard}</span>
//                   </div>
//                   <div className="info-row">
//                     <label>SSC GPA:</label>
//                     <span>{selectedAdmission.sscGPA}</span>
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

// export default AdmissionList;