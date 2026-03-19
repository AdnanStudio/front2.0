// // FILE PATH: src/content/Home.js
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import LazyImage from '../components/LazyImage';
// import SkeletonLoader from '../components/SkeletonLoader';
// import noticeService from '../services/noticeService';
// import {
//   FileText, Download, Calendar, Bell,
//   Image as ImageIcon, ExternalLink, ArrowRight, X, Clock,
// } from 'lucide-react';
// import './Home.css';

// /* ── Cache ── */
// const CACHE_DURATION = 365 * 24 * 60 * 60 * 1000;
// const CACHE_KEYS = { HOME_DATA: 'home_data_cache', NOTICES: 'notices_cache' };
// const cacheManager = {
//   set: (key, data) => {
//     try { localStorage.setItem(key, JSON.stringify({ data, expiresAt: Date.now() + CACHE_DURATION })); } catch {}
//   },
//   get: (key) => {
//     try {
//       const c = localStorage.getItem(key);
//       if (!c) return null;
//       const p = JSON.parse(c);
//       if (Date.now() > p.expiresAt) { localStorage.removeItem(key); return null; }
//       return p.data;
//     } catch { return null; }
//   },
//   clearAll: () => { try { Object.values(CACHE_KEYS).forEach(k => localStorage.removeItem(k)); } catch {} },
// };

// /* ── Helpers ── */
// const TYPE_CFG = {
//   general:   { bg: '#e3f2fd', color: '#1565c0', label: 'General'   },
//   urgent:    { bg: '#ffebee', color: '#c62828', label: 'Urgent'    },
//   exam:      { bg: '#fff3e0', color: '#e65100', label: 'Exam'      },
//   holiday:   { bg: '#f3e5f5', color: '#7b1fa2', label: 'Holiday'   },
//   event:     { bg: '#e8f5e9', color: '#2e7d32', label: 'Event'     },
//   admission: { bg: '#fce4ec', color: '#c2185b', label: 'Admission' },
// };

// const fmtDate = (d) =>
//   new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// const isNew7 = (date) => (Date.now() - new Date(date)) / 86400000 < 7;

// const wordLimit10 = (t = '') => {
//   const w = t.trim().split(/\s+/);
//   return w.length <= 10 ? t : w.slice(0, 10).join(' ') + '…';
// };

// const getDriveEmbed = (url = '') => {
//   const m1 = url.match(/\/d\/([^/]+)/);
//   if (m1) return `https://drive.google.com/file/d/${m1[1]}/preview`;
//   const m2 = url.match(/[?&]id=([^&]+)/);
//   if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
//   return url;
// };

// /* ══════════════════════════════════════════
//    NoticeModal — shared, also used by Notice.js
//    via: import { NoticeModal } from '../content/Home';
// ══════════════════════════════════════════ */
// export const NoticeModal = ({ notice, onClose }) => {
//   const [downloading, setDl] = useState(false);
//   const hasDrive = notice.driveLinks?.length > 0;
//   const hasFiles = notice.attachments?.length > 0;
//   const [tab, setTab] = useState(hasDrive ? 'drive' : hasFiles ? 'files' : 'info');
//   const tc = TYPE_CFG[notice.type] || TYPE_CFG.general;

//   useEffect(() => {
//     const esc = (e) => e.key === 'Escape' && onClose();
//     window.addEventListener('keydown', esc);
//     document.body.style.overflow = 'hidden';
//     return () => {
//       window.removeEventListener('keydown', esc);
//       document.body.style.overflow = '';
//     };
//   }, [onClose]);

//   const handleDl = async (att) => {
//     try {
//       setDl(true);
//       const res = await fetch(att.fileUrl);
//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = att.fileName || `notice.${att.fileType === 'pdf' ? 'pdf' : 'jpg'}`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);
//     } catch {
//       window.open(att.fileUrl, '_blank');
//     } finally {
//       setDl(false);
//     }
//   };

//   return (
//     <div
//       className="nm-overlay"
//       onClick={(e) => e.target.classList.contains('nm-overlay') && onClose()}
//     >
//       <div className="nm-modal">

//         {/* ── Header ── */}
//         <div className="nm-header" style={{ borderTop: `5px solid ${tc.color}` }}>
//           <div className="nm-header-top">
//             <span className="nm-badge" style={{ background: tc.bg, color: tc.color }}>
//               {tc.label}
//             </span>
//             {isNew7(notice.publishDate) && <span className="nm-new-tag">NEW</span>}
//             <button className="nm-close" onClick={onClose}><X size={20} /></button>
//           </div>
//           <h2 className="nm-title">{notice.title}</h2>
//           <div className="nm-meta">
//             <span><Calendar size={13} /> {fmtDate(notice.publishDate)}</span>
//             {notice.expiryDate && (
//               <span><Clock size={13} /> Expires: {fmtDate(notice.expiryDate)}</span>
//             )}
//           </div>
//         </div>

//         {/* ── Tabs ── */}
//         {(hasDrive || hasFiles) && (
//           <div className="nm-tabs">
//             <button
//               className={`nm-tab${tab === 'info' ? ' active' : ''}`}
//               onClick={() => setTab('info')}
//             >
//               📋 বিবরণ
//             </button>
//             {hasDrive && (
//               <button
//                 className={`nm-tab${tab === 'drive' ? ' active' : ''}`}
//                 onClick={() => setTab('drive')}
//               >
//                 📄 PDF ({notice.driveLinks.length})
//               </button>
//             )}
//             {hasFiles && (
//               <button
//                 className={`nm-tab${tab === 'files' ? ' active' : ''}`}
//                 onClick={() => setTab('files')}
//               >
//                 📎 Files ({notice.attachments.length})
//               </button>
//             )}
//           </div>
//         )}

//         <div className="nm-body">

//           {/* বিবরণ */}
//           {(tab === 'info' || (!hasDrive && !hasFiles)) && (
//             <div className="nm-description">
//               <p>{notice.description || 'No description available.'}</p>
//               {hasFiles && (
//                 <div className="nm-desc-files">
//                   {notice.attachments.map((att, i) => (
//                     <button
//                       key={i}
//                       className="nm-desc-dl-btn"
//                       onClick={() => handleDl(att)}
//                       disabled={downloading}
//                     >
//                       <Download size={14} /> {att.fileName || `Download File ${i + 1}`}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ✅ Google Drive PDF — full width newspaper iframe */}
//           {tab === 'drive' && hasDrive && notice.driveLinks.map((link, i) => (
//             <div key={i} className="nm-drive-block">
//               <div className="nm-drive-bar">
//                 <FileText size={15} />
//                 <span className="nm-drive-label">{link.label || `PDF Document ${i + 1}`}</span>
//                 <a
//                   href={link.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="nm-drive-open"
//                 >
//                   <ExternalLink size={12} /> Drive-এ খুলুন
//                 </a>
//               </div>
//               <iframe
//                 src={getDriveEmbed(link.url)}
//                 title={link.label || `PDF ${i + 1}`}
//                 className="nm-drive-iframe"
//                 allow="autoplay"
//               />
//             </div>
//           ))}

//           {/* ✅ Cloudinary image / PDF files */}
//           {tab === 'files' && hasFiles && (
//             <div className="nm-files-list">
//               {notice.attachments.map((att, i) => (
//                 <div key={i} className="nm-file-item">
//                   {/* Image preview */}
//                   {att.fileType !== 'pdf' && att.fileUrl && (
//                     <div className="nm-img-preview">
//                       <img src={att.fileUrl} alt={att.fileName || `Attachment ${i + 1}`} />
//                     </div>
//                   )}
//                   <div className={`nm-file-icon ${att.fileType}`}>
//                     {att.fileType === 'pdf' ? <FileText size={22} /> : <ImageIcon size={22} />}
//                   </div>
//                   <div className="nm-file-info">
//                     <span className="nm-file-name">{att.fileName || `File ${i + 1}`}</span>
//                     <span className="nm-file-type">{att.fileType?.toUpperCase()}</span>
//                   </div>
//                   <button
//                     className="nm-download-btn"
//                     onClick={() => handleDl(att)}
//                     disabled={downloading}
//                   >
//                     <Download size={14} /> {downloading ? 'Downloading…' : 'Download'}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* ── Footer ── */}
//         <div className="nm-footer">
//           {hasFiles && tab !== 'files' && (
//             <button className="nm-footer-pill" onClick={() => setTab('files')}>
//               📎 {notice.attachments.length} File(s)
//             </button>
//           )}
//           {hasDrive && tab !== 'drive' && (
//             <button className="nm-footer-pill drive" onClick={() => setTab('drive')}>
//               📄 {notice.driveLinks.length} PDF(s)
//             </button>
//           )}
//           <button className="nm-footer-close" onClick={onClose}>বন্ধ করুন</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ══════════════════════════════════════════
//    Home Component
// ══════════════════════════════════════════ */
// const Home = () => {
//   const navigate = useNavigate();

//   const [homeData,         setHomeData]         = useState(null);
//   const [loading,          setLoading]          = useState(true);
//   const [notices,          setNotices]          = useState([]);
//   const [selectedNotice,   setSelectedNotice]   = useState(null);
//   const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
//   const [isFading,         setIsFading]         = useState(false);

//   // ✅ Fetch on mount — no cache for notices so always fresh
//   useEffect(() => {
//     fetchHomeData();
//     fetchPublicNotices();
//   }, []);

//   useEffect(() => {
//     const imgs = homeData?.websiteSettings?.heroImages || [];
//     if (imgs.length > 0) {
//       const t = setInterval(() => {
//         setIsFading(true);
//         setTimeout(() => {
//           setCurrentHeroSlide(p => (p === imgs.length - 1 ? 0 : p + 1));
//           setIsFading(false);
//         }, 500);
//       }, 10000);
//       return () => clearInterval(t);
//     }
//   }, [homeData]);

//   const fetchHomeData = async () => {
//     try {
//       const cached = cacheManager.get(CACHE_KEYS.HOME_DATA);
//       if (cached) { setHomeData(cached); setLoading(false); return; }
//       const res = await axios.get(
//         `https://malkhanagarcollege.onrender.com/api/public/home?t=${Date.now()}`
//       );
//       const data = res.data.data;
//       setHomeData(data);
//       cacheManager.set(CACHE_KEYS.HOME_DATA, data);
//       setLoading(false);
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to load website data');
//       setLoading(false);
//     }
//   };

//   // ✅ Always fetch fresh notices — sorted latest first
//   const fetchPublicNotices = async () => {
//     try {
//       const res = await noticeService.getPublicNotices(1, 20);
//       const list = (res.data || []).sort(
//         (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
//       );
//       setNotices(list);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="home-loading">
//         <SkeletonLoader type="image" height="500px" />
//         <div className="container" style={{ marginTop: '40px' }}>
//           <SkeletonLoader type="title" />
//           <div style={{ marginTop: '20px' }}><SkeletonLoader type="text" count={5} /></div>
//           <div style={{ marginTop: '60px' }}>
//             <SkeletonLoader type="title" />
//             <div style={{
//               display: 'grid',
//               gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
//               gap: '20px', marginTop: '20px',
//             }}>
//               <SkeletonLoader type="card" />
//               <SkeletonLoader type="card" />
//               <SkeletonLoader type="card" />
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const settings    = homeData?.websiteSettings || {};
//   const heroImages  = settings.heroImages || [];
//   const homeNotices = notices.slice(0, 5); // latest 5

//   return (
//     <div className="home-content">

//       {/* ── Hero Carousel ── */}
//       {heroImages.length > 0 && (
//         <section className="hero-image-carousel">
//           <div className="hero-carousel-wrapper">
//             {heroImages.map((image, index) => (
//               <div
//                 key={index}
//                 className={`hero-carousel-slide ${index === currentHeroSlide ? 'active' : ''} ${isFading ? 'fading' : ''}`}
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
//                     className={`hero-dot ${index === currentHeroSlide ? 'active' : ''}`}
//                     onClick={() => {
//                       setIsFading(true);
//                       setTimeout(() => { setCurrentHeroSlide(index); setIsFading(false); }, 500);
//                     }}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         </section>
//       )}

//       {/* ── About ── */}
//       <section className="about-section" id="about">
//         <div className="container">
//           <div className="section-title">
//             <h2>ABOUT {settings.schoolName?.toUpperCase() || 'MALKHANAGAR COLLEGE'}</h2>
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
//                 <b>মালখানগর কলেজ</b> স্থানীয়ভাবে এই নামেই পরিচিত এবং শিক্ষা মন্ত্রণালয়ের অধীন
//                 মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর প্রদত্ত <b>EIIN নম্বর</b> <b>১৩৪৫৯০</b> বহন করে।
//                 প্রতিষ্ঠানটি ১ জুলাই ১৯৯২ সালে প্রতিষ্ঠিত হয় এবং ১ জুলাই <b>২০০২ সালে সরকারি
//                 স্বীকৃতি লাভ</b> করে। এটি অনার্স পর্যায়ে অনুমোদিত একটি শিক্ষা প্রতিষ্ঠান এবং
//                 এমপিওভুক্ত, যার <b>এমপিও রেজিস্ট্রেশন নম্বর ২৯০৪১২৩১০১</b>। কলেজটি ঢাকা বোর্ডের
//                 অধীনে পরিচালিত হয়।
//               </p>
//               <p className="about-large-text">
//                 এছাড়া কলেজের পরিবেশ শান্ত ও শিক্ষাবান্ধব, যেখানে শিক্ষার্থীদের জন্য পর্যাপ্ত
//                 শ্রেণিকক্ষ, লাইব্রেরি ও প্রয়োজনীয় সুযোগ-সুবিধা রয়েছে।
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── Principal Message ── */}
//       <section className="message-section chairman-section">
//         <div className="container">
//           <div className="section-title">
//             <h2>MESSAGE FROM THE PRINCIPAL</h2>
//             <div className="title-underline green"></div>
//           </div>
//           <div className="message-content">
//             <div className="message-text">
//               <p className="message-large-text">
//                 <h4>অধ্যক্ষের বাণী :</h4><br />
//                 ❝ মালখানগর কলেজ জ্ঞান, মূল্যবোধ ও আধুনিক শিক্ষার সমন্বয়ে একটি অগ্রসরমান
//                 প্রতিষ্ঠান। আমরা শিক্ষার্থীদের মেধা, দক্ষতা ও চরিত্র গঠনে প্রতিশ্রুতিবদ্ধ।
//                 প্রিয় শিক্ষার্থীরা—স্বপ্ন দেখো, শিখো এবং নৈতিকতা ও অধ্যবসায়ের সাথে এগিয়ে
//                 চলো। তোমাদের প্রতিটি অগ্রযাত্রায় মালখানগর কলেজ সর্বদা পাশে রয়েছে ❞
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

//       {/* ════════════════════════════════════
//           ✅ NOTICE BOARD — fresh on every visit
//       ════════════════════════════════════ */}
//       <section className="notice-section" id="notice">
//         <div className="container">

//           {/* Header */}
//           <div className="hm-notice-header">
//             <div className="hm-notice-header-left">
//               <div className="hm-notice-bell"><Bell size={22} /></div>
//               <h2 className="hm-notice-heading">NOTICE BOARD</h2>
//               {notices.length > 0 && (
//                 <span className="hm-notice-total">{notices.length}</span>
//               )}
//             </div>
//             {/* ✅ VIEW ALL → navigate to /notice page */}
//             <button className="hm-btn-view-all" onClick={() => navigate('/notice')}>
//               VIEW ALL <ArrowRight size={15} />
//             </button>
//           </div>

//           {/* List */}
//           <div className="hm-notice-board">
//             {notices.length === 0 ? (
//               <div className="hm-no-notice">
//                 <Bell size={48} color="#ccc" />
//                 <p>No notices available</p>
//               </div>
//             ) : (
//               <div className="hm-notice-list">
//                 {homeNotices.map((notice, idx) => {
//                   const tc       = TYPE_CFG[notice.type] || TYPE_CFG.general;
//                   const hasDrive = notice.driveLinks?.length > 0;
//                   const hasFiles = notice.attachments?.length > 0;

//                   return (
//                     <div
//                       key={notice._id}
//                       className="hm-notice-item"
//                       style={{ animationDelay: `${idx * 0.07}s` }}
//                     >
//                       {/* Left accent */}
//                       <div className="hm-ni-accent" style={{ background: tc.color }} />

//                       <div className="hm-ni-body">
//                         <div className="hm-ni-top">
//                           <div className="hm-ni-badges">
//                             <span
//                               className="hm-ni-badge"
//                               style={{ background: tc.bg, color: tc.color }}
//                             >
//                               {tc.label}
//                             </span>
//                             {isNew7(notice.publishDate) && (
//                               <span className="hm-ni-new">NEW</span>
//                             )}
//                           </div>
//                           <span className="hm-ni-date">
//                             <Calendar size={12} /> {fmtDate(notice.publishDate)}
//                           </span>
//                         </div>

//                         {/* ✅ 10-word clickable title */}
//                         <h4
//                           className="hm-ni-title"
//                           onClick={() => setSelectedNotice(notice)}
//                           title={notice.title}
//                         >
//                           {wordLimit10(notice.title)}
//                         </h4>

//                         {/* File pills */}
//                         {(hasDrive || hasFiles) && (
//                           <div className="hm-ni-pills">
//                             {hasDrive && (
//                               <button
//                                 className="hm-ni-pill drive"
//                                 onClick={() => setSelectedNotice(notice)}
//                               >
//                                 <FileText size={11} /> {notice.driveLinks.length} PDF
//                               </button>
//                             )}
//                             {hasFiles && (
//                               <button
//                                 className="hm-ni-pill file"
//                                 onClick={() => setSelectedNotice(notice)}
//                               >
//                                 <ImageIcon size={11} /> {notice.attachments.length} File
//                               </button>
//                             )}
//                           </div>
//                         )}
//                       </div>

//                       {/* Arrow */}
//                       <button
//                         className="hm-ni-arrow"
//                         onClick={() => setSelectedNotice(notice)}
//                       >›</button>
//                     </div>
//                   );
//                 })}

//                 {notices.length > 5 && (
//                   <div className="hm-notice-more">
//                     <button className="hm-btn-more" onClick={() => navigate('/notice')}>
//                       See all {notices.length} notices <ArrowRight size={14} />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* ── Stats ── */}
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
//               <h3>{settings.totalStudents || 3000}</h3>
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
//               <h3>{settings.totalStaff || 30}</h3>
//               <p>Staffs</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── Map ── */}
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
//             />
//           </div>
//         </div>
//       </section>

//       {/* ✅ Notice Detail Modal */}
//       {selectedNotice && (
//         <NoticeModal
//           notice={selectedNotice}
//           onClose={() => setSelectedNotice(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default Home;

// ============================================
// FILE PATH: src/content/Home.js
// ============================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import LazyImage from '../components/LazyImage';
import NoticeViewer from '../components/NoticeViewer';
import SkeletonLoader from '../components/SkeletonLoader';
import noticeService from '../services/noticeService';
import {
  FileText, Download, Calendar, Bell, Image as ImageIcon,
  ChevronLeft, ChevronRight, ExternalLink,
} from 'lucide-react';
import './Home.css';

const API = 'https://malkhanagarcollege.onrender.com/api';

/* ── tiny cache ── */
const CACHE = {
  set: (k, d, ms = 30 * 60 * 1000) => {
    try { localStorage.setItem(k, JSON.stringify({ d, exp: Date.now() + ms })); } catch {}
  },
  get: (k) => {
    try {
      const v = JSON.parse(localStorage.getItem(k) || 'null');
      return v && Date.now() < v.exp ? v.d : null;
    } catch { return null; }
  },
};

/* ── date helpers ── */
const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন',
                   'জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const EN_MONTHS = ['January','February','March','April','May','June',
                   'July','August','September','October','November','December'];
const BN_DAYS_SHORT = ['রবি','সোম','মঙ্গল','বুধ','বৃহঃ','শুক্র','শনি'];

const fmtDate = (d) => {
  const dt = new Date(d);
  return `${dt.getDate()} ${BN_MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
};

/* ── Grid section definitions ── */
const GRID_SECTIONS = [
  {
    id: 's1', emoji: '📅', title: 'সিলেবাস ও রুটিন',
    links: [
      { l: 'উচ্চ মাধ্যমিক ক্লাস রুটিন', h: '/academic/syllabus' },
      { l: 'স্নাতক (পাস)', h: '/academic/programs' },
      { l: 'স্নাতক (সম্মান)', h: '/academic/departments' },
      { l: 'ব্যবস্থাপনা', h: '/academic' },
      { l: 'সমাজ কর্ম', h: '/academic' },
      { l: 'রাষ্ট্রবিজ্ঞান', h: '/academic' },
      { l: 'মনোবিজ্ঞান', h: '/academic' },
      { l: 'ইসলামের ইতিহাস ও সংস্কৃতি', h: '/academic' },
    ],
  },
  {
    id: 's2', emoji: '🏛️', title: 'ভর্তি সম্পর্কিত',
    links: [
      { l: 'ভর্তি আবেদন', h: '/admission/apply' },
      { l: 'উচ্চ মাধ্যমিক', h: '/admission/procedure' },
      { l: 'স্নাতক (পাস)', h: '/admission/requirements' },
      { l: 'স্নাতক', h: '/admission' },
    ],
  },
  {
    id: 's3', emoji: '🗄️', title: 'ডাটাবেজ',
    links: [
      { l: 'কলেজ ডাটাবেজ', h: '/about' },
      { l: 'শিক্ষক ডাটাবেজ', h: '/administration/teachers' },
      { l: 'স্টাফ ডাটাবেজ', h: '/administration/staff' },
      { l: 'স্টুডেন্ট ডাটাবেজ', h: '/about' },
      { l: 'ই-পেমেন্ট', h: '/about' },
      { l: 'ই-লাইব্রেরি', h: '/about' },
    ],
  },
  {
    id: 's4', emoji: '📊', title: 'পরীক্ষা ও ফলাফল সংক্রান্ত',
    links: [
      { l: 'অভ্যন্তরীণ পরীক্ষার এডমিট কার্ড', h: '/about' },
      { l: 'অভ্যন্তরীণ পরীক্ষার ফলাফল', h: '/about' },
      { l: 'উচ্চ মাধ্যমিক', h: '/about' },
      { l: 'স্নাতক (পাস)', h: '/about' },
      { l: 'স্নাতক', h: '/about' },
    ],
  },
  {
    id: 's5', emoji: '📋', title: 'ফরম পূরণ সম্পর্কিত',
    links: [
      { l: 'উচ্চ মাধ্যমিক', h: '/admission/procedure' },
      { l: 'স্নাতক (পাস)', h: '/admission/requirements' },
      { l: 'স্নাতক', h: '/admission' },
    ],
  },
  {
    id: 's6', emoji: '🤝', title: 'সিটিজেন চার্টার',
    links: [
      { l: 'সেবা প্রদান প্রতিশ্রুতি', h: '/about' },
      { l: 'কলেজ সিটিজেন চার্টার', h: '/about' },
      { l: 'মাউশি', h: '/about' },
      { l: 'শিক্ষা মন্ত্রণালয়', h: '/about' },
      { l: 'বার্ষিক প্রতিবেদন', h: '/about' },
    ],
  },
  {
    id: 's7', emoji: '📝', title: 'বার্ষিক কর্মসম্পাদন চুক্তি',
    links: [
      { l: 'বার্ষিক কর্ম সম্পাদন চুক্তি (APA)', h: '/about' },
      { l: 'অফিস আদেশ', h: '/about' },
      { l: 'প্রজ্ঞাপন/কর্মপদ্ধতি/কাঠামো', h: '/about' },
      { l: 'নীতিমালা/বিধি/প্রণালি', h: '/about' },
      { l: 'প্রতিবেদন', h: '/about' },
      { l: 'আঞ্চলিক কার্যালয়ের চুক্তিসমূহ', h: '/about' },
    ],
  },
  {
    id: 's8', emoji: '🏆', title: 'সুশাসন পরিকল্পনা',
    links: [
      { l: 'সুশাসন কর্মকৌশল', h: '/about' },
      { l: 'আদেশ/বিজ্ঞপ্তি', h: '/about' },
      { l: 'সুশাসন কর্মপরিকল্পনার', h: '/about' },
      { l: 'প্রতিবেদন', h: '/about' },
      { l: 'সুশাসন পুরস্কার', h: '/about' },
    ],
  },
  {
    id: 's9', emoji: '🎭', title: 'সহশিক্ষা কার্যক্রম',
    links: [
      { l: 'ডিবেটিং সোসাইটি', h: '/about' },
      { l: 'বিএনসিসি সেনা', h: '/about' },
      { l: 'বিএনসিসি নিয়ান', h: '/about' },
      { l: 'রোভার স্কাউটস', h: '/about' },
      { l: 'রেড ক্রিসেন্ট', h: '/about' },
      { l: 'বিএন', h: '/about' },
      { l: 'গার্লস গাইড/রেঞ্জার', h: '/about' },
    ],
  },
  {
    id: 's10', emoji: '💻', title: 'অনলাইন শিক্ষা',
    links: [
      { l: 'উচ্চ মাধ্যমিক', h: '/academic' },
      { l: 'স্নাতক (পাস)', h: '/academic/programs' },
      { l: 'স্নাতক (সম্মান)', h: '/academic/departments' },
      { l: 'ইউটিউব লিংক', h: '/about' },
      { l: 'ফেসবুক লিংক', h: '/about' },
    ],
  },
  {
    id: 's11', emoji: '⬇️', title: 'ফরম ডাউনলোড',
    links: [
      { l: 'ছুটির ফরম', h: '/about' },
      { l: 'পাসপোর্ট ফরম', h: '/about' },
      { l: 'অনাপত্তি পত্র (NOC) ফরম', h: '/about' },
      { l: 'প্রত্যয়ন পত্র', h: '/about' },
      { l: 'চারিত্রিক সনদ', h: '/about' },
      { l: 'সনদ ও নম্বরপত্র', h: '/about' },
      { l: 'হারবৃত্তি', h: '/about' },
    ],
  },
  {
    id: 's12', emoji: '📢', title: 'অফিস আদেশ/বিজ্ঞপ্তি',
    links: [
      { l: 'সভার নোটিশ', h: '/notice' },
      { l: 'অগ্রাহ্য নোটিশ', h: '/notice' },
      { l: 'অফিস আদেশ', h: '/notice' },
      { l: 'সরকারি আদেশ', h: '/about' },
      { l: 'অনাপত্তি সনদ(NOC)', h: '/about' },
    ],
  },
];

const IMPORTANT_LINKS = [
  { label: 'শিক্ষা মন্ত্রণালয়', href: 'https://moedu.gov.bd' },
  { label: 'রাজশাহী শিক্ষা বোর্ড', href: 'https://web.rajshahieducationboard.gov.bd' },
  { label: 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড', href: 'https://bise.gov.bd' },
  { label: 'জাতীয় বিশ্ববিদ্যালয়', href: 'https://www.nu.ac.bd' },
  { label: 'জনপ্রশাসন মন্ত্রণালয়', href: 'https://mopa.gov.bd' },
  { label: 'বাংলাদেশ ফর্ম', href: 'https://forms.gov.bd' },
  { label: 'শিক্ষক বাতায়ন', href: 'https://www.teachers.gov.bd' },
  { label: 'EMIS | DSHE', href: 'https://emis.gov.bd' },
  { label: 'জাতীয় তথ্য বাতায়ন', href: 'https://www.bangladesh.gov.bd' },
  { label: 'শিক্ষা পরিচালকের দপ্তর', href: 'https://dshe.gov.bd' },
  { label: 'আইসিটি একাডেমি', href: '#' },
];

const FACILITIES = [
  'Biology Lab', 'Broadband Internet', 'Chemistry Lab', 'Digital Classroom', 'Physics Lab',
];

/* ══════════════════════════════════════
   MINI CALENDAR COMPONENT
══════════════════════════════════════ */
const MiniCalendar = () => {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="mini-calendar">
      <div className="mc-nav">
        <button onClick={prev} className="mc-arrow">‹</button>
        <span className="mc-title">{EN_MONTHS[month].toUpperCase()} {year}</span>
        <button onClick={next} className="mc-arrow">›</button>
      </div>
      <div className="mc-grid">
        {BN_DAYS_SHORT.map(d => <div key={d} className="mc-day-hdr">{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} className={`mc-cell${d === null ? ' empty' : ''}${isToday(d) ? ' today' : ''}`}>
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   GRID SECTION CARD
══════════════════════════════════════ */
const GridCard = ({ sec }) => (
  <div className="grid-card">
    <div className="grid-card-header">
      <span className="grid-card-emoji">{sec.emoji}</span>
      <h3>{sec.title}</h3>
    </div>
    <ul className="grid-card-links">
      {sec.links.map((lk, i) => (
        <li key={i}>
          <Link to={lk.h}>
            <span className="gc-arrow">›</span> {lk.l}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

/* ══════════════════════════════════════
   MAIN HOME COMPONENT
══════════════════════════════════════ */
const Home = () => {
  const navigate = useNavigate();

  const [homeData,       setHomeData]       = useState(null);
  const [notices,        setNotices]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [selAttach,      setSelAttach]      = useState(null);

  /* 3-D carousel state */
  const [slide,    setSlide]    = useState(0);
  const [animDir,  setAnimDir]  = useState(null);  // 'left' | 'right'
  const [locked,   setLocked]   = useState(false);
  const timerRef = useRef(null);

  /* ── fetch home data ── */
  useEffect(() => {
    const cached = CACHE.get('home_v2');
    if (cached) { setHomeData(cached); setLoading(false); }

    axios.get(`${API}/public/home?t=${Date.now()}`)
      .then(r => {
        const d = r.data.data;
        setHomeData(d);
        CACHE.set('home_v2', d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ── fetch notices ── */
  useEffect(() => {
    const cached = CACHE.get('notices_v2');
    if (cached) setNotices(cached);

    noticeService.getPublicNotices(1, 20)
      .then(r => {
        const d = r.data || [];
        setNotices(d);
        CACHE.set('notices_v2', d);
      })
      .catch(() => {});
  }, []);

  /* ── carousel auto-advance ── */
  const heroImages = homeData?.websiteSettings?.heroImages || [];

  const goTo = useCallback((dir) => {
    if (locked || heroImages.length < 2) return;
    setLocked(true);
    setAnimDir(dir);
    setTimeout(() => {
      setSlide(s =>
        dir === 'right'
          ? (s + 1) % heroImages.length
          : (s - 1 + heroImages.length) % heroImages.length
      );
      setAnimDir(null);
      setLocked(false);
    }, 700);
  }, [locked, heroImages.length]);

  useEffect(() => {
    if (heroImages.length > 1) {
      timerRef.current = setInterval(() => goTo('right'), 5000);
    }
    return () => clearInterval(timerRef.current);
  }, [goTo, heroImages.length]);

  /* ── loading skeleton ── */
  if (loading) {
    return (
      <div className="home-loading-wrap">
        <SkeletonLoader type="image" height="480px" />
        <div style={{ padding: '20px' }}>
          <SkeletonLoader type="title" />
          <SkeletonLoader type="text" count={4} />
        </div>
      </div>
    );
  }

  const settings = homeData?.websiteSettings || {};
  const principalImage  = settings.chairmanImage || '/sir.jpg';
  const photoGallery    = heroImages.slice(0, 6); // reuse heroImages for gallery demo

  return (
    <div className="home-content">

      {/* ══════════════════════════════════════
          HERO CAROUSEL — 3D perspective slide
      ══════════════════════════════════════ */}
      <section className="hero-section">
        <div className="hero-3d-wrapper">

          {/* Slides */}
          <div className={`hero-track anim-${animDir || 'idle'}`}>
            {heroImages.length > 0 ? heroImages.map((img, idx) => (
              <div
                key={idx}
                className={`hero-slide
                  ${idx === slide ? 'active' : ''}
                  ${animDir === 'right' && idx === slide ? 'exit-left' : ''}
                  ${animDir === 'left'  && idx === slide ? 'exit-right' : ''}
                  ${animDir === 'right' && idx === (slide + 1) % heroImages.length ? 'enter-right' : ''}
                  ${animDir === 'left'  && idx === (slide - 1 + heroImages.length) % heroImages.length ? 'enter-left' : ''}
                `}
              >
                <img src={img} alt={`Slide ${idx + 1}`} />
                <div className="hero-overlay" />
              </div>
            )) : (
              <div className="hero-slide active hero-fallback">
                <div className="hero-overlay" />
              </div>
            )}
          </div>

          {/* College name overlay — sits ON TOP of the image */}
          <div className="hero-college-overlay">
            {settings.logo && (
              <img src={settings.logo} alt="logo" className="hero-college-logo" />
            )}
            <div className="hero-college-text">
              <h1 className="hero-college-name-bn">{settings.schoolName || 'মালখানগর ডিগ্রি কলেজ'}</h1>
              <p className="hero-college-name-en">Malkhanagar Degree College</p>
              <p className="hero-college-meta">
                প্রতিষ্ঠা: ১৯৯২ &nbsp;|&nbsp; EIIN: 134590 &nbsp;|&nbsp;{' '}
                {settings.schoolAddress || 'মালখানগর, সিরাজদিখান, মুন্সিগঞ্জ'}
              </p>
            </div>
          </div>

          {/* Prev/Next arrows */}
          {heroImages.length > 1 && (
            <>
              <button className="hero-arrow left"  onClick={() => goTo('left')}>
                <ChevronLeft size={28} />
              </button>
              <button className="hero-arrow right" onClick={() => goTo('right')}>
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Dots */}
          {heroImages.length > 1 && (
            <div className="hero-dots">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  className={`hero-dot${i === slide ? ' active' : ''}`}
                  onClick={() => {
                    if (locked) return;
                    const dir = i > slide ? 'right' : 'left';
                    setLocked(true);
                    setAnimDir(dir);
                    setTimeout(() => { setSlide(i); setAnimDir(null); setLocked(false); }, 700);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          NEWS TICKER
      ══════════════════════════════════════ */}
      {settings.scrollingTexts?.length > 0 && (
        <div className="news-ticker">
          <div className="ticker-label">সংবাদ:</div>
          <div className="ticker-track">
            <div className="ticker-inner">
              {[...settings.scrollingTexts, ...settings.scrollingTexts].map((t, i) => (
                <span key={i} className="ticker-item">
                  ▶ {typeof t === 'string' ? t : t.text}
                </span>
              ))}
            </div>
          </div>
          <div className="ticker-all">
            <Link to="/notice">সব</Link>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          MAIN TWO-COLUMN LAYOUT
      ══════════════════════════════════════ */}
      <div className="home-body container">
        <div className="home-main">

          {/* ── NOTICE BOARD ── */}
          <section className="notice-board-section">
            <div className="nb-header">
              <div className="nb-globe-icon">🌐</div>
              <h2 className="nb-title">নোটিশ বোর্ড</h2>
              <button
                className="nb-viewall"
                onClick={() => setShowAllNotices(v => !v)}
              >
                {showAllNotices ? 'কম দেখুন' : 'সব দেখুন'}
              </button>
            </div>

            <div className="nb-body">
              {notices.length === 0 ? (
                <div className="nb-empty">
                  <Bell size={40} color="#ccc" />
                  <p>কোনো নোটিশ নেই</p>
                </div>
              ) : (
                <ul className="nb-list">
                  {(showAllNotices ? notices : notices.slice(0, 8)).map(n => (
                    <li key={n._id} className="nb-item">
                      <div className="nb-item-left">
                        <span className={`nb-badge ${n.type || 'info'}`}>
                          {n.type === 'urgent' ? 'জরুরি' :
                           n.type === 'exam'   ? 'পরীক্ষা' :
                           n.type === 'event'  ? 'ইভেন্ট' : 'নোটিশ'}
                        </span>
                        <span className="nb-date">
                          <Calendar size={12} /> {fmtDate(n.publishDate || n.createdAt)}
                        </span>
                      </div>
                      <div className="nb-item-content">
                        <span className="nb-title-text">{n.title}</span>
                        {n.attachments?.length > 0 && (
                          <div className="nb-files">
                            {n.attachments.map((a, ai) => (
                              <button key={ai} className="nb-file-btn"
                                onClick={() => setSelAttach(a)}>
                                {a.fileType === 'pdf'
                                  ? <FileText size={13} />
                                  : <ImageIcon size={13} />}
                                <span>{a.fileName || 'ফাইল'}</span>
                                <Download size={11} />
                              </button>
                            ))}
                          </div>
                        )}
                        {n.driveLinks?.length > 0 && (
                          <div className="nb-files">
                            {n.driveLinks.map((dl, di) => (
                              <a key={di} href={dl.url} target="_blank" rel="noreferrer"
                                className="nb-file-btn">
                                <ExternalLink size={12} />
                                <span>{dl.label || 'লিংক'}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* ── GRID SECTIONS (2-column) ── */}
          <section className="grid-sections">
            <div className="grid-sections-inner">
              {GRID_SECTIONS.map(sec => (
                <GridCard key={sec.id} sec={sec} />
              ))}
            </div>
          </section>

          {/* ── PHOTO GALLERY ── */}
          <section className="photo-gallery-section">
            <h2 className="pg-title">ফটো গ্যালারি</h2>
            <div className="pg-grid">
              {photoGallery.length > 0
                ? photoGallery.slice(0, 4).map((img, i) => (
                    <div key={i} className="pg-item">
                      <img src={img} alt={`গ্যালারি ${i + 1}`} />
                    </div>
                  ))
                : [1,2,3,4].map(i => (
                    <div key={i} className="pg-item pg-placeholder">
                      <ImageIcon size={40} color="#ccc" />
                    </div>
                  ))
              }
            </div>
            <div className="pg-more">
              <Link to="/gallery/photos" className="btn-more">আরো দেখুন →</Link>
            </div>
          </section>

          {/* ── RECENT VIDEO ── */}
          {settings.youtubeLink && (
            <section className="video-section">
              <h2 className="vs-title">সাম্প্রতিক ভিডিও</h2>
              <div className="vs-grid">
                <div className="vs-item">
                  <iframe
                    src={settings.youtubeLink.replace('watch?v=', 'embed/')}
                    title="কলেজ ভিডিও"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </section>
          )}

          {/* ── LOCATION MAP ── */}
          <section className="map-section">
            <h2 className="map-title">আমাদের অবস্থান</h2>
            <div className="map-frame">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2871.5546102087783!2d90.42362907405689!3d23.55754499615533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755a52601a27fdd%3A0x6efa6be14a5985c0!2sMalkhanagar%20College!5e1!3m2!1sen!2sbd!4v1765553683999!5m2!1sen!2sbd"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="College Location"
              />
            </div>
          </section>

        </div>{/* /home-main */}

        {/* ══════════════════════════════════════
            SIDEBAR
        ══════════════════════════════════════ */}
        <aside className="home-sidebar">

          {/* Principal message */}
          <div className="sb-card sb-principal">
            <div className="sb-head green">অধ্যক্ষের বাণী</div>
            <div className="sb-principal-img-wrap">
              <img src={principalImage} alt="অধ্যক্ষ" />
            </div>
            <Link to="/administration/principal" className="sb-view-link">
              View Details →
            </Link>
          </div>

          {/* Vice Principal */}
          <div className="sb-card">
            <div className="sb-head green">উপাধ্যক্ষের বাণী</div>
            <div className="sb-principal-img-wrap">
              <img src="/teacher.jpg" alt="উপাধ্যক্ষ" onError={e => e.target.src='/placeholder.png'} />
            </div>
            <Link to="/administration/teachers" className="sb-view-link">
              View Details →
            </Link>
          </div>

          {/* Important Links */}
          <div className="sb-card">
            <div className="sb-head green">গুরুত্বপূর্ণ লিংক</div>
            <ul className="sb-links-list">
              {IMPORTANT_LINKS.map((lk, i) => (
                <li key={i}>
                  <a href={lk.href} target="_blank" rel="noreferrer">
                    <span className="sb-link-arrow">›</span> {lk.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* College Facilities */}
          <div className="sb-card">
            <div className="sb-head green">কলেজ সুবিধাসমূহ</div>
            <ul className="sb-links-list">
              {FACILITIES.map((f, i) => (
                <li key={i}>
                  <span className="sb-link-arrow">›</span> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Mini Calendar */}
          <div className="sb-card">
            <div className="sb-head pink">ক্যালেন্ডার</div>
            <MiniCalendar />
          </div>

          {/* Emergency Hotline */}
          <div className="sb-card">
            <div className="sb-head green">জরুরি হটলাইন</div>
            <div className="hotline-grid">
              {[
                { num: '৩৩৩', lbl: 'সরকারি তথ্য ও সেবা', color: '#1565c0' },
                { num: '৯৯৯', lbl: 'জরুরি সেবা', color: '#c62828' },
                { num: '১০৯', lbl: 'নারী ও শিশু নির্যাতন প্রতিরোধে', color: '#e65100' },
                { num: '১০৬', lbl: 'দুদক', color: '#2e7d32' },
                { num: '১০৯০', lbl: 'দুর্যোগের আগাম বার্তা', color: '#1a237e' },
                { num: '১০৯৮', lbl: 'শিশু হেল্পলাইন', color: '#4a148c' },
              ].map((h, i) => (
                <div key={i} className="hotline-item" style={{ '--hc': h.color }}>
                  <div className="hotline-num">{h.num}</div>
                  <div className="hotline-lbl">{h.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="sb-card">
            <div className="sb-head green">সংক্ষিপ্ত পরিসংখ্যান</div>
            <div className="sb-stats">
              <div className="sb-stat-row">
                <span>👨‍🎓 শিক্ষার্থী</span>
                <strong>{settings.totalStudents || '৩০০০+'}</strong>
              </div>
              <div className="sb-stat-row">
                <span>👨‍🏫 শিক্ষক</span>
                <strong>{settings.totalTeachers || '৬০+'}</strong>
              </div>
              <div className="sb-stat-row">
                <span>👷 কর্মচারী</span>
                <strong>{settings.totalStaff || '৩০+'}</strong>
              </div>
            </div>
          </div>

        </aside>
      </div>{/* /home-body */}

      {/* Notice Viewer Modal */}
      {selAttach && (
        <NoticeViewer
          attachment={selAttach}
          onClose={() => setSelAttach(null)}
        />
      )}

    </div>
  );
};

export default Home;