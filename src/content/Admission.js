import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Upload, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap,
  FileText,
  Calendar,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import './ContentPages.css';

const Admission = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    admissionType: '',
    studentNameBangla: '',
    studentNameEnglish: '',
    fatherNameBangla: '',
    fatherNameEnglish: '',
    motherNameBangla: '',
    motherNameEnglish: '',
    dateOfBirth: '',
    gender: '',
    religion: '',
    nationality: 'Bangladeshi',
    bloodGroup: '',
    nidNumber: '',
    birthCertificateNumber: '',
    mobileNumber: '',
    guardianMobileNumber: '',
    email: '',
    presentAddress: {
      village: '',
      postOffice: '',
      upazila: '',
      district: ''
    },
    permanentAddress: {
      village: '',
      postOffice: '',
      upazila: '',
      district: ''
    },
    sscExamination: '',
    sscBoard: '',
    sscRoll: '',
    sscRegistration: '',
    sscPassingYear: '',
    sscGPA: '',
    sscInstitution: '',
    hscExamination: 'none',
    hscBoard: '',
    hscRoll: '',
    hscRegistration: '',
    hscPassingYear: '',
    hscGPA: '',
    hscInstitution: '',
    hscGroup: 'none',
    preferredGroup: '',
    preferredSubject: '',
    guardianName: '',
    guardianRelation: '',
    guardianOccupation: '',
    guardianIncome: ''
  });

  const [files, setFiles] = useState({
    profilePicture: null
  });

  const [filePreviews, setFilePreviews] = useState({});
  const [sameAddress, setSameAddress] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should not exceed 5MB');
        return;
      }

      setFiles(prev => ({
        ...prev,
        [name]: file
      }));

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews(prev => ({
            ...prev,
            [name]: reader.result
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSameAddressChange = (e) => {
    setSameAddress(e.target.checked);
    if (e.target.checked) {
      setFormData(prev => ({
        ...prev,
        permanentAddress: { ...prev.presentAddress }
      }));
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.admissionType) {
        toast.error('Please select admission type');
        return false;
      }
      if (!formData.studentNameBangla || !formData.studentNameEnglish) {
        toast.error('Please enter student name in both languages');
        return false;
      }
      if (!formData.fatherNameBangla || !formData.motherNameBangla) {
        toast.error('Please enter parent names');
        return false;
      }
      if (!formData.dateOfBirth || !formData.gender || !formData.religion) {
        toast.error('Please fill all required personal information');
        return false;
      }
      if (!formData.birthCertificateNumber) {
        toast.error('Birth certificate number is required');
        return false;
      }
    }

    if (step === 2) {
      if (!formData.mobileNumber || !formData.guardianMobileNumber) {
        toast.error('Mobile numbers are required');
        return false;
      }
      if (!formData.presentAddress.village || !formData.presentAddress.district) {
        toast.error('Please fill present address');
        return false;
      }
      if (!formData.permanentAddress.village || !formData.permanentAddress.district) {
        toast.error('Please fill permanent address');
        return false;
      }
    }

    if (step === 3) {
      if (!formData.sscExamination || !formData.sscBoard || !formData.sscRoll) {
        toast.error('Please fill SSC information');
        return false;
      }
      if (!formData.sscGPA || formData.sscGPA < 0 || formData.sscGPA > 5) {
        toast.error('Please enter valid SSC GPA (0-5)');
        return false;
      }

      // Validate HSC for Honours/Degree
      if (formData.admissionType !== 'inter_first_year') {
        if (!formData.hscExamination || formData.hscExamination === 'none') {
          toast.error('HSC information is required for Honours/Degree admission');
          return false;
        }
        if (!formData.hscGPA || formData.hscGPA < 0 || formData.hscGPA > 5) {
          toast.error('Please enter valid HSC GPA (0-5)');
          return false;
        }
      }

      // Validate group selection for Inter
      if (formData.admissionType === 'inter_first_year' && !formData.preferredGroup) {
        toast.error('Please select preferred group');
        return false;
      }

      // Validate subject selection for Honours
      if (formData.admissionType === 'honours_first_year' && !formData.preferredSubject) {
        toast.error('Please select preferred subject');
        return false;
      }
    }

    if (step === 4) {
      if (!formData.guardianName || !formData.guardianRelation) {
        toast.error('Please fill guardian information');
        return false;
      }
    }

    if (step === 5) {
      if (!files.profilePicture) {
        toast.error('Profile picture is required');
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) return;

    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append('data', JSON.stringify(formData));

      // Append files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });

      const response = await axios.post('https://backend-yfp1.onrender.com/api/admissions', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('ভর্তি আবেদন সফলভাবে জমা দেওয়া হয়েছে! Registration Number: ' + response.data.data.registrationNumber);
      
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Admission submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit admission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admission-form-page">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="admission-header">
        <h1>Online Admission Form</h1>
        <p>MALKHANAGAR COLLEGE</p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Personal Info</div>
        </div>
        <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Contact & Address</div>
        </div>
        <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Academic Info</div>
        </div>
        <div className={`progress-line ${step >= 4 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">Guardian Info</div>
        </div>
        <div className={`progress-line ${step >= 5 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 5 ? 'active' : ''}`}>
          <div className="step-number">5</div>
          <div className="step-label">Documents</div>
        </div>
      </div>

      {/* Form Container */}
      <div className="admission-form-container">
        <form onSubmit={handleSubmit}>
          
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="form-step">
              <h2><User size={24} /> Personal Information</h2>

              <div className="form-group">
                <label>Admission Type *</label>
                <select
                  name="admissionType"
                  value={formData.admissionType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Admission Type</option>
                  <option value="inter_first_year">Inter 1st Year (HSC)</option>
                  <option value="honours_first_year">Honours 1st Year</option>
                  <option value="degree_first_year">Degree 1st Year</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Student Name (Bangla) *</label>
                  <input
                    type="text"
                    name="studentNameBangla"
                    value={formData.studentNameBangla}
                    onChange={handleChange}
                    placeholder="শিক্ষার্থীর নাম"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Student Name (English) *</label>
                  <input
                    type="text"
                    name="studentNameEnglish"
                    value={formData.studentNameEnglish}
                    onChange={handleChange}
                    placeholder="Student Name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Father's Name (Bangla) *</label>
                  <input
                    type="text"
                    name="fatherNameBangla"
                    value={formData.fatherNameBangla}
                    onChange={handleChange}
                    placeholder="পিতার নাম"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Father's Name (English) *</label>
                  <input
                    type="text"
                    name="fatherNameEnglish"
                    value={formData.fatherNameEnglish}
                    onChange={handleChange}
                    placeholder="Father's Name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mother's Name (Bangla) *</label>
                  <input
                    type="text"
                    name="motherNameBangla"
                    value={formData.motherNameBangla}
                    onChange={handleChange}
                    placeholder="মাতার নাম"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mother's Name (English) *</label>
                  <input
                    type="text"
                    name="motherNameEnglish"
                    value={formData.motherNameEnglish}
                    onChange={handleChange}
                    placeholder="Mother's Name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Religion *</label>
                  <select
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Religion</option>
                    <option value="islam">Islam</option>
                    <option value="hinduism">Hinduism</option>
                    <option value="buddhism">Buddhism</option>
                    <option value="christianity">Christianity</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                  >
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nationality *</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Birth Certificate Number *</label>
                  <input
                    type="text"
                    name="birthCertificateNumber"
                    value={formData.birthCertificateNumber}
                    onChange={handleChange}
                    placeholder="17 digit number"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>NID Number (if applicable)</label>
                <input
                  type="text"
                  name="nidNumber"
                  value={formData.nidNumber}
                  onChange={handleChange}
                  placeholder="National ID Number"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-next" onClick={nextStep}>
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Contact & Address */}
          {step === 2 && (
            <div className="form-step">
              <h2><Phone size={24} /> Contact & Address Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Guardian Mobile Number *</label>
                  <input
                    type="tel"
                    name="guardianMobileNumber"
                    value={formData.guardianMobileNumber}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email (Optional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                />
              </div>

              <h3><MapPin size={20} /> Present Address</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Village/Area *</label>
                  <input
                    type="text"
                    name="presentAddress.village"
                    value={formData.presentAddress.village}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Post Office *</label>
                  <input
                    type="text"
                    name="presentAddress.postOffice"
                    value={formData.presentAddress.postOffice}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Upazila *</label>
                  <input
                    type="text"
                    name="presentAddress.upazila"
                    value={formData.presentAddress.upazila}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>District *</label>
                  <input
                    type="text"
                    name="presentAddress.district"
                    value={formData.presentAddress.district}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={sameAddress}
                    onChange={handleSameAddressChange}
                  />
                  Permanent address same as present address
                </label>
              </div>

              <h3><MapPin size={20} /> Permanent Address</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Village/Area *</label>
                  <input
                    type="text"
                    name="permanentAddress.village"
                    value={formData.permanentAddress.village}
                    onChange={handleChange}
                    disabled={sameAddress}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Post Office *</label>
                  <input
                    type="text"
                    name="permanentAddress.postOffice"
                    value={formData.permanentAddress.postOffice}
                    onChange={handleChange}
                    disabled={sameAddress}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Upazila *</label>
                  <input
                    type="text"
                    name="permanentAddress.upazila"
                    value={formData.permanentAddress.upazila}
                    onChange={handleChange}
                    disabled={sameAddress}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>District *</label>
                  <input
                    type="text"
                    name="permanentAddress.district"
                    value={formData.permanentAddress.district}
                    onChange={handleChange}
                    disabled={sameAddress}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-prev" onClick={prevStep}>
                  ← Previous
                </button>
                <button type="button" className="btn-next" onClick={nextStep}>
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Academic Information */}
          {step === 3 && (
            <div className="form-step">
              <h2><GraduationCap size={24} /> Academic Information</h2>

              <h3>SSC / Equivalent Information</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Examination *</label>
                  <select
                    name="sscExamination"
                    value={formData.sscExamination}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="ssc">SSC</option>
                    <option value="dakhil">Dakhil</option>
                    <option value="equivalent">Equivalent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Board *</label>
                  <input
                    type="text"
                    name="sscBoard"
                    value={formData.sscBoard}
                    onChange={handleChange}
                    placeholder="e.g., Dhaka"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Roll Number *</label>
                  <input
                    type="text"
                    name="sscRoll"
                    value={formData.sscRoll}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Registration Number *</label>
                  <input
                    type="text"
                    name="sscRegistration"
                    value={formData.sscRegistration}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Passing Year *</label>
                  <input
                    type="text"
                    name="sscPassingYear"
                    value={formData.sscPassingYear}
                    onChange={handleChange}
                    placeholder="e.g., 2024"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>GPA *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="sscGPA"
                    value={formData.sscGPA}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Institution Name *</label>
                <input
                  type="text"
                  name="sscInstitution"
                  value={formData.sscInstitution}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* HSC Information for Honours/Degree */}
              {(formData.admissionType === 'honours_first_year' || formData.admissionType === 'degree_first_year') && (
                <>
                  <h3>HSC / Equivalent Information</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Examination *</label>
                      <select
                        name="hscExamination"
                        value={formData.hscExamination}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select</option>
                        <option value="hsc">HSC</option>
                        <option value="alim">Alim</option>
                        <option value="equivalent">Equivalent</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Board *</label>
                      <input
                        type="text"
                        name="hscBoard"
                        value={formData.hscBoard}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Roll Number *</label>
                      <input
                        type="text"
                        name="hscRoll"
                        value={formData.hscRoll}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Registration Number *</label>
                      <input
                        type="text"
                        name="hscRegistration"
                        value={formData.hscRegistration}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Passing Year *</label>
                      <input
                        type="text"
                        name="hscPassingYear"
                        value={formData.hscPassingYear}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>GPA *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="hscGPA"
                        value={formData.hscGPA}
                        onChange={handleChange}
                        min="0"
                        max="5"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Group *</label>
                      <select
                        name="hscGroup"
                        value={formData.hscGroup}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Group</option>
                        <option value="science">Science</option>
                        <option value="humanities">Humanities</option>
                        <option value="business_studies">Business Studies</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Institution Name *</label>
                      <input
                        type="text"
                        name="hscInstitution"
                        value={formData.hscInstitution}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Group Selection for Inter */}
              {formData.admissionType === 'inter_first_year' && (
                <div className="form-group">
                  <label>Preferred Group *</label>
                  <select
                    name="preferredGroup"
                    value={formData.preferredGroup}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Group</option>
                    <option value="science">Science</option>
                    <option value="humanities">Humanities</option>
                    <option value="business_studies">Business Studies</option>
                  </select>
                </div>
              )}

              {/* Subject Selection for Honours */}
              {formData.admissionType === 'honours_first_year' && (
                <div className="form-group">
                  <label>Preferred Subject *</label>
                  <select
                    name="preferredSubject"
                    value={formData.preferredSubject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="bangla">Bangla</option>
                    <option value="english">English</option>
                    <option value="history">History</option>
                    <option value="political_science">Political Science</option>
                    <option value="economics">Economics</option>
                    <option value="management">Management</option>
                    <option value="accounting">Accounting</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn-prev" onClick={prevStep}>
                  ← Previous
                </button>
                <button type="button" className="btn-next" onClick={nextStep}>
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Guardian Information */}
          {step === 4 && (
            <div className="form-step">
              <h2><User size={24} /> Guardian Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Guardian Name *</label>
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Relation with Student *</label>
                  <select
                    name="guardianRelation"
                    value={formData.guardianRelation}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Relation</option>
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="brother">Brother</option>
                    <option value="sister">Sister</option>
                    <option value="uncle">Uncle</option>
                    <option value="aunt">Aunt</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Guardian Occupation</label>
                  <input
                    type="text"
                    name="guardianOccupation"
                    value={formData.guardianOccupation}
                    onChange={handleChange}
                    placeholder="e.g., Teacher, Businessman"
                  />
                </div>

                <div className="form-group">
                  <label>Monthly Income</label>
                  <input
                    type="text"
                    name="guardianIncome"
                    value={formData.guardianIncome}
                    onChange={handleChange}
                    placeholder="e.g., 30000 BDT"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-prev" onClick={prevStep}>
                  ← Previous
                </button>
                <button type="button" className="btn-next" onClick={nextStep}>
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Documents Upload */}
          {step === 5 && (
            <div className="form-step">
              <h2><FileText size={24} /> Upload Documents</h2>

              {/* Instructions */}
              <div className="document-instructions">
                <h3>📋 Document Requirements</h3>
                <ul>
                  <li>✅ Recent Passport Size Photograph (Required)</li>
                  <li>📄 Original documents must be submitted to college office after admission</li>
                </ul>
                <p className="note">* Maximum file size: 5MB | Accepted formats: JPG, PNG</p>
              </div>

              <div className="upload-grid">
                {/* Profile Picture - ONLY THIS ONE */}
                <div className="upload-box">
                  <label>Profile Picture *</label>
                  <div className="file-upload-area">
                    {filePreviews.profilePicture ? (
                      <div className="file-preview">
                        <img src={filePreviews.profilePicture} alt="Profile" />
                        <button
                          type="button"
                          className="remove-file"
                          onClick={() => {
                            setFiles(prev => ({ ...prev, profilePicture: null }));
                            setFilePreviews(prev => ({ ...prev, profilePicture: null }));
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="upload-label">
                        <Upload size={40} />
                        <span>Click to upload</span>
                        <input
                          type="file"
                          name="profilePicture"
                          accept="image/*"
                          onChange={handleFileChange}
                          hidden
                        />
                      </label>
                    )}
                  </div>
                  <small>Max 5MB, JPG/PNG</small>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-prev" onClick={prevStep}>
                  ← Previous
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default Admission;