import React, { useState, useEffect } from 'react';
import { Phone, Mail, BookOpen, Award } from 'lucide-react';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import SkeletonLoader from '../../components/SkeletonLoader';
import teacherListService from '../../services/teacherListService';
import axios from 'axios';
import './Teachers.css';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch settings
      const settingsResponse = await axios.get(
        'https://malkhanagarcollege.onrender.com/api/public/home'
      );
      setSettings(settingsResponse.data.data?.websiteSettings || {});

      // Fetch teachers
      const teachersResponse = await teacherListService.getAllTeachers();
      setTeachers(teachersResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teachers-public-page">
      <PublicHeader settings={settings} currentPath="/administration/teachers" />

      <div className="page-container">
        <div className="page-header-section">
          <h1>Our Teachers</h1>
          <p>Meet our dedicated and qualified teaching staff</p>
        </div>

        {loading ? (
          <div className="teachers-grid-public">
            <SkeletonLoader type="card" count={6} />
          </div>
        ) : teachers.length === 0 ? (
          <div className="no-data">
            <p>No teachers available at the moment.</p>
          </div>
        ) : (
          <div className="teachers-grid-public">
            {teachers.map((teacher) => (
              <div key={teacher._id} className="teacher-card-public">
                <div className="teacher-image-wrapper">
                  <img
                    src={teacher.image?.url || '/placeholder.png'}
                    alt={teacher.name}
                    onError={(e) => (e.target.src = '/placeholder.png')}
                  />
                </div>
                <div className="teacher-info-public">
                  <h3>{teacher.name}</h3>
                  <p className="teacher-designation">{teacher.designation}</p>

                  {teacher.qualification && (
                    <div className="teacher-detail">
                      <Award size={16} />
                      <span>{teacher.qualification}</span>
                    </div>
                  )}

                  {teacher.subjects && teacher.subjects.length > 0 && (
                    <div className="teacher-detail">
                      <BookOpen size={16} />
                      <span>{teacher.subjects.join(', ')}</span>
                    </div>
                  )}

                  {teacher.experience && (
                    <div className="teacher-detail">
                      <span className="experience-badge">
                        {teacher.experience} Experience
                      </span>
                    </div>
                  )}

                  <div className="teacher-contact-info">
                    {teacher.phone && (
                      <div className="contact-detail">
                        <Phone size={14} />
                        <span>{teacher.phone}</span>
                      </div>
                    )}
                    {teacher.email && (
                      <div className="contact-detail">
                        <Mail size={14} />
                        <span>{teacher.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PublicFooter settings={settings} />
    </div>
  );
};

export default Teachers;