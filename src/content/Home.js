// ============================================
// FILE PATH: frontend/src/content/Home.js
// ============================================

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LazyImage from '../components/LazyImage';
import NoticeViewer from '../components/NoticeViewer';
import SkeletonLoader from '../components/SkeletonLoader';
import noticeService from '../services/noticeService';
import {
  FileText,
  Download,
  Calendar,
  Bell,
  Image as ImageIcon,
} from 'lucide-react';
import './Home.css';

// Cache utility functions
const CACHE_DURATION = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
const CACHE_KEYS = {
  HOME_DATA: 'home_data_cache',
  NOTICES: 'notices_cache',
};

const cacheManager = {
  // Save data to cache with timestamp
  set: (key, data) => {
    try {
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION,
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  // Get data from cache if not expired
  get: (key) => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now > cacheData.expiresAt) {
        localStorage.removeItem(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Clear specific cache
  clear: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },

  // Clear all caches
  clearAll: () => {
    try {
      Object.values(CACHE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Cache clear all error:', error);
    }
  },

  // Get cache info (for debugging)
  getInfo: (key) => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const now = Date.now();
      const remainingTime = cacheData.expiresAt - now;
      const remainingDays = Math.floor(remainingTime / (24 * 60 * 60 * 1000));

      return {
        exists: true,
        createdAt: new Date(cacheData.timestamp).toLocaleString(),
        expiresAt: new Date(cacheData.expiresAt).toLocaleString(),
        remainingDays: remainingDays,
        isExpired: now > cacheData.expiresAt,
      };
    } catch (error) {
      return null;
    }
  },
};

const Home = () => {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [useCache, setUseCache] = useState(true);

  useEffect(() => {
    fetchHomeData();
    fetchPublicNotices();

    // Log cache info in console (for debugging)
    console.log('Home Data Cache Info:', cacheManager.getInfo(CACHE_KEYS.HOME_DATA));
    console.log('Notices Cache Info:', cacheManager.getInfo(CACHE_KEYS.NOTICES));
  }, []);

  // Hero carousel auto-play
  useEffect(() => {
    const heroImages = homeData?.websiteSettings?.heroImages || [];
    if (heroImages.length > 0) {
      const timer = setInterval(() => {
        setIsFading(true);
        setTimeout(() => {
          setCurrentHeroSlide((prev) =>
            prev === heroImages.length - 1 ? 0 : prev + 1
          );
          setIsFading(false);
        }, 500);
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [homeData]);

  const fetchHomeData = async (forceRefresh = false) => {
    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh && useCache) {
        const cachedData = cacheManager.get(CACHE_KEYS.HOME_DATA);
        if (cachedData) {
          console.log('Loading home data from cache');
          setHomeData(cachedData);
          setLoading(false);
          return;
        }
      }

      // Fetch from API if no cache or force refresh
      console.log('Fetching home data from API');
      const timestamp = new Date().getTime();
      const response = await axios.get(
        `https://backend-yfp1.onrender.com/api/public/home?t=${timestamp}`
      );
      
      const data = response.data.data;
      setHomeData(data);
      
      // Save to cache
      cacheManager.set(CACHE_KEYS.HOME_DATA, data);
      console.log('Home data cached successfully');
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch home data:', error);
      toast.error('Failed to load website data');
      setLoading(false);
    }
  };

  const fetchPublicNotices = async (forceRefresh = false) => {
    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh && useCache) {
        const cachedNotices = cacheManager.get(CACHE_KEYS.NOTICES);
        if (cachedNotices) {
          console.log('Loading notices from cache');
          setNotices(cachedNotices);
          return;
        }
      }

      // Fetch from API if no cache or force refresh
      console.log('Fetching notices from API');
      const response = await noticeService.getPublicNotices();
      const noticesData = response.data || [];
      
      setNotices(noticesData);
      
      // Save to cache
      cacheManager.set(CACHE_KEYS.NOTICES, noticesData);
      console.log('Notices cached successfully');
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    }
  };

  const handleRefreshData = () => {
    setLoading(true);
    toast.loading('Refreshing data...');
    
    // Clear caches and refetch
    cacheManager.clearAll();
    
    Promise.all([
      fetchHomeData(true),
      fetchPublicNotices(true)
    ]).then(() => {
      toast.dismiss();
      toast.success('Data refreshed successfully!');
    }).catch(() => {
      toast.dismiss();
      toast.error('Failed to refresh data');
    });
  };

  const handleAttachmentClick = (attachment) => {
    setSelectedAttachment(attachment);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="home-loading">
        <SkeletonLoader type="image" height="500px" />
        <div className="container" style={{ marginTop: '40px' }}>
          <SkeletonLoader type="title" />
          <div style={{ marginTop: '20px' }}>
            <SkeletonLoader type="text" count={5} />
          </div>
          
          <div style={{ marginTop: '60px' }}>
            <SkeletonLoader type="title" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <SkeletonLoader type="card" />
              <SkeletonLoader type="card" />
              <SkeletonLoader type="card" />
            </div>
          </div>

          <div style={{ marginTop: '60px' }}>
            <SkeletonLoader type="title" />
            <SkeletonLoader type="text" count={8} />
          </div>
        </div>
      </div>
    );
  }

  const settings = homeData?.websiteSettings || {};
  const heroImages = settings.heroImages || [];
  const cacheInfo = cacheManager.getInfo(CACHE_KEYS.HOME_DATA);

  return (
    <div className="home-content">
      {/* Cache Info Banner (Optional - can be hidden in production) */}
      {/* {cacheInfo && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '10px 20px',
          textAlign: 'center',
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <span>📦 Data cached • {cacheInfo.remainingDays} days remaining</span>
          <button
            onClick={handleRefreshData}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '5px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            🔄 Refresh Now
          </button>
        </div>
      )} */}

      {/* Hero Carousel */}
      {heroImages.length > 0 && (
        <section className="hero-image-carousel">
          <div className="hero-carousel-wrapper">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className={`hero-carousel-slide ${
                  index === currentHeroSlide ? 'active' : ''
                } ${isFading ? 'fading' : ''}`}
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
                    className={`hero-dot ${
                      index === currentHeroSlide ? 'active' : ''
                    }`}
                    onClick={() => {
                      setIsFading(true);
                      setTimeout(() => {
                        setCurrentHeroSlide(index);
                        setIsFading(false);
                      }, 500);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="container">
          <div className="section-title">
            <h2>
              ABOUT{' '}
              {settings.schoolName?.toUpperCase() || 'MALKHANAGAR COLLEGE'}
            </h2>
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
                <b>মালখানগর কলেজ</b>  স্থানীয়ভাবে এই নামেই পরিচিত এবং শিক্ষা মন্ত্রণালয়ের
                অধীন মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর প্রদত্ত <b>EIIN নম্বর</b>  <b>১৩৪৫৯০</b>  বহন
                করে। প্রতিষ্ঠানটি ১ জুলাই ১৯৯২ সালে প্রতিষ্ঠিত হয় এবং ১ জুলাই <b>২০০২ সালে সরকারি স্বীকৃতি লাভ</b> করে। এটি অনার্স পর্যায়ে অনুমোদিত
                একটি শিক্ষা প্রতিষ্ঠান এবং এমপিওভুক্ত, যার  <b>এমপিও রেজিস্ট্রেশন নম্বর ২৯০৪১২৩১০১</b> । কলেজটি ঢাকা বোর্ডের অধীনে পরিচালিত হয়। এখানে বিজ্ঞান,
                মানবিক ও ব্যবসায় শিক্ষা বিভাগ চালু আছে। গ্রামীণ এলাকায় অবস্থিত এই
                কলেজে বাংলা ভার্সনে পাঠদান করা হয়।
              </p>
              <p className="about-large-text">
                এছাড়া কলেজের পরিবেশ শান্ত ও শিক্ষাবান্ধব, যেখানে শিক্ষার্থীদের জন্য
                পর্যাপ্ত শ্রেণিকক্ষ, লাইব্রেরি ও প্রয়োজনীয় সুযোগ-সুবিধা রয়েছে।
                এলাকার শিক্ষার্থীদের উচ্চশিক্ষার সুযোগ বাড়াতে প্রতিষ্ঠানটি
                গুরুত্বপূর্ণ ভূমিকা রাখছে এবং মানসম্মত শিক্ষা প্রদানে নিয়মিত কাজ করে
                যাচ্ছে।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Principal Message */}
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
                ❝ মালখানগর কলেজ জ্ঞান, মূল্যবোধ ও আধুনিক শিক্ষার সমন্বয়ে একটি অগ্রসরমান প্রতিষ্ঠান। আমরা শিক্ষার্থীদের মেধা, দক্ষতা ও চরিত্র গঠনে প্রতিশ্রুতিবদ্ধ। প্রিয় শিক্ষার্থীরা—স্বপ্ন দেখো, শিখো এবং নৈতিকতা ও অধ্যবসায়ের সাথে এগিয়ে চলো। তোমাদের প্রতিটি অগ্রযাত্রায় মালখানগর কলেজ সর্বদা পাশে রয়েছে ❞
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

      {/* Notice Section */}
      <section className="notice-section" id="notice">
        <div className="container">
          <div className="notice-header">
            <h2 className="notice-title">NOTICE BOARD</h2>
            <button
              className="btn-view-all"
              onClick={() => setShowAllNotices(!showAllNotices)}
            >
              {showAllNotices ? 'SHOW LESS' : 'VIEW ALL'}
            </button>
          </div>

          <div className="notice-content-wrapper">
            <div className="notice-board">
              {notices.length === 0 ? (
                <div className="no-notices">
                  <Bell size={60} color="#ccc" />
                  <p>No notices available</p>
                </div>
              ) : (
                <div className="notice-list-public">
                  {(showAllNotices ? notices : notices.slice(0, 4)).map(
                    (notice) => (
                      <div key={notice._id} className="notice-item-public">
                        <div className="notice-item-header">
                          <div className="notice-item-left">
                            <span className={`notice-badge ${notice.type}`}>
                              {notice.type}
                            </span>
                            <div className="notice-date-public">
                              <Calendar size={16} />
                              <span>{formatDate(notice.publishDate)}</span>
                            </div>
                          </div>
                          {notice.attachments && notice.attachments.length > 0 && (
                            <div className="notice-attachment-indicator">
                              📎 {notice.attachments.length}
                            </div>
                          )}
                        </div>

                        <h4>{truncateText(notice.title, 150)}</h4>

                        {notice.attachments && notice.attachments.length > 0 && (
                          <div className="notice-files-grid">
                            {notice.attachments.map((attachment, index) => (
                              <button
                                key={index}
                                className="file-preview-btn"
                                onClick={() => handleAttachmentClick(attachment)}
                              >
                                {attachment.fileType === 'pdf' ? (
                                  <>
                                    <FileText size={18} />
                                    <span>PDF Document</span>
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon size={18} />
                                    <span>Image File</span>
                                  </>
                                )}
                                <Download size={14} className="download-icon" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
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
              <h3>{settings.totalStudents || 3200}</h3>
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
              <h3>{settings.totalStaff || 40}</h3>
              <p>Staffs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
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
            ></iframe>
          </div>
        </div>
      </section>

      {selectedAttachment && (
        <NoticeViewer
          attachment={selectedAttachment}
          onClose={() => setSelectedAttachment(null)}
        />
      )}
    </div>
  );
};

export default Home;


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import LazyImage from '../components/LazyImage';
// import NoticeViewer from '../components/NoticeViewer';
// import noticeService from '../services/noticeService';
// import SkeletonLoader from '../components/SkeletonLoader';
// import {
//   FileText,
//   Download,
//   Calendar,
//   Bell,
//   Image as ImageIcon,
// } from 'lucide-react';
// import './Home.css';

// const Home = () => {
//   const [homeData, setHomeData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [notices, setNotices] = useState([]);
//   const [showAllNotices, setShowAllNotices] = useState(false);
//   const [selectedAttachment, setSelectedAttachment] = useState(null);
//   const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
//   const [isFading, setIsFading] = useState(false);

//   useEffect(() => {
//     fetchHomeData();
//     fetchPublicNotices();
//   }, []);

//   useEffect(() => {
//     const heroImages = homeData?.websiteSettings?.heroImages || [];
//     if (heroImages.length > 0) {
//       const timer = setInterval(() => {
//         setIsFading(true);
//         setTimeout(() => {
//           setCurrentHeroSlide((prev) =>
//             prev === heroImages.length - 1 ? 0 : prev + 1
//           );
//           setIsFading(false);
//         }, 500);
//       }, 10000);
//       return () => clearInterval(timer);
//     }
//   }, [homeData]);

//   const fetchHomeData = async () => {
//     try {
//       const timestamp = new Date().getTime();
//       const response = await axios.get(
//         `https://backend-yfp1.onrender.com/api/public/home?t=${timestamp}`
//       );
//       setHomeData(response.data.data);
//       setLoading(false);
//     } catch (error) {
//       console.error('Failed to fetch home data:', error);
//       toast.error('Failed to load website data');
//       setLoading(false);
//     }
//   };

//   const fetchPublicNotices = async () => {
//     try {
//       const response = await noticeService.getPublicNotices();
//       setNotices(response.data || []);
//     } catch (error) {
//       console.error('Failed to fetch notices:', error);
//     }
//   };

//   const handleAttachmentClick = (attachment) => {
//     setSelectedAttachment(attachment);
//   };

//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString('en-GB', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//     });
//   };

//   const truncateText = (text, maxLength) => {
//     if (text.length <= maxLength) return text;
//     return text.substring(0, maxLength) + '...';
//   };

//   if (loading) {
//     return (
//       <div className="home-loading">
//         <SkeletonLoader type="image" height="500px" />
//         <div className="container" style={{ marginTop: '40px' }}>
//           <SkeletonLoader type="title" />
//           <SkeletonLoader type="text" count={5} />
//         </div>
//       </div>
//     );
//   }

//   const settings = homeData?.websiteSettings || {};
//   const heroImages = settings.heroImages || [];

//   return (
//     <div className="home-content">
//       {/* Hero Carousel */}
//       {heroImages.length > 0 && (
//         <section className="hero-image-carousel">
//           <div className="hero-carousel-wrapper">
//             {heroImages.map((image, index) => (
//               <div
//                 key={index}
//                 className={`hero-carousel-slide ${
//                   index === currentHeroSlide ? 'active' : ''
//                 } ${isFading ? 'fading' : ''}`}
//               >
//                 <LazyImage
//                   src={image}
//                   alt={`Hero ${index + 1}`}
//                   className="hero-image"
//                   placeholderType="skeleton"
//                 />
//               </div>
//             ))}

//             {heroImages.length > 1 && (
//               <div className="hero-carousel-dots">
//                 {heroImages.map((_, index) => (
//                   <button
//                     key={index}
//                     className={`hero-dot ${
//                       index === currentHeroSlide ? 'active' : ''
//                     }`}
//                     onClick={() => {
//                       setIsFading(true);
//                       setTimeout(() => {
//                         setCurrentHeroSlide(index);
//                         setIsFading(false);
//                       }, 500);
//                     }}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         </section>
//       )}

//       {/* About Section */}
//       <section className="about-section" id="about">
//         <div className="container">
//           <div className="section-title">
//             <h2>
//               ABOUT{' '}
//               {settings.schoolName?.toUpperCase() || 'MALKHANAGAR COLLEGE'}
//             </h2>
//             <div className="title-underline"></div>
//           </div>
//           <div className="about-content">
//             <div className="about-image">
//               <LazyImage
//                 src={settings.aboutImage || '/college.jpg'}
//                 alt="College Building"
//                 placeholderType="skeleton"
//               />
//             </div>
//             <div className="about-text">
//               <p className="about-intro about-large-text">
//                 মালখানগর কলেজ স্থানীয়ভাবে এই নামেই পরিচিত এবং শিক্ষা মন্ত্রণালয়ের
//                 অধীন মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর প্রদত্ত EIIN নম্বর ১৩৪৫৯০ বহন
//                 করে। প্রতিষ্ঠানটি ১ জুলাই ১৯৯২ সালে প্রতিষ্ঠিত হয় এবং ১ জুলাই
//                 ২০০২ সালে সরকারি স্বীকৃতি লাভ করে।
//               </p>
//               <p className="about-large-text">
//                 এছাড়া কলেজের পরিবেশ শান্ত ও শিক্ষাবান্ধব, যেখানে শিক্ষার্থীদের জন্য
//                 পর্যাপ্ত শ্রেণিকক্ষ, লাইব্রেরি ও প্রয়োজনীয় সুযোগ-সুবিধা রয়েছে।
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Principal Message */}
//       <section className="message-section chairman-section">
//         <div className="container">
//           <div className="section-title">
//             <h2>MESSAGE FROM THE PRINCIPAL</h2>
//             <div className="title-underline green"></div>
//           </div>
//           <div className="message-content">
//             <div className="message-text">
//               <p className="message-large-text">
//                 অধ্যক্ষের বাণী :<br />
//                 মালখানগর কলেজ জ্ঞান, মূল্যবোধ ও আধুনিক শিক্ষার সমন্বয়ে একটি
//                 অগ্রসরমান প্রতিষ্ঠান।
//               </p>
//             </div>
//             <div className="message-author">
//               <LazyImage
//                 src={settings.chairmanImage || '/sir.jpg'}
//                 alt="Principal"
//                 className="author-photo-wrapper"
//                 placeholderType="spinner"
//               />
//               <h3>অধ্যক্ষ (ভারপ্রাপ্ত) মালখানগর কলেজ</h3>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Notice Section */}
//       <section className="notice-section" id="notice">
//         <div className="container">
//           <div className="notice-header">
//             <h2 className="notice-title">NOTICE BOARD</h2>
//             <button
//               className="btn-view-all"
//               onClick={() => setShowAllNotices(!showAllNotices)}
//             >
//               {showAllNotices ? 'SHOW LESS' : 'VIEW ALL'}
//             </button>
//           </div>

//           <div className="notice-content-wrapper">
//             <div className="notice-board">
//               {notices.length === 0 ? (
//                 <div className="no-notices">
//                   <Bell size={60} color="#ccc" />
//                   <p>No notices available</p>
//                 </div>
//               ) : (
//                 <div className="notice-list-public">
//                   {(showAllNotices ? notices : notices.slice(0, 4)).map(
//                     (notice) => (
//                       <div key={notice._id} className="notice-item-public">
//                         <div className="notice-item-header">
//                           <div className="notice-item-left">
//                             <span className={`notice-badge ${notice.type}`}>
//                               {notice.type}
//                             </span>
//                             <div className="notice-date-public">
//                               <Calendar size={16} />
//                               <span>{formatDate(notice.publishDate)}</span>
//                             </div>
//                           </div>
//                           {notice.attachments && notice.attachments.length > 0 && (
//                             <div className="notice-attachment-indicator">
//                               📎 {notice.attachments.length}
//                             </div>
//                           )}
//                         </div>

//                         <h4>{truncateText(notice.title, 150)}</h4>

//                         {notice.attachments && notice.attachments.length > 0 && (
//                           <div className="notice-files-grid">
//                             {notice.attachments.map((attachment, index) => (
//                               <button
//                                 key={index}
//                                 className="file-preview-btn"
//                                 onClick={() => handleAttachmentClick(attachment)}
//                               >
//                                 {attachment.fileType === 'pdf' ? (
//                                   <>
//                                     <FileText size={18} />
//                                     <span>PDF Document</span>
//                                   </>
//                                 ) : (
//                                   <>
//                                     <ImageIcon size={18} />
//                                     <span>Image File</span>
//                                   </>
//                                 )}
//                                 <Download size={14} className="download-icon" />
//                               </button>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     )
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="stats-section">
//         <div className="container">
//           <h2 className="stats-title">
//             We are in <span className="highlight">Members</span> at a glance
//           </h2>
//           <div className="stats-grid">
//             <div className="stat-box">
//               <div className="stat-icon">
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
//                   <circle cx="9" cy="7" r="4"></circle>
//                   <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
//                   <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
//                 </svg>
//               </div>
//               <h3>{settings.totalStudents || 3200}</h3>
//               <p>Student</p>
//             </div>

//             <div className="stat-box">
//               <div className="stat-icon">
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
//                 </svg>
//               </div>
//               <h3>{settings.totalTeachers || 80}</h3>
//               <p>Teachers</p>
//             </div>

//             <div className="stat-box">
//               <div className="stat-icon">
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
//                   <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
//                 </svg>
//               </div>
//               <h3>{settings.totalStaff || 40}</h3>
//               <p>Staffs</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Map Section */}
//       <section className="map-section">
//         <div className="container">
//           <div className="section-title">
//             <h2>MALKHANAGAR COLLEGE</h2>
//             <div className="title-underline"></div>
//           </div>
//           <div className="map-container">
//             <iframe
//               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2871.5546102087783!2d90.42362907405689!3d23.55754499615533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755a52601a27fdd%3A0x6efa6be14a5985c0!2sMalkhanagar%20College!5e1!3m2!1sen!2sbd!4v1765553683999!5m2!1sen!2sbd"
//               width="100%"
//               height="100%"
//               style={{ border: 0 }}
//               allowFullScreen=""
//               loading="lazy"
//               title="College Location"
//             ></iframe>
//           </div>
//         </div>
//       </section>

//       {selectedAttachment && (
//         <NoticeViewer
//           attachment={selectedAttachment}
//           onClose={() => setSelectedAttachment(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default Home;