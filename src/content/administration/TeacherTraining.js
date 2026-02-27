import React, { useState, useEffect } from 'react';
import { Phone, Calendar, MapPin, User, Clock, Users, DollarSign, BookOpen } from 'lucide-react';
import PublicHeader from '../../components/PublicHeader';
import PublicFooter from '../../components/PublicFooter';
import SkeletonLoader from '../../components/SkeletonLoader';
import teacherTrainingService from '../../services/teacherTrainingService';
import axios from 'axios';
import './TeacherTraining.css';

const TeacherTraining = () => {
  const [trainings, setTrainings] = useState([]);
  const [settings, setSettings]   = useState({});
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const settingsRes = await axios.get(
        'https://malkhanagarcollege.onrender.com/api/public/home'
      );
      setSettings(settingsRes.data.data?.websiteSettings || {});

      const trainingsRes = await teacherTrainingService.getAllTrainings();
      const list = trainingsRes.data?.data || trainingsRes.data || [];
      setTrainings(list);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    upcoming:  { color: '#3b82f6', bg: '#eff6ff', label: 'আসন্ন',   emoji: '⏳' },
    ongoing:   { color: '#f59e0b', bg: '#fffbeb', label: 'চলমান',   emoji: '🔄' },
    completed: { color: '#10b981', bg: '#ecfdf5', label: 'সম্পন্ন', emoji: '✅' },
    cancelled: { color: '#ef4444', bg: '#fef2f2', label: 'বাতিল',   emoji: '❌' },
  };

  const getStatus = (s) =>
    statusConfig[s] || { color: '#6b7280', bg: '#f9fafb', label: s, emoji: '' };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('bn-BD', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch { return d; }
  };

  const filtered = filter === 'all'
    ? trainings
    : trainings.filter(t => t.status === filter);

  const counts = {
    all:       trainings.length,
    upcoming:  trainings.filter(t => t.status === 'upcoming').length,
    ongoing:   trainings.filter(t => t.status === 'ongoing').length,
    completed: trainings.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="teacher-training-page">
      <PublicHeader settings={settings} currentPath="/administration/teacher-training" />

      <div className="page-container">

        {/* Header */}
        <div className="page-header-section">
          <h1>শিক্ষক প্রশিক্ষণ কার্যক্রম</h1>
          <p>শিক্ষকদের পেশাদার উন্নয়নের জন্য বিশেষ প্রশিক্ষণ প্রোগ্রাম</p>
        </div>

        {/* Filter Tabs */}
        {/* <div className="training-filter-tabs">
          {[
            { key: 'all',       label: 'সকল',     count: counts.all },
            { key: 'upcoming',  label: 'আসন্ন',   count: counts.upcoming },
            { key: 'ongoing',   label: 'চলমান',   count: counts.ongoing },
            { key: 'completed', label: 'সম্পন্ন', count: counts.completed },
          ].map(tab => (
            <button
              key={tab.key}
              className={`filter-tab${filter === tab.key ? ' active' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div> */}

        {/* Cards */}
        {loading ? (
          <div className="trainings-grid">
            <SkeletonLoader type="card" count={3} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="no-data">
            <span>📚</span>
            <p>কোনো প্রশিক্ষণ কার্যক্রম পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="trainings-grid">
            {filtered.map((training) => {
              // const st = getStatus(training.status);
              return (
                <div key={training._id} className="training-card-public">

                  {/* Image */}
                  <div className="training-image-public">
                    {training.image?.url ? (
                      <img
                        src={training.image.url}
                        alt={training.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.querySelector('.training-image-placeholder').style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="training-image-placeholder"
                      style={{ display: training.image?.url ? 'none' : 'flex' }}
                    >
                      <span>🎓</span>
                    </div>

                    {/* <span className="training-status-badge" style={{ background: st.color }}>
                      {st.emoji} {st.label}
                    </span> */}

                    {training.trainingType && (
                      <span className="training-type-overlay">{training.trainingType}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="training-content-public">
                    <h3>{training.name}</h3>

                    {training.description && (
                      <p className="training-description">{training.description}</p>
                    )}

                    <div className="training-details-grid">

                      {training.trainer && (
                        <div className="training-detail-item">
                          <div className="detail-icon" style={{ background: '#eff6ff' }}>
                            <User size={15} color="#3b82f6" />
                          </div>
                          <div>
                            <strong>প্রশিক্ষক</strong>
                            <span>{training.trainer}</span>
                          </div>
                        </div>
                      )}

                      {(training.startDate || training.endDate) && (
                        <div className="training-detail-item">
                          <div className="detail-icon" style={{ background: '#f0fdf4' }}>
                            <Calendar size={15} color="#10b981" />
                          </div>
                          <div>
                            <strong>তারিখ</strong>
                            <span>
                              {formatDate(training.startDate)}
                              {training.endDate && (
                                <> — {formatDate(training.endDate)}</>
                              )}
                            </span>
                          </div>
                        </div>
                      )}

                      {training.duration && (
                        <div className="training-detail-item">
                          <div className="detail-icon" style={{ background: '#fef9c3' }}>
                            <Clock size={15} color="#f59e0b" />
                          </div>
                          <div>
                            <strong>সময়কাল</strong>
                            <span>{training.duration}</span>
                          </div>
                        </div>
                      )}

                      {training.venue && (
                        <div className="training-detail-item">
                          <div className="detail-icon" style={{ background: '#fdf4ff' }}>
                            <MapPin size={15} color="#a855f7" />
                          </div>
                          <div>
                            <strong>স্থান</strong>
                            <span>{training.venue}</span>
                          </div>
                        </div>
                      )}

                      {training.totalSeats && (
                        <div className="training-detail-item">
                          <div className="detail-icon" style={{ background: '#fff7ed' }}>
                            <Users size={15} color="#f97316" />
                          </div>
                          <div>
                            <strong>আসন সংখ্যা</strong>
                            <span>{training.totalSeats} জন</span>
                          </div>
                        </div>
                      )}

                      {training.budget && (
                        <div className="training-detail-item">
                          <div className="detail-icon" style={{ background: '#f0fdf4' }}>
                            <DollarSign size={15} color="#10b981" />
                          </div>
                          <div>
                            <strong>বাজেট</strong>
                            <span>৳ {parseInt(training.budget).toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      {training.phone && (
                        <div className="training-detail-item">
                          <div className="detail-icon" style={{ background: '#eff6ff' }}>
                            <Phone size={15} color="#3b82f6" />
                          </div>
                          <div>
                            <strong>যোগাযোগ</strong>
                            <span>{training.phone}</span>
                          </div>
                        </div>
                      )}

                      {training.materials && (
                        <div className="training-detail-item full-width">
                          <div className="detail-icon" style={{ background: '#fdf4ff' }}>
                            <BookOpen size={15} color="#a855f7" />
                          </div>
                          <div>
                            <strong>প্রয়োজনীয় উপকরণ</strong>
                            <span>{training.materials}</span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
      <PublicFooter settings={settings} />
    </div>
  );
};

export default TeacherTraining;
