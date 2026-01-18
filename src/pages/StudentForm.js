import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import studentService from '../services/studentService';
import classService from '../services/classService';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Upload, Loader } from 'lucide-react';
import './StudentForm.css';

const StudentForm = () => {
  const { id } = useParams(); // Get student ID from URL (if editing)
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    studentId: '',
    class: '',
    section: '',
    rollNumber: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    bloodGroup: '',
    previousSchool: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);

  // Dynamic class and section data
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Fetch classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch student data if editing
  useEffect(() => {
    if (isEditMode) {
      fetchStudentData();
    }
  }, [id]);

  // Update sections when class changes
  useEffect(() => {
    if (formData.class) {
      updateSections(formData.class);
    } else {
      setSections([]);
    }
  }, [formData.class]);

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await classService.getAllClasses();
      setClasses(response.data || []);
    } catch (error) {
      toast.error('Failed to load classes');
      console.error('Fetch classes error:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchStudentData = async () => {
    try {
      setFetchingData(true);
      const response = await studentService.getStudent(id);
      const student = response.data;

      // Populate form with existing data
      setFormData({
        name: student.userId?.name || '',
        email: student.userId?.email || '',
        password: '', // Don't populate password
        phone: student.userId?.phone || '',
        address: student.userId?.address || '',
        dateOfBirth: student.userId?.dateOfBirth 
          ? new Date(student.userId.dateOfBirth).toISOString().split('T')[0] 
          : '',
        studentId: student.studentId || '',
        class: student.class?._id || student.class || '',
        section: student.section || '',
        rollNumber: student.rollNumber || '',
        guardianName: student.guardianName || '',
        guardianPhone: student.guardianPhone || '',
        guardianEmail: student.guardianEmail || '',
        bloodGroup: student.bloodGroup || '',
        previousSchool: student.previousSchool || ''
      });

      // Set existing profile image
      if (student.userId?.profileImage) {
        setImagePreview(student.userId.profileImage);
      }
    } catch (error) {
      toast.error('Failed to load student data');
      console.error('Fetch student error:', error);
      navigate('/dashboard/students');
    } finally {
      setFetchingData(false);
    }
  };

  const updateSections = (classId) => {
    const selectedClass = classes.find(c => c._id === classId);
    if (selectedClass) {
      // Extract unique sections
      const uniqueSections = [...new Set([selectedClass.section])];
      setSections(uniqueSections);
      
      // Auto-select section if only one exists
      if (uniqueSections.length === 1 && !formData.section) {
        setFormData(prev => ({ ...prev, section: uniqueSections[0] }));
      }
    } else {
      setSections([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Validate file type
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
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return false;
    }

    if (!isEditMode && !formData.password) {
      toast.error('Password is required for new students');
      return false;
    }

    if (!formData.studentId) {
      toast.error('Student ID is required');
      return false;
    }

    if (!formData.class || !formData.section) {
      toast.error('Class and section are required');
      return false;
    }

    if (!formData.rollNumber) {
      toast.error('Roll number is required');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'password' && isEditMode && !formData.password) {
          // Skip empty password in edit mode
          return;
        }
        submitData.append(key, formData[key]);
      });
      
      // Append image if selected
      if (profileImage) {
        submitData.append('profileImage', profileImage);
      }

      if (isEditMode) {
        await studentService.updateStudent(id, submitData);
        toast.success('Student updated successfully!');
      } else {
        await studentService.createStudent(submitData);
        toast.success('Student added successfully!');
      }

      navigate('/dashboard/students');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          `Failed to ${isEditMode ? 'update' : 'add'} student`;
      toast.error(errorMessage);
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="loading-container">
        <Loader className="spinner" size={48} />
        <p>Loading student data...</p>
      </div>
    );
  }

  return (
    <div className="student-form-page">
      <div className="form-header">
        <button className="back-btn" onClick={() => navigate('/dashboard/students')}>
          <ArrowLeft size={20} />
          Back to Students
        </button>
        <h1>{isEditMode ? 'Edit Student' : 'Add New Student'}</h1>
        <p className="subtitle">
          {isEditMode ? 'Update student information' : 'Fill in the details to add a new student'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="student-form">
        {/* Profile Image Upload */}
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

        {/* Personal Information */}
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
                disabled={isEditMode} // Email shouldn't change in edit mode
              />
            </div>

            {!isEditMode && (
              <div className="form-group">
                <label>Password <span className="required">*</span></label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required={!isEditMode}
                />
              </div>
            )}

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter full address"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="form-section">
          <h3>Academic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Student ID <span className="required">*</span></label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="e.g., STD001"
                required
                disabled={isEditMode} // Student ID shouldn't change
              />
            </div>

            <div className="form-group">
              <label>Class <span className="required">*</span></label>
              <select 
                name="class" 
                value={formData.class} 
                onChange={handleChange} 
                required
                disabled={loadingClasses}
              >
                <option value="">
                  {loadingClasses ? 'Loading classes...' : 'Select Class'}
                </option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Section <span className="required">*</span></label>
              <select 
                name="section" 
                value={formData.section} 
                onChange={handleChange} 
                required
                disabled={!formData.class || sections.length === 0}
              >
                <option value="">
                  {!formData.class ? 'Select class first' : 'Select Section'}
                </option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Roll Number <span className="required">*</span></label>
              <input
                type="number"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="Enter roll number"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Previous School</label>
              <input
                type="text"
                name="previousSchool"
                value={formData.previousSchool}
                onChange={handleChange}
                placeholder="Enter previous school name"
              />
            </div>
          </div>
        </div>

        {/* Guardian Information */}
        <div className="form-section">
          <h3>Guardian Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Guardian Name <span className="required">*</span></label>
              <input
                type="text"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                placeholder="Enter guardian name"
                required
              />
            </div>

            <div className="form-group">
              <label>Guardian Phone <span className="required">*</span></label>
              <input
                type="tel"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handleChange}
                placeholder="Enter guardian phone"
                required
              />
            </div>

            <div className="form-group">
              <label>Guardian Email</label>
              <input
                type="email"
                name="guardianEmail"
                value={formData.guardianEmail}
                onChange={handleChange}
                placeholder="Enter guardian email"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/dashboard/students')}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading || loadingClasses}>
            <Save size={20} />
            {loading ? 'Saving...' : isEditMode ? 'Update Student' : 'Save Student'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;