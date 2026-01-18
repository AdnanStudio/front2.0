import React, { useState, useEffect } from 'react';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import SkeletonLoader from '../../components/SkeletonLoader';
import clubService from '../../services/clubService';
import axios from 'axios';
import './ClubManagement.css';

const ClubManagementPublic = () => {
  const [members, setMembers] = useState([]);
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

      // Fetch club members
      const membersResponse = await clubService.getAllMembers();
      setMembers(membersResponse.data || []);
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
          <p>Meet our dedicated club members</p>
        </div>

        {loading ? (
          <div className="members-grid-public">
            <SkeletonLoader type="card" count={4} />
          </div>
        ) : members.length === 0 ? (
          <div className="no-data">
            <p>No club members available at the moment.</p>
          </div>
        ) : (
          <div className="members-grid-public">
            {members.map((member) => (
              <div key={member._id} className="member-card-public">
                <div className="member-image-public">
                  <img
                    src={member.image?.url || '/placeholder.png'}
                    alt={member.name}
                    onError={(e) => (e.target.src = '/placeholder.png')}
                  />
                </div>
                <div className="member-content-public">
                  <h3>{member.name}</h3>
                  <p>{member.description}</p>
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