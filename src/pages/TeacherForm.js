import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import teacherService from '../services/teacherService';
import subjectService from '../services/subjectService';
import classService from '../services/classService';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import './TeacherForm.css';

const TeacherForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    employeeId: '',
    subjects: [],
    classes: [],
    sections: [],
    qualification: '',
    experience: '',
    salary: '',
    classTeacher: {
      class: '',
      section: ''
    }
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Dynamic dropdown data
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const availableSections = ['A', 'B', 'C', 'D', 'E'];

  useEffect(() => {
    fetchDropdownData();
    if (isEditMode) {
      fetchTeacherData();
    }
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      const [subjectsData, classesData] = await Promise.all([
        subjectService.getAllSubjects({ isActive: true }),
        classService.getAllClasses()
      ]);
      setAvailableSubjects(subjectsData.data || []);
      setAvailableClasses(classesData.data || []);
    } catch (error) {
      toast.error('Failed to load form data');
    }
  };

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getTeacher(id);
      const teacher = response.data;
      
      setFormData({
        name: teacher.userId?.name || '',
        email: teacher.userId?.email || '',
        password: '',
        phone: teacher.userId?.phone || '',
        address: teacher.userId?.address || '',
        dateOfBirth: teacher.userId?.dateOfBirth ? teacher.userId.dateOfBirth.split('T')[0] : '',
        employeeId: teacher.employeeId || '',
        subjects: teacher.subjects?.map(s => s._id) || [],
        classes: teacher.classes?.map(c => c._id) || [],
        sections: teacher.sections || [],
        qualification: teacher.qualification || '',
        experience: teacher.experience || '',
        salary: teacher.salary || '',
        classTeacher: {
          class: teacher.classTeacher?.class?._id || '',
          section: teacher.classTeacher?.section || ''
        }
      });
      
      setImagePreview(teacher.userId?.profileImage);
    } catch (error) {
      toast.error('Failed to fetch teacher data');
      navigate('/dashboard/teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'classTeacherClass' || name === 'classTeacherSection') {
      setFormData({
        ...formData,
        classTeacher: {
          ...formData.classTeacher,
          [name === 'classTeacherClass' ? 'class' : 'section']: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => {
      const currentArray = prev[name];
      if (currentArray.includes(value)) {
return { ...prev, [name]: currentArray.filter(item => item !== value) };
} else {
return { ...prev, [name]: [...currentArray, value] };
}
});
};
const handleImageChange = (e) => {
const file = e.target.files[0];
if (file) {
setProfileImage(file);
const reader = new FileReader();
reader.onloadend = () => {
setImagePreview(reader.result);
};
reader.readAsDataURL(file);
}
};
const handleSubmit = async (e) => {
e.preventDefault();
if (!formData.name || !formData.employeeId) {
  toast.error('Please fill in all required fields');
  return;
}

if (!isEditMode && !formData.email) {
  toast.error('Email is required');
  return;
}

if (!isEditMode && !formData.password) {
  toast.error('Password is required');
  return;
}

if (formData.subjects.length === 0) {
  toast.error('Please select at least one subject');
  return;
}

try {
  setLoading(true);
  
  const submitData = new FormData();
  
  // Basic fields
  submitData.append('name', formData.name);
  if (!isEditMode) {
    submitData.append('email', formData.email);
    submitData.append('password', formData.password);
  }
  submitData.append('phone', formData.phone);
  submitData.append('address', formData.address);
  submitData.append('dateOfBirth', formData.dateOfBirth);
  submitData.append('employeeId', formData.employeeId);
  submitData.append('qualification', formData.qualification);
  submitData.append('experience', formData.experience || 0);
  submitData.append('salary', formData.salary);
  
  // Arrays as JSON
  submitData.append('subjects', JSON.stringify(formData.subjects));
  submitData.append('classes', JSON.stringify(formData.classes));
  submitData.append('sections', JSON.stringify(formData.sections));
  
  // Class Teacher info
  if (formData.classTeacher.class) {
    submitData.append('classTeacher', JSON.stringify(formData.classTeacher));
  }
  
  // Profile image
  if (profileImage) {
    submitData.append('profileImage', profileImage);
  }

  if (isEditMode) {
    await teacherService.updateTeacher(id, submitData);
    toast.success('Teacher updated successfully!');
  } else {
    await teacherService.createTeacher(submitData);
    toast.success('Teacher added successfully!');
  }
  
  navigate('/dashboard/teachers');
} catch (error) {
  toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'add'} teacher`);
} finally {
  setLoading(false);
}
};
if (loading && isEditMode) {
return (
<div className="loading-container">
<div className="spinner"></div>
<p>Loading teacher data...</p>
</div>
);
}
return (
<div className="teacher-form-page">
<div className="form-header">
<button className="back-btn" onClick={() => navigate('/dashboard/teachers')}>
<ArrowLeft size={20} />
Back to Teachers
</button>
<h1>{isEditMode ? 'Edit Teacher' : 'Add New Teacher'}</h1>
</div>
  <form onSubmit={handleSubmit} className="teacher-form">
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
          Choose Image
        </label>
      </div>
    </div>

    {/* Personal Information */}
    <div className="form-section">
      <h3>Personal Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Full Name *</label>
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
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            required={!isEditMode}
            disabled={isEditMode}
          />
        </div>

        {!isEditMode && (
          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
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

    {/* Professional Information */}
    <div className="form-section">
      <h3>Professional Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Employee ID *</label>
          <input
            type="text"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            placeholder="e.g., TCH001"
            required
            disabled={isEditMode}
          />
        </div>

        <div className="form-group">
          <label>Qualification *</label>
          <input
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            placeholder="e.g., M.Sc in Mathematics"
            required
          />
        </div>

        <div className="form-group">
          <label>Experience (Years)</label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="Enter years of experience"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Salary *</label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            placeholder="Enter monthly salary"
            required
          />
        </div>

        {/* Dynamic Subjects */}
        <div className="form-group full-width">
          <label>Subjects * (Select multiple)</label>
          <div className="multi-select-grid">
            {availableSubjects.map((subject) => (
              <label key={subject._id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.subjects.includes(subject._id)}
                  onChange={() => handleMultiSelect('subjects', subject._id)}
                />
                <span>{subject.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Dynamic Classes */}
        <div className="form-group full-width">
          <label>Classes (Select multiple)</label>
          <div className="multi-select-grid">
            {availableClasses.map((cls) => (
              <label key={cls._id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.classes.includes(cls._id)}
                  onChange={() => handleMultiSelect('classes', cls._id)}
                />
                <span>{cls.name} - {cls.section}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Dynamic Sections */}
        <div className="form-group full-width">
          <label>Sections</label>
          <div className="multi-select-grid">
            {availableSections.map((section) => (
              <label key={section} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.sections.includes(section)}
                  onChange={() => handleMultiSelect('sections', section)}
                />
                <span>Section {section}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Class Teacher Assignment */}
    <div className="form-section">
      <h3>Class Teacher Assignment (Optional)</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Class</label>
          <select
            name="classTeacherClass"
            value={formData.classTeacher.class}
            onChange={handleChange}
          >
            <option value="">Select Class</option>
            {availableClasses.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} - {cls.section}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Section</label>
          <select
            name="classTeacherSection"
            value={formData.classTeacher.section}
            onChange={handleChange}
          >
            <option value="">Select Section</option>
            {availableSections.map((section) => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </div>
      </div>
    </div>

    {/* Submit Buttons */}
    <div className="form-actions">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => navigate('/dashboard/teachers')}
      >
        Cancel
      </button>
      <button type="submit" className="btn-primary" disabled={loading}>
        <Save size={20} />
        {loading ? 'Saving...' : isEditMode ? 'Update Teacher' : 'Save Teacher'}
      </button>
    </div>
  </form>
</div>
);
};
export default TeacherForm;