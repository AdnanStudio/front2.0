import React, { useState, useEffect } from 'react';
import { Phone, Mail, Calendar, MapPin, User, Clock } from 'lucide-react';
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
        'https://malkhanagarcollege.onrender.com/api/public/home'
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return '#3b82f6';
      case 'ongoing':
        return '#f59e0b';
      case 'completed':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="teacher-training-page">
      <PublicHeader settings={settings} currentPath="/administration/teacher-training" />

      <div className="page-container">
        <div className="page-header-section">
          <h1>Teacher Training Programs</h1>
          <p>Professional development programs for our dedicated teachers</p>
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
                  <span 
                    className="training-status-badge"
                    style={{ background: getStatusColor(training.status) }}
                  >
                    {training.status}
                  </span>
                </div>
                <div className="training-content-public">
                  <h3>{training.name}</h3>
                  <p className="training-type">{training.trainingType}</p>
                  <p className="training-description">{training.description}</p>

                  <div className="training-details-grid">
                    <div className="training-detail-item">
                      <User size={16} />
                      <div>
                        <strong>Trainer:</strong>
                        <span>{training.trainer}</span>
                      </div>
                    </div>

                    <div className="training-detail-item">
                      <Calendar size={16} />
                      <div>
                        <strong>Date:</strong>
                        <span>
                          {new Date(training.startDate).toLocaleDateString()} - {' '}
                          {new Date(training.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="training-detail-item">
                      <Clock size={16} />
                      <div>
                        <strong>Duration:</strong>
                        <span>{training.duration}</span>
                      </div>
                    </div>

                    <div className="training-detail-item">
                      <MapPin size={16} />
                      <div>
                        <strong>Venue:</strong>
                        <span>{training.venue}</span>
                      </div>
                    </div>

                    {training.phone && (
                      <div className="training-detail-item">
                        <Phone size={16} />
                        <div>
                          <strong>Contact:</strong>
                          <span>{training.phone}</span>
                        </div>
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

export default TeacherTraining;
