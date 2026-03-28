// ================================================================
// FILE PATH: src/pages/Students.js
// ================================================================
import React, { useState, useEffect } from 'react';
import { useNavigate }     from 'react-router-dom';
import studentService      from '../services/studentService';
import classService        from '../services/classService';
import toast               from 'react-hot-toast';
import ProfileAvatar       from '../components/ProfileAvatar';
import {
  Users, Plus, Search, Edit, Trash2, Eye,
  Filter, UserCheck, UserX, ChevronLeft, ChevronRight,
  CreditCard, RefreshCw, X, LayoutGrid, List
} from 'lucide-react';
import './Students.css';

const Students = () => {
  const navigate = useNavigate();

  /* ── State ─────────────────────────────────────── */
  const [students,       setStudents]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [filterClass,    setFilterClass]    = useState('');
  const [filterSection,  setFilterSection]  = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');
  const [showModal,      setShowModal]      = useState(false);
  const [selectedStudent,setSelectedStudent]= useState(null);
  const [classes,        setClasses]        = useState([]);
  const [sections,       setSections]       = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [viewMode,       setViewMode]       = useState('card'); // 'table' | 'card'
  const studentsPerPage = 20;

  /* ── Effects ────────────────────────────────────── */
  useEffect(() => { fetchClasses(); }, []);
  useEffect(() => { fetchStudents(); }, [filterClass, filterSection]); // eslint-disable-line
  useEffect(() => {
    if (filterClass) updateSections(filterClass);
    else { setSections([]); setFilterSection(''); }
  }, [filterClass]); // eslint-disable-line
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterClass, filterSection, filterStatus]);

  /* ── Data fetchers ──────────────────────────────── */
  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await classService.getAllClasses();
      setClasses(response.data || []);
    } catch {
      toast.error('ক্লাস লোড করতে ব্যর্থ');
    } finally {
      setLoadingClasses(false);
    }
  };

  const updateSections = (classId) => {
    const selected = classes.find(c => c._id === classId);
    if (selected) {
      const same = classes.filter(c => c.name === selected.name);
      setSections([...new Set(same.map(c => c.section))].sort());
    } else {
      setSections([]);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterClass) {
        const sel = classes.find(c => c._id === filterClass);
        if (sel) params.class = sel.name;
      }
      if (filterSection) params.section = filterSection;
      const data = await studentService.getAllStudents(params);
      setStudents(data.data || []);
    } catch {
      toast.error('শিক্ষার্থী লোড করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  /* ── Handlers ───────────────────────────────────── */
  const handleSearch = (e) => { e.preventDefault(); fetchStudents(); };

  const handleDelete = async (id) => {
    if (!window.confirm('এই শিক্ষার্থীকে মুছে ফেলবেন?')) return;
    try {
      await studentService.deleteStudent(id);
      toast.success('শিক্ষার্থী মুছে ফেলা হয়েছে');
      fetchStudents();
    } catch {
      toast.error('মুছতে ব্যর্থ');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await studentService.toggleStudentStatus(id);
      toast.success('স্ট্যাটাস আপডেট হয়েছে');
      fetchStudents();
    } catch {
      toast.error('স্ট্যাটাস আপডেট ব্যর্থ');
    }
  };

  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const clearFilters = () => {
    setFilterClass('');
    setFilterSection('');
    setFilterStatus('');
    setSearchTerm('');
  };

  /* ── Computed ───────────────────────────────────── */
  const filteredStudents = students.filter(s => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      s.userId?.name?.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q) ||
      s.userId?.email?.toLowerCase().includes(q) ||
      s.rollNumber?.toString().includes(q);
    const matchStatus = !filterStatus ||
      (filterStatus === 'active' && s.userId?.isActive) ||
      (filterStatus === 'inactive' && !s.userId?.isActive);
    return matchSearch && matchStatus;
  });

  const indexOfLast  = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const current      = filteredStudents.slice(indexOfFirst, indexOfLast);
  const totalPages   = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (n) => { setCurrentPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const getPageNums = () => {
    const nums = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) nums.push(i);
    } else if (currentPage <= 3) {
      [1,2,3,4,'...',totalPages].forEach(n => nums.push(n));
    } else if (currentPage >= totalPages - 2) {
      [1,'...',totalPages-3,totalPages-2,totalPages-1,totalPages].forEach(n => nums.push(n));
    } else {
      [1,'...',currentPage-1,currentPage,currentPage+1,'...',totalPages].forEach(n => nums.push(n));
    }
    return nums;
  };

  const activeCount   = students.filter(s => s.userId?.isActive).length;
  const inactiveCount = students.filter(s => !s.userId?.isActive).length;

  /* ── Render ─────────────────────────────────────── */
  return (
    <div className="students-page">

      {/* ── Page Header ──────────────────────────── */}
      <div className="page-header">
        <div className="header-left">
          <div className="page-header-icon">
            <Users size={22} />
          </div>
          <div>
            <h1>Students Management</h1>
            
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn-idcard"
            onClick={() => navigate('/dashboard/students/id-cards')}
            title="আইডি কার্ড জেনারেটর"
          >
            <CreditCard size={16} />
            <span>ID Card Generator</span>
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate('/dashboard/students/add')}
          >
            <Plus size={18} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* ── Stats Cards ──────────────────────────── */}
      <div className="students-stats">
        <div className="stat-card stat-total">
          <div className="stat-icon"><Users size={20} /></div>
          <div>
            <div className="stat-num">{students.length}</div>
            <div className="stat-lbl">মোট শিক্ষার্থী</div>
          </div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-icon"><UserCheck size={20} /></div>
          <div>
            <div className="stat-num">{activeCount}</div>
            <div className="stat-lbl">সক্রিয়</div>
          </div>
        </div>
        <div className="stat-card stat-inactive">
          <div className="stat-icon"><UserX size={20} /></div>
          <div>
            <div className="stat-num">{inactiveCount}</div>
            <div className="stat-lbl">নিষ্ক্রিয়</div>
          </div>
        </div>
        <div className="stat-card stat-filtered">
          <div className="stat-icon"><Filter size={20} /></div>
          <div>
            <div className="stat-num">{filteredStudents.length}</div>
            <div className="stat-lbl">ফিল্টার ফলাফল</div>
          </div>
        </div>
      </div>

      {/* ── Filters Section ──────────────────────── */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <Search size={18} />
            <input
              type="text"
              placeholder="নাম, ID, ইমেইল বা রোল দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button type="button" className="search-clear-btn" onClick={() => setSearchTerm('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <button type="submit" className="btn-search">
            <Search size={15} /> খুঁজুন
          </button>
        </form>

        <div className="filter-row">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              disabled={loadingClasses}
            >
              <option value="">{loadingClasses ? 'লোড হচ্ছে...' : '— সকল শ্রেণি —'}</option>
              {[...new Map(classes.map(c => [c.name, c])).values()].map(cls => (
                <option key={cls._id} value={cls._id}>{cls.name}</option>
              ))}
            </select>
            <select
              value={filterSection}
              onChange={e => setFilterSection(e.target.value)}
              disabled={!filterClass || !sections.length}
            >
              <option value="">
                {!filterClass ? '— শ্রেণি বেছে নিন —' : '— সকল শাখা —'}
              </option>
              {sections.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">— সকল স্ট্যাটাস —</option>
              <option value="active">সক্রিয়</option>
              <option value="inactive">নিষ্ক্রিয়</option>
            </select>
          </div>

          <div className="filter-right">
            {(filterClass || filterSection || filterStatus || searchTerm) && (
              <button className="btn-clear-filter" onClick={clearFilters}>
                <X size={14} /> ফিল্টার মুছুন
              </button>
            )}
            <button className="btn-refresh" onClick={fetchStudents} title="রিফ্রেশ">
              <RefreshCw size={15} />
            </button>
            <div className="view-toggle">
              <button
                className={`vt-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')} title="টেবিল ভিউ"
              >
                <List size={15} />
              </button>
              <button
                className={`vt-btn ${viewMode === 'card' ? 'active' : ''}`}
                onClick={() => setViewMode('card')} title="কার্ড ভিউ"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────── */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>শিক্ষার্থী লোড হচ্ছে...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="empty-state">
          <Users size={56} className="empty-state-icon" />
          <h3>কোনো শিক্ষার্থী পাওয়া যায়নি</h3>
          <p>ফিল্টার পরিবর্তন করুন বা নতুন শিক্ষার্থী যোগ করুন।</p>
          <button className="btn-primary" onClick={() => navigate('/dashboard/students/add')}>
            <Plus size={16} /> নতুন শিক্ষার্থী যোগ করুন
          </button>
        </div>
      ) : (
        <>
          {/* ── TABLE VIEW ── */}
          {viewMode === 'table' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ছবি</th>
                    <th>শিক্ষার্থী ID</th>
                    <th>নাম</th>
                    <th>শ্রেণি</th>
                    <th>শাখা</th>
                    <th>রোল</th>
                    <th>যোগাযোগ</th>
                    <th>স্ট্যাটাস</th>
                    <th>কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody>
                  {current.map(student => (
                    <tr key={student._id}>
                      <td>
                        <ProfileAvatar
                          image={student.userId?.profileImage}
                          name={student.userId?.name}
                          size={40}
                          className="student-photo"
                        />
                      </td>
                      <td>
                        <span className="student-id-badge">{student.studentId}</span>
                      </td>
                      <td className="student-name-cell">
                        <div className="student-name">{student.userId?.name}</div>
                        <div className="student-email">{student.userId?.email}</div>
                      </td>
                      <td>{student.class?.name || student.class}</td>
                      <td>{student.section || '—'}</td>
                      <td>{student.rollNumber || '—'}</td>
                      <td>{student.userId?.phone || '—'}</td>
                      <td>
                        <span className={`status-badge ${student.userId?.isActive ? 'active' : 'inactive'}`}>
                          {student.userId?.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon btn-view"
                            onClick={() => viewStudentDetails(student)} title="বিস্তারিত">
                            <Eye size={16} />
                          </button>
                          <button className="btn-icon btn-edit"
                            onClick={() => navigate(`/dashboard/students/edit/${student._id}`)} title="এডিট">
                            <Edit size={16} />
                          </button>
                          <button className="btn-icon btn-idcard-sm"
                            onClick={() => navigate('/dashboard/students/id-cards')} title="ID Card">
                            <CreditCard size={16} />
                          </button>
                          <button className="btn-icon btn-toggle"
                            onClick={() => handleToggleStatus(student._id)}
                            title={student.userId?.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}>
                            {student.userId?.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button className="btn-icon btn-delete"
                            onClick={() => handleDelete(student._id)} title="মুছুন">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── CARD VIEW ── */}
          {viewMode === 'card' && (
            <div className="students-card-grid">
              {current.map(student => (
                <div key={student._id} className={`student-grid-card ${student.userId?.isActive ? '' : 'inactive-card'}`}>
                  <div className="sgc-header">
                    <ProfileAvatar
                      image={student.userId?.profileImage}
                      name={student.userId?.name}
                      size={60}
                      className="sgc-photo"
                    />
                    <div className="sgc-info">
                      <div className="sgc-name">{student.userId?.name}</div>
                      <div className="sgc-id">{student.studentId}</div>
                      <span className={`status-badge ${student.userId?.isActive ? 'active' : 'inactive'}`}>
                        {student.userId?.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </div>
                  </div>
                  <div className="sgc-details">
                    <div className="sgc-row"><span>শ্রেণি:</span><span>{student.class?.name||student.class} - {student.section}</span></div>
                    <div className="sgc-row"><span>রোল:</span><span>{student.rollNumber||'—'}</span></div>
                    <div className="sgc-row"><span>মোবাইল:</span><span>{student.userId?.phone||'—'}</span></div>
                  </div>
                  <div className="sgc-actions">
                    <button className="btn-icon btn-view" onClick={() => viewStudentDetails(student)} title="বিস্তারিত"><Eye size={15}/></button>
                    <button className="btn-icon btn-edit" onClick={() => navigate(`/dashboard/students/edit/${student._id}`)} title="এডিট"><Edit size={15}/></button>
                    <button className="btn-icon btn-idcard-sm" onClick={() => navigate('/dashboard/students/id-cards')} title="ID Card"><CreditCard size={15}/></button>
                    <button className="btn-icon btn-toggle" onClick={() => handleToggleStatus(student._id)}>
                      {student.userId?.isActive ? <UserX size={15}/> : <UserCheck size={15}/>}
                    </button>
                    <button className="btn-icon btn-delete" onClick={() => handleDelete(student._id)} title="মুছুন"><Trash2 size={15}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {filteredStudents.length > studentsPerPage && (
            <div className="pagination-container">
              <div className="pagination-info">
                {indexOfFirst + 1} — {Math.min(indexOfLast, filteredStudents.length)} দেখাচ্ছে,
                মোট {filteredStudents.length} জন
              </div>
              <div className="pagination">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
                  <ChevronLeft size={18} /> আগের
                </button>
                <div className="pagination-numbers">
                  {getPageNums().map((n, i) => (
                    <button
                      key={i}
                      onClick={() => typeof n === 'number' && paginate(n)}
                      className={`pagination-number ${currentPage === n ? 'active' : ''} ${n === '...' ? 'dots' : ''}`}
                      disabled={n === '...'}
                    >{n}</button>
                  ))}
                </div>
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">
                  পরের <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Modal ────────────────────────────────── */}
      {showModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>শিক্ষার্থীর বিস্তারিত</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="student-detail-card">
                <ProfileAvatar
                  image={selectedStudent.userId?.profileImage}
                  name={selectedStudent.userId?.name}
                  size={100}
                  className="detail-photo"
                />
                <div className="detail-info">
                  {[
                    ['নাম',           selectedStudent.userId?.name],
                    ['শিক্ষার্থী ID',  selectedStudent.studentId],
                    ['ইমেইল',         selectedStudent.userId?.email],
                    ['ফোন',           selectedStudent.userId?.phone || '—'],
                    ['শ্রেণি',         `${selectedStudent.class?.name||selectedStudent.class} - ${selectedStudent.section}`],
                    ['রোল নম্বর',     selectedStudent.rollNumber],
                    ['রেজিঃ নম্বর',   selectedStudent.registrationNumber || '—'],
                    ['রক্তের গ্রুপ',   selectedStudent.bloodGroup || '—'],
                    ['পিতা/অভিভাবক', selectedStudent.guardianName || '—'],
                    ['অভিভাবক ফোন',  selectedStudent.guardianPhone || '—'],
                    ['ঠিকানা',        selectedStudent.userId?.address || '—'],
                    ['সেশন',          selectedStudent.session || '—'],
                  ].map(([lbl, val]) => (
                    <div className="info-row" key={lbl}>
                      <label>{lbl}:</label>
                      <span>{val}</span>
                    </div>
                  ))}
                  <div className="info-row">
                    <label>স্ট্যাটাস:</label>
                    <span className={selectedStudent.userId?.isActive ? 'status-active' : 'status-inactive'}>
                      {selectedStudent.userId?.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-primary" onClick={() => { setShowModal(false); navigate(`/dashboard/students/edit/${selectedStudent._id}`); }}>
                  <Edit size={16} /> তথ্য সম্পাদনা
                </button>
                <button className="btn-idcard" onClick={() => { setShowModal(false); navigate('/dashboard/students/id-cards'); }}>
                  <CreditCard size={16} /> ID Card তৈরি
                </button>
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
// import classService from '../services/classService';
// import toast from 'react-hot-toast';
// import ProfileAvatar from '../components/ProfileAvatar';
// import {
//   Users,
//   Plus,
//   Search,
//   Edit,
//   Trash2,
//   Eye,
//   Filter,
//   UserCheck,
//   UserX,
//   ChevronLeft,
//   ChevronRight
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

//   const [classes, setClasses] = useState([]);
//   const [sections, setSections] = useState([]);
//   const [loadingClasses, setLoadingClasses] = useState(true);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [studentsPerPage] = useState(20);

//   const navigate = useNavigate();

//   useEffect(() => { fetchClasses(); }, []);
//   useEffect(() => { fetchStudents(); }, [filterClass, filterSection]); // eslint-disable-line
//   useEffect(() => {
//     if (filterClass) updateSections(filterClass);
//     else { setSections([]); setFilterSection(''); }
//   }, [filterClass]); // eslint-disable-line
//   useEffect(() => { setCurrentPage(1); }, [searchTerm, filterClass, filterSection]);

//   const fetchClasses = async () => {
//     try {
//       setLoadingClasses(true);
//       const response = await classService.getAllClasses();
//       setClasses(response.data || []);
//     } catch (error) {
//       toast.error('Failed to fetch classes');
//     } finally {
//       setLoadingClasses(false);
//     }
//   };

//   const updateSections = (classId) => {
//     const selectedClass = classes.find(c => c._id === classId);
//     if (selectedClass) {
//       const sameName = classes.filter(c => c.name === selectedClass.name);
//       const uniqueSections = [...new Set(sameName.map(c => c.section))].sort();
//       setSections(uniqueSections);
//     } else {
//       setSections([]);
//     }
//   };

//   const fetchStudents = async () => {
//     try {
//       setLoading(true);
//       const params = {};
//       if (filterClass) {
//         const selectedClass = classes.find(c => c._id === filterClass);
//         if (selectedClass) params.class = selectedClass.name;
//       }
//       if (filterSection) params.section = filterSection;

//       const data = await studentService.getAllStudents(params);
//       setStudents(data.data || []);
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

//   const filteredStudents = students.filter(student => {
//     const searchLower = searchTerm.toLowerCase();
//     return (
//       student.userId?.name?.toLowerCase().includes(searchLower) ||
//       student.studentId?.toLowerCase().includes(searchLower) ||
//       student.userId?.email?.toLowerCase().includes(searchLower)
//     );
//   });

//   const indexOfLastStudent = currentPage * studentsPerPage;
//   const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
//   const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
//   const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

//   const paginate = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxPagesToShow = 5;
//     if (totalPages <= maxPagesToShow) {
//       for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
//     } else {
//       if (currentPage <= 3) {
//         for (let i = 1; i <= 4; i++) pageNumbers.push(i);
//         pageNumbers.push('...');
//         pageNumbers.push(totalPages);
//       } else if (currentPage >= totalPages - 2) {
//         pageNumbers.push(1);
//         pageNumbers.push('...');
//         for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
//       } else {
//         pageNumbers.push(1);
//         pageNumbers.push('...');
//         for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
//         pageNumbers.push('...');
//         pageNumbers.push(totalPages);
//       }
//     }
//     return pageNumbers;
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
//               placeholder="Search by name, ID or email..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <button type="submit" className="btn-search">Search</button>
//         </form>

//         <div className="filter-group">
//           <Filter size={20} />
//           <select
//             value={filterClass}
//             onChange={(e) => setFilterClass(e.target.value)}
//             disabled={loadingClasses}
//           >
//             <option value="">{loadingClasses ? 'Loading...' : 'All Classes'}</option>
//             {classes.map((cls) => (
//               <option key={cls._id} value={cls._id}>{cls.name}</option>
//             ))}
//           </select>

//           <select
//             value={filterSection}
//             onChange={(e) => setFilterSection(e.target.value)}
//             disabled={!filterClass || sections.length === 0}
//           >
//             <option value="">{!filterClass ? 'Select class first' : 'All Sections'}</option>
//             {sections.map((section) => (
//               <option key={section} value={section}>Section {section}</option>
//             ))}
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
//               <h3>{filteredStudents.length}</h3>
//               <p>Total Students</p>
//             </div>
//             <div className="stat-item">
//               <h3>{filteredStudents.filter(s => s.userId?.isActive).length}</h3>
//               <p>Active</p>
//             </div>
//             <div className="stat-item">
//               <h3>{filteredStudents.filter(s => !s.userId?.isActive).length}</h3>
//               <p>Inactive</p>
//             </div>
//           </div>

//           {/* ── Desktop Table ── */}
//           <div className="table-container desktop-view">
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
//                 {currentStudents.length === 0 ? (
//                   <tr>
//                     <td colSpan="9" className="no-data">No students found</td>
//                   </tr>
//                 ) : (
//                   currentStudents.map((student) => (
//                     <tr key={student._id}>
//                       <td>
//                         {/* ✅ ProfileAvatar — image থাকলে দেখাবে, না থাকলে নামের initial */}
//                         <ProfileAvatar
//                           image={student.userId?.profileImage}
//                           name={student.userId?.name}
//                           size={40}
//                           className="student-photo"
//                         />
//                       </td>
//                       <td>{student.studentId}</td>
//                       <td className="student-name">{student.userId?.name}</td>
//                       <td>{student.class?.name || student.class}</td>
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

//           {/* ── Mobile Cards ── */}
//           <div className="mobile-view">
//             {currentStudents.length === 0 ? (
//               <div className="no-data">No students found</div>
//             ) : (
//               currentStudents.map((student) => (
//                 <div key={student._id} className="student-card">
//                   <div className="student-card-header">
//                     <ProfileAvatar
//                       image={student.userId?.profileImage}
//                       name={student.userId?.name}
//                       size={60}
//                       className="student-card-photo"
//                     />
//                     <div className="student-card-info">
//                       <h3>{student.userId?.name}</h3>
//                       <p className="student-id">{student.studentId}</p>
//                       <span className={`status-badge ${student.userId?.isActive ? 'active' : 'inactive'}`}>
//                         {student.userId?.isActive ? 'Active' : 'Inactive'}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="student-card-details">
//                     <div className="detail-row">
//                       <span className="label">Class:</span>
//                       <span className="value">{student.class?.name || student.class} - {student.section}</span>
//                     </div>
//                     <div className="detail-row">
//                       <span className="label">Roll:</span>
//                       <span className="value">{student.rollNumber}</span>
//                     </div>
//                     <div className="detail-row">
//                       <span className="label">Contact:</span>
//                       <span className="value">{student.userId?.phone || 'N/A'}</span>
//                     </div>
//                   </div>

//                   <div className="student-card-actions">
//                     <button className="btn-icon btn-view" onClick={() => viewStudentDetails(student)} title="View">
//                       <Eye size={18} />
//                     </button>
//                     <button className="btn-icon btn-edit" onClick={() => navigate(`/dashboard/students/edit/${student._id}`)} title="Edit">
//                       <Edit size={18} />
//                     </button>
//                     <button className="btn-icon btn-toggle" onClick={() => handleToggleStatus(student._id)} title="Toggle">
//                       {student.userId?.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
//                     </button>
//                     <button className="btn-icon btn-delete" onClick={() => handleDelete(student._id)} title="Delete">
//                       <Trash2 size={18} />
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>

//           {/* ── Pagination ── */}
//           {filteredStudents.length > studentsPerPage && (
//             <div className="pagination-container">
//               <div className="pagination-info">
//                 Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length} students
//               </div>
//               <div className="pagination">
//                 <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
//                   <ChevronLeft size={20} /> Previous
//                 </button>
//                 <div className="pagination-numbers">
//                   {getPageNumbers().map((number, index) => (
//                     <button
//                       key={index}
//                       onClick={() => typeof number === 'number' && paginate(number)}
//                       className={`pagination-number ${currentPage === number ? 'active' : ''} ${number === '...' ? 'dots' : ''}`}
//                       disabled={number === '...'}
//                     >
//                       {number}
//                     </button>
//                   ))}
//                 </div>
//                 <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">
//                   Next <ChevronRight size={20} />
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* ── Student Details Modal ── */}
//       {showModal && selectedStudent && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>Student Details</h2>
//               <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
//             </div>
//             <div className="modal-body">
//               <div className="student-detail-card">
//                 {/* ✅ Modal এও ProfileAvatar */}
//                 <ProfileAvatar
//                   image={selectedStudent.userId?.profileImage}
//                   name={selectedStudent.userId?.name}
//                   size={100}
//                   className="detail-photo"
//                 />
//                 <div className="detail-info">
//                   <div className="info-row"><label>Name:</label><span>{selectedStudent.userId?.name}</span></div>
//                   <div className="info-row"><label>Student ID:</label><span>{selectedStudent.studentId}</span></div>
//                   <div className="info-row"><label>Email:</label><span>{selectedStudent.userId?.email}</span></div>
//                   <div className="info-row"><label>Phone:</label><span>{selectedStudent.userId?.phone || 'N/A'}</span></div>
//                   <div className="info-row">
//                     <label>Class:</label>
//                     <span>{selectedStudent.class?.name || selectedStudent.class} - Section {selectedStudent.section}</span>
//                   </div>
//                   <div className="info-row"><label>Roll Number:</label><span>{selectedStudent.rollNumber}</span></div>
//                   <div className="info-row"><label>Blood Group:</label><span>{selectedStudent.bloodGroup || 'N/A'}</span></div>
//                   <div className="info-row"><label>Guardian Name:</label><span>{selectedStudent.guardianName}</span></div>
//                   <div className="info-row"><label>Guardian Phone:</label><span>{selectedStudent.guardianPhone}</span></div>
//                   <div className="info-row"><label>Address:</label><span>{selectedStudent.userId?.address || 'N/A'}</span></div>
//                   <div className="info-row">
//                     <label>Status:</label>
//                     <span className={selectedStudent.userId?.isActive ? 'status-active' : 'status-inactive'}>
//                       {selectedStudent.userId?.isActive ? 'Active' : 'Inactive'}
//                     </span>
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