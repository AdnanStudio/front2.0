import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './Dashboard.css';

const TeacherListManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    teacherId: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    qualification: '',
    joiningDate: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    specialization: '',
    experience: '',
    salary: '',
    status: 'active',
    subjects: '',
    classes: ''
  });

  const departments = [
    'Bangla',
    'English',
    'Mathematics',
    'Science',
    'Social Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Physical Education',
    'Arts',
    'Music',
    'Islamic Studies',
    'General'
  ];

  const designations = [
    'Principal',
    'Vice Principal',
    'Head Teacher',
    'Senior Teacher',
    'Assistant Teacher',
    'Junior Teacher',
    'Physical Education Teacher',
    'Lab Assistant',
    'Librarian',
    'Other'
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const statuses = ['active', 'on-leave', 'resigned', 'retired'];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = () => {
    // Mock data - Replace with API call
    const mockTeachers = [
      {
        _id: '1',
        name: 'Dr. Kamal Hossain',
        teacherId: 'T001',
        email: 'kamal@school.com',
        phone: '01711223344',
        department: 'Science',
        designation: 'Head Teacher',
        qualification: 'PhD in Physics',
        joiningDate: '2015-01-10',
        dateOfBirth: '1980-05-15',
        gender: 'Male',
        address: 'Dhaka, Bangladesh',
        emergencyContact: '01811223344',
        bloodGroup: 'B+',
        specialization: 'Physics, Mathematics',
        experience: '15 years',
        salary: '65000',
        status: 'active',
        subjects: 'Physics, General Science',
        classes: 'Class 9, Class 10'
      },
      {
        _id: '2',
        name: 'Ms. Ayesha Rahman',
        teacherId: 'T002',
        email: 'ayesha@school.com',
        phone: '01722334455',
        department: 'English',
        designation: 'Senior Teacher',
        qualification: 'MA in English Literature',
        joiningDate: '2017-03-15',
        dateOfBirth: '1985-08-20',
        gender: 'Female',
        address: 'Chittagong, Bangladesh',
        emergencyContact: '01822334455',
        bloodGroup: 'A+',
        specialization: 'English Literature, Grammar',
        experience: '10 years',
        salary: '55000',
        status: 'active',
        subjects: 'English',
        classes: 'Class 8, Class 9, Class 10'
      },
      {
        _id: '3',
        name: 'Mr. Habib Khan',
        teacherId: 'T003',
        email: 'habib@school.com',
        phone: '01733445566',
        department: 'Mathematics',
        designation: 'Assistant Teacher',
        qualification: 'BSc in Mathematics',
        joiningDate: '2020-06-01',
        dateOfBirth: '1990-12-10',
        gender: 'Male',
        address: 'Sylhet, Bangladesh',
        emergencyContact: '01833445566',
        bloodGroup: 'O+',
        specialization: 'Algebra, Geometry',
        experience: '5 years',
        salary: '45000',
        status: 'active',
        subjects: 'Mathematics',
        classes: 'Class 6, Class 7, Class 8'
      }
    ];
    
    setTeachers(mockTeachers);
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
      if (editingTeacher) {
        // Update existing teacher
        setTeachers(teachers.map(t => 
          t._id === editingTeacher._id 
            ? { ...formData, _id: t._id } 
            : t
        ));
        toast.success('Teacher updated successfully!');
      } else {
        // Add new teacher
        const newTeacher = {
          ...formData,
          _id: Date.now().toString()
        };
        setTeachers([...teachers, newTeacher]);
        toast.success('Teacher added successfully!');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving teacher:', error);
      toast.error('Failed to save teacher');
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData(teacher);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      setTeachers(teachers.filter(t => t._id !== id));
      toast.success('Teacher deleted successfully!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      teacherId: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      qualification: '',
      joiningDate: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      emergencyContact: '',
      bloodGroup: '',
      specialization: '',
      experience: '',
      salary: '',
      status: 'active',
      subjects: '',
      classes: ''
    });
    setEditingTeacher(null);
    setShowForm(false);
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacherId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.phone.includes(searchTerm);
    
    const matchesDepartment = filterDepartment === '' || teacher.department === filterDepartment;
    const matchesStatus = filterStatus === '' || teacher.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'on-leave':
        return '#f59e0b';
      case 'resigned':
        return '#ef4444';
      case 'retired':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>👨‍🏫 Teacher List Management</h2>
          <p>Comprehensive teacher database and information system</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Teacher'}
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '25px' }}>
        <div className="stat-card" style={{ background: '#dbeafe', borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ color: '#1e40af' }}>Total Teachers</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e3a8a' }}>{teachers.length}</p>
        </div>
        <div className="stat-card" style={{ background: '#d1fae5', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ color: '#065f46' }}>Active</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#064e3b' }}>
            {teachers.filter(t => t.status === 'active').length}
          </p>
        </div>
        <div className="stat-card" style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ color: '#92400e' }}>On Leave</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#78350f' }}>
            {teachers.filter(t => t.status === 'on-leave').length}
          </p>
        </div>
        <div className="stat-card" style={{ background: '#e5e7eb', borderLeft: '4px solid #6b7280' }}>
          <h3 style={{ color: '#374151' }}>Departments</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
            {[...new Set(teachers.map(t => t.department))].length}
          </p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3>{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h3>
          
          <form onSubmit={handleSubmit} className="form-grid">
            {/* Personal Information */}
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Dr. Kamal Hossain"
                required
              />
            </div>

            <div className="form-group">
              <label>Teacher ID *</label>
              <input
                type="text"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleInputChange}
                placeholder="e.g., T001"
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g., kamal@school.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g., 01711223344"
                required
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
              >
                <option value="">Select Blood Group</option>
                {bloodGroups.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Emergency Contact</label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                placeholder="e.g., 01811223344"
              />
            </div>

            {/* Professional Information */}
            <div className="form-group">
              <label>Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Designation *</label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Designation</option>
                {designations.map(des => (
                  <option key={des} value={des}>{des}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Qualification *</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                placeholder="e.g., PhD in Physics"
                required
              />
            </div>

            <div className="form-group">
              <label>Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                placeholder="e.g., Physics, Mathematics"
              />
            </div>

            <div className="form-group">
              <label>Experience</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="e.g., 15 years"
              />
            </div>

            <div className="form-group">
              <label>Joining Date *</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Salary (৳)</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="e.g., 65000"
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
                    {status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subjects Teaching</label>
              <input
                type="text"
                name="subjects"
                value={formData.subjects}
                onChange={handleInputChange}
                placeholder="e.g., Physics, General Science"
              />
            </div>

            <div className="form-group">
              <label>Classes Teaching</label>
              <input
                type="text"
                name="classes"
                value={formData.classes}
                onChange={handleInputChange}
                placeholder="e.g., Class 9, Class 10"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="2"
                placeholder="Full address..."
              ></textarea>
            </div>

            <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
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
            placeholder="Search by name, ID, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          {statuses.map(status => (
            <option key={status} value={status}>
              {status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Teachers Table */}
      <div className="table-container">
        {filteredTeachers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            <i className="fas fa-user-tie" style={{ fontSize: '48px', marginBottom: '15px' }}></i>
            <p>No teachers found</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Teacher ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Qualification</th>
                <th>Contact</th>
                <th>Experience</th>
                <th>Subjects</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map(teacher => (
                <tr key={teacher._id}>
                  <td><strong>{teacher.teacherId}</strong></td>
                  <td>
                    <strong>{teacher.name}</strong>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {teacher.gender} | {teacher.bloodGroup || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: '#e0e7ff',
                      color: '#4338ca'
                    }}>
                      {teacher.department}
                    </span>
                  </td>
                  <td>{teacher.designation}</td>
                  <td>{teacher.qualification}</td>
                  <td>
                    <div style={{ fontSize: '13px' }}>
                      <div>{teacher.phone}</div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>{teacher.email}</div>
                    </div>
                  </td>
                  <td>{teacher.experience}</td>
                  <td>
                    <div style={{ fontSize: '12px' }}>
                      <div><strong>Subjects:</strong> {teacher.subjects}</div>
                      <div style={{ color: '#6b7280' }}><strong>Classes:</strong> {teacher.classes}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: getStatusColor(teacher.status) + '20',
                      color: getStatusColor(teacher.status)
                    }}>
                      {teacher.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(teacher)}
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
                        onClick={() => handleDelete(teacher._id)}
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

export default TeacherListManagement;
