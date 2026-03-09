import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import teacherService from '../services/teacherService';
import subjectService from '../services/subjectService';
import classService from '../services/classService';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import './TeacherForm.css';

// ── Salary Grade Options: Grade-1 to Grade-20 + Others ───────────────────────
const SALARY_GRADES = [
  { value: 'grade-1',  label: 'Grade-1'  },
  { value: 'grade-2',  label: 'Grade-2'  },
  { value: 'grade-3',  label: 'Grade-3'  },
  { value: 'grade-4',  label: 'Grade-4'  },
  { value: 'grade-5',  label: 'Grade-5'  },
  { value: 'grade-6',  label: 'Grade-6'  },
  { value: 'grade-7',  label: 'Grade-7'  },
  { value: 'grade-8',  label: 'Grade-8'  },
  { value: 'grade-9',  label: 'Grade-9'  },
  { value: 'grade-10', label: 'Grade-10' },
  { value: 'grade-11', label: 'Grade-11' },
  { value: 'grade-12', label: 'Grade-12' },
  { value: 'grade-13', label: 'Grade-13' },
  { value: 'grade-14', label: 'Grade-14' },
  { value: 'grade-15', label: 'Grade-15' },
  { value: 'grade-16', label: 'Grade-16' },
  { value: 'grade-17', label: 'Grade-17' },
  { value: 'grade-18', label: 'Grade-18' },
  { value: 'grade-19', label: 'Grade-19' },
  { value: 'grade-20', label: 'Grade-20' },
  { value: 'others',   label: 'Others'   },
];

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
    salaryGrade: '',
    classTeacher: { class: '', section: '' }
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const availableSections = ['A', 'B', 'C', 'D', 'E'];

  useEffect(() => {
    fetchDropdownData();
    if (isEditMode) fetchTeacherData();
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      const [subjectsData, classesData] = await Promise.all([
        subjectService.getAllSubjects({ isActive: true }),
        classService.getAllClasses()
      ]);
      setAvailableSubjects(subjectsData.data || []);
      setAvailableClasses(classesData.data || []);
    } catch {
      toast.error('Failed to load form data');
    }
  };

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getTeacher(id);
      const t = response.data;
      setFormData({
        name:          t.userId?.name || '',
        email:         t.userId?.email || '',
        password:      '',
        phone:         t.userId?.phone || '',
        address:       t.userId?.address || '',
        dateOfBirth:   t.userId?.dateOfBirth ? t.userId.dateOfBirth.split('T')[0] : '',
        employeeId:    t.employeeId || '',
        subjects:      t.subjects?.map(s => s._id) || [],
        classes:       t.classes?.map(c => c._id) || [],
        sections:      t.sections || [],
        qualification: t.qualification || '',
        experience:    t.experience || '',
        salaryGrade:   t.salaryGrade || '',
        classTeacher: {
          class:   t.classTeacher?.class?._id || '',
          section: t.classTeacher?.section || ''
        }
      });
      setImagePreview(t.userId?.profileImage);
    } catch {
      toast.error('Failed to fetch teacher data');
      navigate('/dashboard/teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'classTeacherClass' || name === 'classTeacherSection') {
      setFormData(prev => ({
        ...prev,
        classTeacher: {
          ...prev.classTeacher,
          [name === 'classTeacherClass' ? 'class' : 'section']: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => {
      const arr = prev[name];
      return {
        ...prev,
        [name]: arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value]
      };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.employeeId) { toast.error('Please fill in all required fields'); return; }
    if (!isEditMode && !formData.email)         { toast.error('Email is required'); return; }
    if (!isEditMode && !formData.password)      { toast.error('Password is required'); return; }
    if (formData.subjects.length === 0)         { toast.error('Please select at least one subject'); return; }
    if (!formData.salaryGrade)                  { toast.error('Please select a salary grade'); return; }

    try {
      setLoading(true);
      const submitData = new FormData();
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
      submitData.append('salaryGrade', formData.salaryGrade);
      submitData.append('subjects', JSON.stringify(formData.subjects));
      submitData.append('classes', JSON.stringify(formData.classes));
      submitData.append('sections', JSON.stringify(formData.sections));
      if (formData.classTeacher.class) {
        submitData.append('classTeacher', JSON.stringify(formData.classTeacher));
      }
      if (profileImage) submitData.append('profileImage', profileImage);

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
        <button className="btn-back" onClick={() => navigate('/dashboard/teachers')}>
          <ArrowLeft size={20} /> Back to Teachers
        </button>
        <h1>{isEditMode ? 'Edit Teacher' : 'Add New Teacher'}</h1>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ── Profile Picture ─────────────────────────────────── */}
        <div className="form-section">
          <h3>Profile Picture</h3>
          <div className="image-upload-container">
            <div className="image-preview">
              {imagePreview
                ? <img src={imagePreview} alt="Preview" />
                : <div className="placeholder"><Upload size={40} /><p>Upload Photo</p></div>}
            </div>
            <input type="file" accept="image/*" onChange={handleImageChange}
              id="profileImage" style={{ display: 'none' }} />
            <label htmlFor="profileImage" className="upload-btn">Choose Image</label>
          </div>
        </div>

        {/* ── Personal Information ─────────────────────────────── */}
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-grid">

            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="name" value={formData.name}
                onChange={handleChange} placeholder="Enter full name" required />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="Enter email"
                required={!isEditMode} disabled={isEditMode} />
            </div>

            {!isEditMode && (
              <div className="form-group">
                <label>Password *</label>
                <input type="password" name="password" value={formData.password}
                  onChange={handleChange} placeholder="Enter password" required />
              </div>
            )}

            <div className="form-group">
              <label>Phone</label>
              <input type="tel" name="phone" value={formData.phone}
                onChange={handleChange} placeholder="Enter phone number" />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth}
                onChange={handleChange} />
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <textarea name="address" value={formData.address}
                onChange={handleChange} placeholder="Enter full address" rows="3" />
            </div>

          </div>
        </div>

        {/* ── Professional Information ─────────────────────────── */}
        <div className="form-section">
          <h3>Professional Information</h3>
          <div className="form-grid">

            <div className="form-group">
              <label>Employee ID *</label>
              <input type="text" name="employeeId" value={formData.employeeId}
                onChange={handleChange} placeholder="e.g., TCH001"
                required disabled={isEditMode} />
            </div>

            <div className="form-group">
              <label>Qualification *</label>
              <input type="text" name="qualification" value={formData.qualification}
                onChange={handleChange} placeholder="e.g., M.Sc in Mathematics" required />
            </div>

            <div className="form-group">
              <label>Experience (Years)</label>
              <input type="number" name="experience" value={formData.experience}
                onChange={handleChange} placeholder="Years of experience" min="0" />
            </div>

            {/* ✅ Salary Grade Dropdown */}
            <div className="form-group">
              <label>Salary Grade *</label>
              <select
                name="salaryGrade"
                value={formData.salaryGrade}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Grade --</option>
                {SALARY_GRADES.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            {/* Subjects */}
            <div className="form-group full-width">
              <label>Subjects * (Select multiple)</label>
              <div className="multi-select-grid">
                {availableSubjects.map((subject) => (
                  <label key={subject._id} className="checkbox-label">
                    <input type="checkbox"
                      checked={formData.subjects.includes(subject._id)}
                      onChange={() => handleMultiSelect('subjects', subject._id)} />
                    <span>{subject.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Classes */}
            <div className="form-group full-width">
              <label>Classes (Select multiple)</label>
              <div className="multi-select-grid">
                {availableClasses.map((cls) => (
                  <label key={cls._id} className="checkbox-label">
                    <input type="checkbox"
                      checked={formData.classes.includes(cls._id)}
                      onChange={() => handleMultiSelect('classes', cls._id)} />
                    <span>{cls.name} - {cls.section}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div className="form-group full-width">
              <label>Sections</label>
              <div className="multi-select-grid">
                {availableSections.map((section) => (
                  <label key={section} className="checkbox-label">
                    <input type="checkbox"
                      checked={formData.sections.includes(section)}
                      onChange={() => handleMultiSelect('sections', section)} />
                    <span>Section {section}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Class Teacher Assignment ─────────────────────────── */}
        <div className="form-section">
          <h3>Class Teacher Assignment (Optional)</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Class</label>
              <select name="classTeacherClass"
                value={formData.classTeacher.class} onChange={handleChange}>
                <option value="">Select Class</option>
                {availableClasses.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name} - {cls.section}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Section</label>
              <select name="classTeacherSection"
                value={formData.classTeacher.section} onChange={handleChange}>
                <option value="">Select Section</option>
                {availableSections.map((section) => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Submit ───────────────────────────────────────────── */}
        <div className="form-actions">
          <button type="button" className="btn-secondary"
            onClick={() => navigate('/dashboard/teachers')}>
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