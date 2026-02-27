import React, { useState, useEffect } from 'react';
import { Phone, Mail, Users, Shield, Award, Clock } from 'lucide-react';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import SkeletonLoader from '../../components/SkeletonLoader';
import governingBodyService from '../../services/governingBodyService';
import axios from 'axios';
import './AdministrationPages.css';

const GoverningBody = () => {
  const [members, setMembers] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch settings
      const settingsResponse = await axios.get(
        'https://malkhanagarcollege.onrender.com/api/public/home'
      );
      setSettings(settingsResponse.data.data?.websiteSettings || {});

      // Fetch governing body members
      const membersResponse = await governingBodyService.getAllMembers();
      setMembers(membersResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Separate president/secretary from regular members
  const president = members.find(m => m.role === 'সভাপতি');
  const secretary = members.find(m => m.role === 'সদস্য সচিব');
  const regularMembers = members.filter(m => m.role === 'সদস্য');

  if (loading) {
    return (
      <div className="content-page-wrapper">
        
        <div className="container">
          <SkeletonLoader type="title" />
          <SkeletonLoader type="text" count={8} />
        </div>
        <PublicFooter settings={settings} />
      </div>
    );
  }

  return (
    <div className="content-page-wrapper">
      
      <div className="container">
        <div className="page-header">
          <h1>Governing Body</h1>
          <div className="title-underline"></div>
          {/*
          <p className="page-subtitle">
            পরিচালনা পরিষদ সদস্যবৃন্দ
          </p>
           */}
        </div>

        <div className="content-body">
          
          <div className="governing-structure">
            {/* <h2>পরিচালনা পরিষদ সদস্যবৃন্দ</h2> */}

            {/* President Card */}
            {president && (
              <div className="member-card president-card">
                {/* <div className="member-badge">
                  <Shield size={32} />
                </div> */}
                <div className="member-image-container">
                  <img
                    src={president.image?.url || '/placeholder.png'}
                    alt={president.name}
                    onError={(e) => (e.target.src = '/placeholder.png')}
                  />
                </div>
                <div className="member-info">
                  <h3>{president.role}</h3>
                  <h4>{president.name}</h4>
                  <p className="designation">{president.designation}</p>
                  <p className="details">{president.description}</p>
                  {(president.email || president.phone) && (
                    <div className="member-contact">
                      {president.phone && (
                        <div className="contact-item">
                          <Phone size={16} />
                          <span>{president.phone}</span>
                        </div>
                      )}
                      {president.email && (
                        <div className="contact-item">
                          <Mail size={16} />
                          <span>{president.email}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Secretary Card */}
            {secretary && (
              <div className="member-card secretary-card">
                <div className="member-image-container">
                  <img
                    src={secretary.image?.url || '/placeholder.png'}
                    alt={secretary.name}
                    onError={(e) => (e.target.src = '/placeholder.png')}
                  />
                </div>
                <div className="member-info">
                  <div className="member-role">{secretary.role}</div>
                  <h4>{secretary.name}</h4>
                  <p className="member-name">{secretary.designation}</p>
                  <p className="member-description">{secretary.description}</p>
                  {(secretary.email || secretary.phone) && (
                    <div className="member-contact">
                      {secretary.phone && (
                        <div className="contact-item">
                          <Phone size={16} />
                          <span>{secretary.phone}</span>
                        </div>
                      )}
                      {secretary.email && (
                        <div className="contact-item">
                          <Mail size={16} />
                          <span>{secretary.email}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Regular Members Grid */}
            {regularMembers.length > 0 && (
              <div className="members-grid">
                {regularMembers.map((member) => (
                  <div key={member._id} className="member-card">
                    <div className="member-image-container">
                      <img
                        src={member.image?.url || '/placeholder.png'}
                        alt={member.name}
                        onError={(e) => (e.target.src = '/placeholder.png')}
                      />
                    </div>
                    <div className="member-role">{member.role}</div>
                    <h4>{member.name}</h4>
                    <p className="member-name">{member.designation}</p>
                    <p className="member-description">{member.description}</p>
                    {(member.email || member.phone) && (
                      <div className="member-contact">
                        {member.phone && (
                          <div className="contact-item">
                            <Phone size={14} />
                            <span>{member.phone}</span>
                          </div>
                        )}
                        {member.email && (
                          <div className="contact-item">
                            <Mail size={14} />
                            <span>{member.email}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {members.length === 0 && (
              <div className="no-data">
                <p>No governing body members available at the moment.</p>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default GoverningBody;
