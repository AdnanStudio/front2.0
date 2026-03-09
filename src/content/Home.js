// FILE PATH: src/content/Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import LazyImage from '../components/LazyImage';
import SkeletonLoader from '../components/SkeletonLoader';
import noticeService from '../services/noticeService';
import {
  FileText, Download, Calendar, Bell,
  Image as ImageIcon, ExternalLink, ArrowRight, X, Clock,
} from 'lucide-react';
import './Home.css';

/* ── Cache ── */
const CACHE_DURATION = 365 * 24 * 60 * 60 * 1000;
const CACHE_KEYS = { HOME_DATA: 'home_data_cache', NOTICES: 'notices_cache' };
const cacheManager = {
  set: (key, data) => {
    try { localStorage.setItem(key, JSON.stringify({ data, expiresAt: Date.now() + CACHE_DURATION })); } catch {}
  },
  get: (key) => {
    try {
      const c = localStorage.getItem(key);
      if (!c) return null;
      const p = JSON.parse(c);
      if (Date.now() > p.expiresAt) { localStorage.removeItem(key); return null; }
      return p.data;
    } catch { return null; }
  },
  clearAll: () => { try { Object.values(CACHE_KEYS).forEach(k => localStorage.removeItem(k)); } catch {} },
};

/* ── Helpers ── */
const TYPE_CFG = {
  general:   { bg: '#e3f2fd', color: '#1565c0', label: 'General'   },
  urgent:    { bg: '#ffebee', color: '#c62828', label: 'Urgent'    },
  exam:      { bg: '#fff3e0', color: '#e65100', label: 'Exam'      },
  holiday:   { bg: '#f3e5f5', color: '#7b1fa2', label: 'Holiday'   },
  event:     { bg: '#e8f5e9', color: '#2e7d32', label: 'Event'     },
  admission: { bg: '#fce4ec', color: '#c2185b', label: 'Admission' },
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const isNew7 = (date) => (Date.now() - new Date(date)) / 86400000 < 7;

const wordLimit10 = (t = '') => {
  const w = t.trim().split(/\s+/);
  return w.length <= 10 ? t : w.slice(0, 10).join(' ') + '…';
};

const getDriveEmbed = (url = '') => {
  const m1 = url.match(/\/d\/([^/]+)/);
  if (m1) return `https://drive.google.com/file/d/${m1[1]}/preview`;
  const m2 = url.match(/[?&]id=([^&]+)/);
  if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
  return url;
};

/* ══════════════════════════════════════════
   NoticeModal — shared, also used by Notice.js
   via: import { NoticeModal } from '../content/Home';
══════════════════════════════════════════ */
export const NoticeModal = ({ notice, onClose }) => {
  const [downloading, setDl] = useState(false);
  const hasDrive = notice.driveLinks?.length > 0;
  const hasFiles = notice.attachments?.length > 0;
  const [tab, setTab] = useState(hasDrive ? 'drive' : hasFiles ? 'files' : 'info');
  const tc = TYPE_CFG[notice.type] || TYPE_CFG.general;

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleDl = async (att) => {
    try {
      setDl(true);
      const res = await fetch(att.fileUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = att.fileName || `notice.${att.fileType === 'pdf' ? 'pdf' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(att.fileUrl, '_blank');
    } finally {
      setDl(false);
    }
  };

  return (
    <div
      className="nm-overlay"
      onClick={(e) => e.target.classList.contains('nm-overlay') && onClose()}
    >
      <div className="nm-modal">

        {/* ── Header ── */}
        <div className="nm-header" style={{ borderTop: `5px solid ${tc.color}` }}>
          <div className="nm-header-top">
            <span className="nm-badge" style={{ background: tc.bg, color: tc.color }}>
              {tc.label}
            </span>
            {isNew7(notice.publishDate) && <span className="nm-new-tag">NEW</span>}
            <button className="nm-close" onClick={onClose}><X size={20} /></button>
          </div>
          <h2 className="nm-title">{notice.title}</h2>
          <div className="nm-meta">
            <span><Calendar size={13} /> {fmtDate(notice.publishDate)}</span>
            {notice.expiryDate && (
              <span><Clock size={13} /> Expires: {fmtDate(notice.expiryDate)}</span>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        {(hasDrive || hasFiles) && (
          <div className="nm-tabs">
            <button
              className={`nm-tab${tab === 'info' ? ' active' : ''}`}
              onClick={() => setTab('info')}
            >
              📋 বিবরণ
            </button>
            {hasDrive && (
              <button
                className={`nm-tab${tab === 'drive' ? ' active' : ''}`}
                onClick={() => setTab('drive')}
              >
                📄 PDF ({notice.driveLinks.length})
              </button>
            )}
            {hasFiles && (
              <button
                className={`nm-tab${tab === 'files' ? ' active' : ''}`}
                onClick={() => setTab('files')}
              >
                📎 Files ({notice.attachments.length})
              </button>
            )}
          </div>
        )}

        <div className="nm-body">

          {/* বিবরণ */}
          {(tab === 'info' || (!hasDrive && !hasFiles)) && (
            <div className="nm-description">
              <p>{notice.description || 'No description available.'}</p>
              {hasFiles && (
                <div className="nm-desc-files">
                  {notice.attachments.map((att, i) => (
                    <button
                      key={i}
                      className="nm-desc-dl-btn"
                      onClick={() => handleDl(att)}
                      disabled={downloading}
                    >
                      <Download size={14} /> {att.fileName || `Download File ${i + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ✅ Google Drive PDF — full width newspaper iframe */}
          {tab === 'drive' && hasDrive && notice.driveLinks.map((link, i) => (
            <div key={i} className="nm-drive-block">
              <div className="nm-drive-bar">
                <FileText size={15} />
                <span className="nm-drive-label">{link.label || `PDF Document ${i + 1}`}</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nm-drive-open"
                >
                  <ExternalLink size={12} /> Drive-এ খুলুন
                </a>
              </div>
              <iframe
                src={getDriveEmbed(link.url)}
                title={link.label || `PDF ${i + 1}`}
                className="nm-drive-iframe"
                allow="autoplay"
              />
            </div>
          ))}

          {/* ✅ Cloudinary image / PDF files */}
          {tab === 'files' && hasFiles && (
            <div className="nm-files-list">
              {notice.attachments.map((att, i) => (
                <div key={i} className="nm-file-item">
                  {/* Image preview */}
                  {att.fileType !== 'pdf' && att.fileUrl && (
                    <div className="nm-img-preview">
                      <img src={att.fileUrl} alt={att.fileName || `Attachment ${i + 1}`} />
                    </div>
                  )}
                  <div className={`nm-file-icon ${att.fileType}`}>
                    {att.fileType === 'pdf' ? <FileText size={22} /> : <ImageIcon size={22} />}
                  </div>
                  <div className="nm-file-info">
                    <span className="nm-file-name">{att.fileName || `File ${i + 1}`}</span>
                    <span className="nm-file-type">{att.fileType?.toUpperCase()}</span>
                  </div>
                  <button
                    className="nm-download-btn"
                    onClick={() => handleDl(att)}
                    disabled={downloading}
                  >
                    <Download size={14} /> {downloading ? 'Downloading…' : 'Download'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="nm-footer">
          {hasFiles && tab !== 'files' && (
            <button className="nm-footer-pill" onClick={() => setTab('files')}>
              📎 {notice.attachments.length} File(s)
            </button>
          )}
          {hasDrive && tab !== 'drive' && (
            <button className="nm-footer-pill drive" onClick={() => setTab('drive')}>
              📄 {notice.driveLinks.length} PDF(s)
            </button>
          )}
          <button className="nm-footer-close" onClick={onClose}>বন্ধ করুন</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   Home Component
══════════════════════════════════════════ */
const Home = () => {
  const navigate = useNavigate();

  const [homeData,         setHomeData]         = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [notices,          setNotices]          = useState([]);
  const [selectedNotice,   setSelectedNotice]   = useState(null);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isFading,         setIsFading]         = useState(false);

  // ✅ Fetch on mount — no cache for notices so always fresh
  useEffect(() => {
    fetchHomeData();
    fetchPublicNotices();
  }, []);

  useEffect(() => {
    const imgs = homeData?.websiteSettings?.heroImages || [];
    if (imgs.length > 0) {
      const t = setInterval(() => {
        setIsFading(true);
        setTimeout(() => {
          setCurrentHeroSlide(p => (p === imgs.length - 1 ? 0 : p + 1));
          setIsFading(false);
        }, 500);
      }, 10000);
      return () => clearInterval(t);
    }
  }, [homeData]);

  const fetchHomeData = async () => {
    try {
      const cached = cacheManager.get(CACHE_KEYS.HOME_DATA);
      if (cached) { setHomeData(cached); setLoading(false); return; }
      const res = await axios.get(
        `https://malkhanagarcollege.onrender.com/api/public/home?t=${Date.now()}`
      );
      const data = res.data.data;
      setHomeData(data);
      cacheManager.set(CACHE_KEYS.HOME_DATA, data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load website data');
      setLoading(false);
    }
  };

  // ✅ Always fetch fresh notices — sorted latest first
  const fetchPublicNotices = async () => {
    try {
      const res = await noticeService.getPublicNotices(1, 20);
      const list = (res.data || []).sort(
        (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
      );
      setNotices(list);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="home-loading">
        <SkeletonLoader type="image" height="500px" />
        <div className="container" style={{ marginTop: '40px' }}>
          <SkeletonLoader type="title" />
          <div style={{ marginTop: '20px' }}><SkeletonLoader type="text" count={5} /></div>
          <div style={{ marginTop: '60px' }}>
            <SkeletonLoader type="title" />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
              gap: '20px', marginTop: '20px',
            }}>
              <SkeletonLoader type="card" />
              <SkeletonLoader type="card" />
              <SkeletonLoader type="card" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const settings    = homeData?.websiteSettings || {};
  const heroImages  = settings.heroImages || [];
  const homeNotices = notices.slice(0, 5); // latest 5

  return (
    <div className="home-content">

      {/* ── Hero Carousel ── */}
      {heroImages.length > 0 && (
        <section className="hero-image-carousel">
          <div className="hero-carousel-wrapper">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className={`hero-carousel-slide ${index === currentHeroSlide ? 'active' : ''} ${isFading ? 'fading' : ''}`}
              >
                <LazyImage
                  src={image}
                  alt={`Hero ${index + 1}`}
                  className="hero-image"
                  placeholderType="skeleton"
                />
              </div>
            ))}
            {heroImages.length > 1 && (
              <div className="hero-carousel-dots">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    className={`hero-dot ${index === currentHeroSlide ? 'active' : ''}`}
                    onClick={() => {
                      setIsFading(true);
                      setTimeout(() => { setCurrentHeroSlide(index); setIsFading(false); }, 500);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── About ── */}
      <section className="about-section" id="about">
        <div className="container">
          <div className="section-title">
            <h2>ABOUT {settings.schoolName?.toUpperCase() || 'MALKHANAGAR COLLEGE'}</h2>
            <div className="title-underline"></div>
          </div>
          <div className="about-content">
            <div className="about-image">
              <LazyImage
                src={settings.aboutImage || '/college.jpg'}
                alt="College Building"
                placeholderType="skeleton"
              />
            </div>
            <div className="about-text">
              <p className="about-intro about-large-text">
                <b>মালখানগর কলেজ</b> স্থানীয়ভাবে এই নামেই পরিচিত এবং শিক্ষা মন্ত্রণালয়ের অধীন
                মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর প্রদত্ত <b>EIIN নম্বর</b> <b>১৩৪৫৯০</b> বহন করে।
                প্রতিষ্ঠানটি ১ জুলাই ১৯৯২ সালে প্রতিষ্ঠিত হয় এবং ১ জুলাই <b>২০০২ সালে সরকারি
                স্বীকৃতি লাভ</b> করে। এটি অনার্স পর্যায়ে অনুমোদিত একটি শিক্ষা প্রতিষ্ঠান এবং
                এমপিওভুক্ত, যার <b>এমপিও রেজিস্ট্রেশন নম্বর ২৯০৪১২৩১০১</b>। কলেজটি ঢাকা বোর্ডের
                অধীনে পরিচালিত হয়।
              </p>
              <p className="about-large-text">
                এছাড়া কলেজের পরিবেশ শান্ত ও শিক্ষাবান্ধব, যেখানে শিক্ষার্থীদের জন্য পর্যাপ্ত
                শ্রেণিকক্ষ, লাইব্রেরি ও প্রয়োজনীয় সুযোগ-সুবিধা রয়েছে।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Principal Message ── */}
      <section className="message-section chairman-section">
        <div className="container">
          <div className="section-title">
            <h2>MESSAGE FROM THE PRINCIPAL</h2>
            <div className="title-underline green"></div>
          </div>
          <div className="message-content">
            <div className="message-text">
              <p className="message-large-text">
                <h4>অধ্যক্ষের বাণী :</h4><br />
                ❝ মালখানগর কলেজ জ্ঞান, মূল্যবোধ ও আধুনিক শিক্ষার সমন্বয়ে একটি অগ্রসরমান
                প্রতিষ্ঠান। আমরা শিক্ষার্থীদের মেধা, দক্ষতা ও চরিত্র গঠনে প্রতিশ্রুতিবদ্ধ।
                প্রিয় শিক্ষার্থীরা—স্বপ্ন দেখো, শিখো এবং নৈতিকতা ও অধ্যবসায়ের সাথে এগিয়ে
                চলো। তোমাদের প্রতিটি অগ্রযাত্রায় মালখানগর কলেজ সর্বদা পাশে রয়েছে ❞
              </p>
            </div>
            <div className="message-author">
              <LazyImage
                src={settings.chairmanImage || '/sir.jpg'}
                alt="Principal"
                className="author-photo-wrapper"
                placeholderType="spinner"
              />
              <h3>অধ্যক্ষ (ভারপ্রাপ্ত) মালখানগর কলেজ</h3>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          ✅ NOTICE BOARD — fresh on every visit
      ════════════════════════════════════ */}
      <section className="notice-section" id="notice">
        <div className="container">

          {/* Header */}
          <div className="hm-notice-header">
            <div className="hm-notice-header-left">
              <div className="hm-notice-bell"><Bell size={22} /></div>
              <h2 className="hm-notice-heading">NOTICE BOARD</h2>
              {notices.length > 0 && (
                <span className="hm-notice-total">{notices.length}</span>
              )}
            </div>
            {/* ✅ VIEW ALL → navigate to /notice page */}
            <button className="hm-btn-view-all" onClick={() => navigate('/notice')}>
              VIEW ALL <ArrowRight size={15} />
            </button>
          </div>

          {/* List */}
          <div className="hm-notice-board">
            {notices.length === 0 ? (
              <div className="hm-no-notice">
                <Bell size={48} color="#ccc" />
                <p>No notices available</p>
              </div>
            ) : (
              <div className="hm-notice-list">
                {homeNotices.map((notice, idx) => {
                  const tc       = TYPE_CFG[notice.type] || TYPE_CFG.general;
                  const hasDrive = notice.driveLinks?.length > 0;
                  const hasFiles = notice.attachments?.length > 0;

                  return (
                    <div
                      key={notice._id}
                      className="hm-notice-item"
                      style={{ animationDelay: `${idx * 0.07}s` }}
                    >
                      {/* Left accent */}
                      <div className="hm-ni-accent" style={{ background: tc.color }} />

                      <div className="hm-ni-body">
                        <div className="hm-ni-top">
                          <div className="hm-ni-badges">
                            <span
                              className="hm-ni-badge"
                              style={{ background: tc.bg, color: tc.color }}
                            >
                              {tc.label}
                            </span>
                            {isNew7(notice.publishDate) && (
                              <span className="hm-ni-new">NEW</span>
                            )}
                          </div>
                          <span className="hm-ni-date">
                            <Calendar size={12} /> {fmtDate(notice.publishDate)}
                          </span>
                        </div>

                        {/* ✅ 10-word clickable title */}
                        <h4
                          className="hm-ni-title"
                          onClick={() => setSelectedNotice(notice)}
                          title={notice.title}
                        >
                          {wordLimit10(notice.title)}
                        </h4>

                        {/* File pills */}
                        {(hasDrive || hasFiles) && (
                          <div className="hm-ni-pills">
                            {hasDrive && (
                              <button
                                className="hm-ni-pill drive"
                                onClick={() => setSelectedNotice(notice)}
                              >
                                <FileText size={11} /> {notice.driveLinks.length} PDF
                              </button>
                            )}
                            {hasFiles && (
                              <button
                                className="hm-ni-pill file"
                                onClick={() => setSelectedNotice(notice)}
                              >
                                <ImageIcon size={11} /> {notice.attachments.length} File
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <button
                        className="hm-ni-arrow"
                        onClick={() => setSelectedNotice(notice)}
                      >›</button>
                    </div>
                  );
                })}

                {notices.length > 5 && (
                  <div className="hm-notice-more">
                    <button className="hm-btn-more" onClick={() => navigate('/notice')}>
                      See all {notices.length} notices <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-section">
        <div className="container">
          <h2 className="stats-title">
            We are in <span className="highlight">Members</span> at a glance
          </h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3>{settings.totalStudents || 3000}</h3>
              <p>Student</p>
            </div>
            <div className="stat-box">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3>{settings.totalTeachers || 80}</h3>
              <p>Teachers</p>
            </div>
            <div className="stat-box">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <h3>{settings.totalStaff || 30}</h3>
              <p>Staffs</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Map ── */}
      <section className="map-section">
        <div className="container">
          <div className="section-title">
            <h2>MALKHANAGAR COLLEGE</h2>
            <div className="title-underline"></div>
          </div>
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2871.5546102087783!2d90.42362907405689!3d23.55754499615533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755a52601a27fdd%3A0x6efa6be14a5985c0!2sMalkhanagar%20College!5e1!3m2!1sen!2sbd!4v1765553683999!5m2!1sen!2sbd"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="College Location"
            />
          </div>
        </div>
      </section>

      {/* ✅ Notice Detail Modal */}
      {selectedNotice && (
        <NoticeModal
          notice={selectedNotice}
          onClose={() => setSelectedNotice(null)}
        />
      )}
    </div>
  );
};

export default Home;