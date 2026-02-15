import React, { useState, useEffect } from 'react';
import { Users, Award, Calendar } from 'lucide-react';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import SkeletonLoader from '../../components/SkeletonLoader';
import clubService from '../../services/clubService';
import axios from 'axios';
import './ClubManagement.css';

const ClubManagementPublic = () => {
  const [clubs, setClubs] = useState([]);
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

      // Fetch clubs
      const clubsResponse = await clubService.getAllMembers();
      setClubs(clubsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="club-management-public-page">
      <PublicHeader settings={settings} currentPath="/administration/club-management" />

      <div className="page-container">
        <div className="page-header-section">
          <h1>Club Management</h1>
          <p>Explore our vibrant student clubs and extracurricular activities</p>
        </div>

        {loading ? (
          <div className="clubs-grid-public">
            <SkeletonLoader type="card" count={4} />
          </div>
        ) : clubs.length === 0 ? (
          <div className="no-data">
            <p>No clubs available at the moment.</p>
          </div>
        ) : (
          <div className="clubs-grid-public">
            {clubs.map((club) => (
              <div key={club._id} className="club-card-public">
                <div className="club-image-public">
                  <img
                    src={club.image?.url || '/placeholder.png'}
                    alt={club.name}
                    onError={(e) => (e.target.src = '/placeholder.png')}
                  />
                  <span className="club-category-badge">
                    {club.category}
                  </span>
                </div>
                <div className="club-content-public">
                  <h3>{club.name}</h3>
                  <p className="club-description">{club.description}</p>

                  <div className="club-details">
                    {club.advisor && (
                      <div className="club-detail-item">
                        <Award size={16} />
                        <div>
                          <strong>Advisor:</strong>
                          <span>{club.advisor}</span>
                        </div>
                      </div>
                    )}

                    {club.president && (
                      <div className="club-detail-item">
                        <Users size={16} />
                        <div>
                          <strong>President:</strong>
                          <span>{club.president}</span>
                        </div>
                      </div>
                    )}

                    {club.members && (
                      <div className="club-detail-item">
                        <Users size={16} />
                        <div>
                          <strong>Total Members:</strong>
                          <span>{club.members} students</span>
                        </div>
                      </div>
                    )}

                    {club.meetingDay && (
                      <div className="club-detail-item">
                        <Calendar size={16} />
                        <div>
                          <strong>Meeting:</strong>
                          <span>{club.meetingDay}, {club.meetingTime}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {club.achievements && (
                    <div className="club-achievements">
                      <strong>Recent Achievement:</strong>
                      <p>{club.achievements}</p>
                    </div>
                  )}
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

export default ClubManagementPublic;
