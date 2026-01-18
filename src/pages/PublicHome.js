import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import Home from '../content/Home';
import About from '../content/About';
import Academic from '../content/Academic';
import Administration from '../content/Administration';
import Admission from '../content/Admission';
import Gallery from '../content/Gallery';
import Notice from '../content/Notice';
import Contact from '../content/Contact';

// About sub-pages
import CollegeHistory from '../content/about/CollegeHistory';
import MissionVision from '../content/about/MissionVision';
import Facilities from '../content/about/Facilities';
import Achievements from '../content/about/Achievements';

// Academic sub-pages
import Programs from '../content/academic/Programs';
import Departments from '../content/academic/Departments';
import Syllabus from '../content/academic/Syllabus';
import AcademicCalendar from '../content/academic/AcademicCalendar';

// Administration sub-pages
import GoverningBody from '../content/administration/GoverningBody';
import Principal from '../content/administration/Principal';
import Teachers from '../content/administration/Teachers';
import Staff from '../content/administration/Staff';
// ✅ NEW IMPORTS
import TeacherTraining from '../content/administration/TeacherTraining';
import ClubManagementPublic from '../content/administration/ClubManagement';

// Admission sub-pages
import AdmissionProcedure from '../content/admission/AdmissionProcedure';
import Requirements from '../content/admission/Requirements';
import ApplyOnline from '../content/admission/ApplyOnline';

// Gallery sub-pages
import PhotoGallery from '../content/gallery/PhotoGallery';
import VideoGallery from '../content/gallery/VideoGallery';
import Events from '../content/gallery/Events';

import './PublicHome.css';

const PublicHome = () => {
  const location = useLocation();
  const [settings, setSettings] = useState({
    schoolName: 'MALKHANAGAR COLLEGE',
    schoolAddress: 'Malkhanagar, Sirajdikhan, Dhaka',
    logo: '/logo.png',
    scrollingTexts: []
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await axios.get(
        `https://backend-yfp1.onrender.com/api/public/home?t=${timestamp}`
      );
      const websiteSettings = response.data.data?.websiteSettings || {};
      setSettings({
        schoolName: websiteSettings.schoolName || 'MALKHANAGAR COLLEGE',
        schoolAddress: websiteSettings.schoolAddress || 'Malkhanagar, Sirajdikhan, Dhaka',
        logo: websiteSettings.logo || '/logo.png',
        scrollingTexts: websiteSettings.scrollingTexts || []
      });
      setSettingsLoaded(true);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setSettingsLoaded(true);
    }
  };

  return (
    <div className="public-home">
      <PublicHeader 
        settings={settings} 
        currentPath={location.pathname}
        loading={!settingsLoaded}
      />

      <Routes>
        {/* Home Route */}
        <Route path="/" element={<Home />} />

        {/* Main Navigation Routes */}
        <Route path="/about" element={<About />} />
        <Route path="/academic" element={<Academic />} />
        <Route path="/administration" element={<Administration />} />
        <Route path="/admission" element={<Admission />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/contact" element={<Contact />} />

        {/* About Sub-routes */}
        <Route path="/about/history" element={<CollegeHistory />} />
        <Route path="/about/mission-vision" element={<MissionVision />} />
        <Route path="/about/facilities" element={<Facilities />} />
        <Route path="/about/achievements" element={<Achievements />} />

        {/* Academic Sub-routes */}
        <Route path="/academic/programs" element={<Programs />} />
        <Route path="/academic/departments" element={<Departments />} />
        <Route path="/academic/syllabus" element={<Syllabus />} />
        <Route path="/academic/calendar" element={<AcademicCalendar />} />

        {/* Administration Sub-routes */}
        <Route path="/administration/governing-body" element={<GoverningBody />} />
        <Route path="/administration/principal" element={<Principal />} />
        <Route path="/administration/teachers" element={<Teachers />} />
        <Route path="/administration/staff" element={<Staff />} />
        {/* ✅ NEW ROUTES */}
        <Route path="/administration/teacher-training" element={<TeacherTraining />} />
        <Route path="/administration/club-management" element={<ClubManagementPublic />} />

        {/* Admission Sub-routes */}
        <Route path="/admission/procedure" element={<AdmissionProcedure />} />
        <Route path="/admission/requirements" element={<Requirements />} />
        <Route path="/admission/apply" element={<ApplyOnline />} />

        {/* Gallery Sub-routes */}
        <Route path="/gallery/photos" element={<PhotoGallery />} />
        <Route path="/gallery/videos" element={<VideoGallery />} />
        <Route path="/gallery/events" element={<Events />} />
      </Routes>

      <PublicFooter settings={settings} />
    </div>
  );
};

export default PublicHome;



// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";
// import PublicHeader from "../components/PublicHeader";
// import PublicFooter from "../components/PublicFooter";
// import LazyImage from "../components/LazyImage";
// import { contentData } from "../data/contentData";
// import NoticeViewer from "../components/NoticeViewer";
// import noticeService from "../services/noticeService";
// import {
//   FileText,
//   Download,
//   Calendar,
//   Bell,
//   Image as ImageIcon,
// } from "lucide-react";
// import "./PublicHome.css";

// const PublicHome = () => {
//   const [homeData, setHomeData] = useState(null);
//   const [contentLoaded, setContentLoaded] = useState(false);
//   const [currentPath, setCurrentPath] = useState("/");
//   const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
//   const [isFading, setIsFading] = useState(false);
//   const [notices, setNotices] = useState([]);
//   const [showAllNotices, setShowAllNotices] = useState(false);
//   const [selectedAttachment, setSelectedAttachment] = useState(null);

//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     fetchHomeData();
//     fetchPublicNotices();
//   }, []);

//   useEffect(() => {
//     setCurrentPath(location.pathname);
//   }, [location]);

//   // Hero carousel auto-play
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
//       // Content loaded - show page with text, images will lazy load
//       setContentLoaded(true);
//     } catch (error) {
//       console.error("Failed to fetch home data:", error);
//       toast.error("Failed to load website data");
//       setContentLoaded(true);
//     }
//   };

//   const fetchPublicNotices = async () => {
//     try {
//       const response = await noticeService.getPublicNotices();
//       setNotices(response.data || []);
//     } catch (error) {
//       console.error("Failed to fetch notices:", error);
//     }
//   };

//   const handleNavigate = (path) => {
//     setCurrentPath(path);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleAttachmentClick = (attachment) => {
//     setSelectedAttachment(attachment);
//   };

//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString("en-GB", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const getCurrentContent = () => {
//     const pathKey = currentPath.substring(1) || "home";
//     return contentData[pathKey] || contentData.home;
//   };

//   const truncateText = (text, maxLength) => {
//     if (text.length <= maxLength) return text;
//     return text.substring(0, maxLength) + "...";
//   };

//   // Show simple loader only while fetching content
//   if (!contentLoaded) {
//     return (
//       <div className="public-home">
//         <div className="content-loading-screen">
//           <div className="simple-loader"></div>
//         </div>
//       </div>
//     );
//   }

//   const settings = homeData?.websiteSettings || {};
//   const heroImages = settings.heroImages || [];
//   const currentContent = getCurrentContent();

//   return (
//     <div className="public-home">
//       <Toaster position="top-right" />

//       {/* Header - Shows immediately */}
//       <PublicHeader
//         settings={settings}
//         onNavigate={handleNavigate}
//         currentPath={currentPath}
//       />

//       {/* Hero Carousel - Structure shows, images lazy load */}
//       {currentPath === "/" && heroImages.length > 0 && (
//         <section className="hero-image-carousel">
//           <div className="hero-carousel-wrapper">
//             {heroImages.map((image, index) => (
//               <div
//                 key={index}
//                 className={`hero-carousel-slide ${
//                   index === currentHeroSlide ? "active" : ""
//                 } ${isFading ? "fading" : ""}`}
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
//                       index === currentHeroSlide ? "active" : ""
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

//       {/* All Content - Text shows immediately, images lazy load */}
//       <section className="dynamic-content-section">
//         <div className="container">
//           {currentPath === "/" ? (
//             <>
//               {/* About Section */}
//               <section className="about-section" id="about">
//                 <div className="section-title">
//                   <h2>
//                     ABOUT{" "}
//                     {settings.schoolName?.toUpperCase() ||
//                       "MALKHANAGAR COLLEGE"}
//                   </h2>
//                   <div className="title-underline"></div>
//                 </div>
//                 <div className="about-content">
//                   {/* Image lazy loads */}
//                   <div className="about-image">
//                     <LazyImage
//                       src={settings.aboutImage || "/college.jpg"}
//                       alt="College Building"
//                       placeholderType="skeleton"
//                     />
//                   </div>
//                   {/* Text shows immediately */}
//                   <div className="about-text">
//                     <p className="about-intro about-large-text">
//                       মালখানগর কলেজ স্থানীয়ভাবে এই নামেই পরিচিত এবং শিক্ষা
//                 মন্ত্রণালয়ের অধীন মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর প্রদত্ত EIIN
//                 নম্বর ১৩৪৫৯০ বহন করে। প্রতিষ্ঠানটি ১ জুলাই ১৯৯২ সালে প্রতিষ্ঠিত
//                 হয় এবং ১ জুলাই ২০০২ সালে সরকারি স্বীকৃতি লাভ করে। এটি অনার্স
//                 পর্যায়ে অনুমোদিত একটি শিক্ষা প্রতিষ্ঠান এবং এমপিওভুক্ত, যার
//                 এমপিও রেজিস্ট্রেশন নম্বর ২৯০৪১২৩১০১। কলেজটি ঢাকা বোর্ডের অধীনে
//                 পরিচালিত হয়। এখানে বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা বিভাগ চালু
//                 আছে। গ্রামীণ এলাকায় অবস্থিত এই কলেজে বাংলা ভার্সনে পাঠদান করা
//                 হয়।
//                     </p>
//                     <p className="about-large-text">
//                       এছাড়া কলেজের পরিবেশ শান্ত ও শিক্ষাবান্ধব, যেখানে
//                   শিক্ষার্থীদের জন্য পর্যাপ্ত শ্রেণিকক্ষ, লাইব্রেরি ও
//                   প্রয়োজনীয় সুযোগ-সুবিধা রয়েছে। এলাকার শিক্ষার্থীদের
//                   উচ্চশিক্ষার সুযোগ বাড়াতে প্রতিষ্ঠানটি গুরুত্বপূর্ণ ভূমিকা
//                   রাখছে এবং মানসম্মত শিক্ষা প্রদানে নিয়মিত কাজ করে যাচ্ছে।
//                     </p>
//                   </div>
//                 </div>
//               </section>

//               {/* Principal Message */}
//               <section className="message-section chairman-section">
//                 <div className="container">
//                   <div className="section-title">
//                     <h2>MESSAGE FROM THE PRINCIPAL</h2>
//                     <div className="title-underline green"></div>
//                   </div>
//                   <div className="message-content">
//                     {/* Text shows immediately */}
//                     <div className="message-text">
//                       <p className="message-large-text">
//                         অধ্যক্ষের বাণী :
//                         <br/>
//                         মালখানগর কলেজ জ্ঞান, মূল্যবোধ ও আধুনিক শিক্ষার সমন্বয়ে একটি অগ্রসরমান প্রতিষ্ঠান। আমরা শিক্ষার্থীদের মেধা, দক্ষতা ও চরিত্র গঠনে প্রতিশ্রুতিবদ্ধ। প্রিয় শিক্ষার্থীরা—স্বপ্ন দেখো, শিখো এবং নৈতিকতা ও অধ্যবসায়ের সাথে এগিয়ে চলো। তোমাদের প্রতিটি অগ্রযাত্রায় মালখানগর কলেজ সর্বদা পাশে রয়েছে।

//                       </p>
//                     </div>
//                     {/* Image lazy loads */}
//                     <div className="message-author">
//                       <LazyImage
//                         src={settings.chairmanImage || "/sir.jpg"}
//                         alt="Principal"
//                         className="author-photo-wrapper"
//                         placeholderType="spinner"
//                       />
//                       <h3>অধ্যক্ষ (ভারপ্রাপ্ত) মালখানগর কলেজ</h3>
//                     </div>
//                   </div>
//                 </div>
//               </section>

//               {/* Notice Section - All text shows immediately */}
//               <section className="notice-section" id="notice">
//                 <div className="container">
//                   <div className="notice-header">
//                     <h2 className="notice-title">NOTICE BOARD</h2>
//                     <button
//                       className="btn-view-all"
//                       onClick={() => setShowAllNotices(!showAllNotices)}
//                     >
//                       {showAllNotices ? "SHOW LESS" : "VIEW ALL"}
//                     </button>
//                   </div>

//                   <div className="notice-content-wrapper">
//                     <div className="notice-board">
//                       {notices.length === 0 ? (
//                         <div className="no-notices">
//                           <Bell size={60} color="#ccc" />
//                           <p>No notices available</p>
//                         </div>
//                       ) : (
//                         <div className="notice-list-public">
//                           {(showAllNotices ? notices : notices.slice(0, 4)).map(
//                             (notice) => (
//                               <div
//                                 key={notice._id}
//                                 className="notice-item-public"
//                               >
//                                 <div className="notice-item-header">
//                                   <div className="notice-item-left">
//                                     <span
//                                       className={`notice-badge ${notice.type}`}
//                                     >
//                                       {notice.type}
//                                     </span>
//                                     <div className="notice-date-public">
//                                       <Calendar size={16} />
//                                       <span>
//                                         {formatDate(notice.publishDate)}
//                                       </span>
//                                     </div>
//                                   </div>
//                                   {notice.attachments &&
//                                     notice.attachments.length > 0 && (
//                                       <div className="notice-attachment-indicator">
//                                         📎 {notice.attachments.length}
//                                       </div>
//                                     )}
//                                 </div>

//                                 <h4>{truncateText(notice.title, 150)}</h4>
//                                 {/* <p className="notice-description">
//                                   {notice.description.substring(0, 150)}
//                                   {notice.description.length > 150 && "..."}
//                                 </p> */}

//                                 {notice.attachments &&
//                                   notice.attachments.length > 0 && (
//                                     <div className="notice-files-grid">
//                                       {notice.attachments.map(
//                                         (attachment, index) => (
//                                           <button
//                                             key={index}
//                                             className="file-preview-btn"
//                                             onClick={() =>
//                                               handleAttachmentClick(attachment)
//                                             }
//                                           >
//                                             {attachment.fileType === "pdf" ? (
//                                               <>
//                                                 <FileText size={18} />
//                                                 <span>PDF Document</span>
//                                               </>
//                                             ) : (
//                                               <>
//                                                 <ImageIcon size={18} />
//                                                 <span>Image File</span>
//                                               </>
//                                             )}
//                                             <Download
//                                               size={14}
//                                               className="download-icon"
//                                             />
//                                           </button>
//                                         )
//                                       )}
//                                     </div>
//                                   )}
//                               </div>
//                             )
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </section>

//               {/* Stats Section - Shows immediately */}
//               <section className="stats-section">
//                 <div className="container">
//                   <h2 className="stats-title">
//                     We are in <span className="highlight">Members</span> at a
//                     glance
//                   </h2>
//                   <div className="stats-grid">
//                     <div className="stat-box">
//                       <div className="stat-icon">
//                         <svg
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                         >
//                           <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
//                           <circle cx="9" cy="7" r="4"></circle>
//                           <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
//                           <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
//                         </svg>
//                       </div>
//                       <h3>{settings.totalStudents || 3200}</h3>
//                       <p>Student</p>
//                     </div>

//                     <div className="stat-box">
//                       <div className="stat-icon">
//                         <svg
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                         >
//                           <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
//                         </svg>
//                       </div>
//                       <h3>{settings.totalTeachers || 80}</h3>
//                       <p>Teachers</p>
//                     </div>

//                     <div className="stat-box">
//                       <div className="stat-icon">
//                         <svg
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                         >
//                           <rect
//                             x="2"
//                             y="7"
//                             width="20"
//                             height="14"
//                             rx="2"
//                             ry="2"
//                           ></rect>
//                           <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
//                         </svg>
//                       </div>
//                       <h3>{settings.totalStaff || 40}</h3>
//                       <p>Staffs</p>
//                     </div>
//                   </div>
//                 </div>
//               </section>

//               {/* Map Section - Shows immediately */}
//               <section className="map-section">
//                 <div className="container">
//                   <div className="section-title">
//                     <h2>MALKHANAGAR COLLEGE</h2>
//                     <div className="title-underline"></div>
//                   </div>
//                   <div className="map-container">
//                     <iframe
//                       src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2871.5546102087783!2d90.42362907405689!3d23.55754499615533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755a52601a27fdd%3A0x6efa6be14a5985c0!2sMalkhanagar%20College!5e1!3m2!1sen!2sbd!4v1765553683999!5m2!1sen!2sbd"
//                       width="100%"
//                       height="100%"
//                       style={{ border: 0 }}
//                       allowFullScreen=""
//                       loading="lazy"
//                       title="College Location"
//                     ></iframe>
//                   </div>
//                 </div>
//               </section>
//             </>
//           ) : (
//             <div className="page-content">
//               <div className="content-header">
//                 <h1>{currentContent.title}</h1>
//                 <div className="title-underline"></div>
//               </div>
//               <div
//                 className="content-body"
//                 dangerouslySetInnerHTML={{ __html: currentContent.content }}
//               />
//             </div>
//           )}
//         </div>
//       </section>


//       {selectedAttachment && (
//         <NoticeViewer
//           attachment={selectedAttachment}
//           onClose={() => setSelectedAttachment(null)}
//         />
//       )}

//       {/* Footer - Shows immediately */}
//       <PublicFooter settings={settings} />
//     </div>
//   );
// };

// export default PublicHome;