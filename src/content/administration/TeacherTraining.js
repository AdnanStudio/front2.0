import React, { useState, useEffect } from 'react';
import { Phone, Mail } from 'lucide-react';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import SkeletonLoader from '../../components/SkeletonLoader';
import teacherTrainingService from '../../services/teacherTrainingService';
import axios from 'axios';
import './TeacherTraining.css';

const TeacherTraining = () => {
  const [trainings, setTrainings] = useState([]);
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
        'https://backend-yfp1.onrender.com/api/public/home'
      );
      setSettings(settingsResponse.data.data?.websiteSettings || {});

      // Fetch trainings
      const trainingsResponse = await teacherTrainingService.getAllTrainings();
      setTrainings(trainingsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-training-page">
      <PublicHeader settings={settings} currentPath="/administration/teacher-training" />

      <div className="page-container">
        <div className="page-header-section">
          <h1>Teacher Training Programs</h1>
          <p>Our dedicated training programs for professional development</p>
        </div>

        {loading ? (
          <div className="trainings-grid">
            <SkeletonLoader type="card" count={3} />
          </div>
        ) : trainings.length === 0 ? (
          <div className="no-data">
            <p>No training programs available at the moment.</p>
          </div>
        ) : (
          <div className="trainings-grid">
            {trainings.map((training) => (
              <div key={training._id} className="training-card-public">
                <div className="training-image-public">
                  <img
                    src={training.image?.url || '/placeholder.png'}
                    alt={training.name}
                    onError={(e) => (e.target.src = '/placeholder.png')}
                  />
                </div>
                <div className="training-content-public">
                  <h3>{training.name}</h3>
                  <div className="training-contact">
                    <div className="contact-item">
                      <Phone size={16} />
                      <span>{training.phone}</span>
                    </div>
                  </div>
                  <p className="training-description">{training.description}</p>
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

export default TeacherTraining;