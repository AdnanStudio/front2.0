import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  FileText,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Menu,
  X,
  Facebook,
  Youtube,
  Bell,
  Image as ImageIcon,
} from "lucide-react";
import NoticeViewer from "../components/NoticeViewer";
import noticeService from "../services/noticeService";
import "./PublicHome.css";

const PublicHome = () => {
  // All State Variables
  const [homeData, setHomeData] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [notices, setNotices] = useState([]);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [scrollingPaused, setScrollingPaused] = useState(false);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const navigate = useNavigate();

  // Initial data fetch
  useEffect(() => {
    fetchHomeData();
  }, []);

  // Fetch notices for public home
  useEffect(() => {
    fetchPublicNotices();
  }, []);

  // Check for update notification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("updated") === "true") {
      toast.success("Website content updated successfully!", {
        duration: 4000,
        icon: "✅",
      });
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (homeData?.carousels?.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % homeData.carousels.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [homeData]);

  // Auto-play hero carousel with fade effect (10 seconds)
  useEffect(() => {
    const heroImages = homeData?.websiteSettings?.heroImages || [];
    if (heroImages.length > 0) {
      const timer = setInterval(() => {
        setIsFading(true);

        setTimeout(() => {
          setCurrentHeroSlide((prev) => {
            if (prev === heroImages.length - 1) {
              return 0;
            }
            return prev + 1;
          });
          setIsFading(false);
        }, 500);
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [homeData]);

  // Auto-rotate news headlines (5 seconds)
  useEffect(() => {
    if (homeData?.blogs?.length > 0) {
      const timer = setInterval(() => {
        setCurrentNewsIndex((prev) => (prev + 1) % homeData.blogs.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [homeData]);

  // Scroll Animation Effect
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated");
        }
      });
    }, observerOptions);

    // Select all elements to animate (excluding header, footer, hero)
    const elementsToAnimate = document.querySelectorAll(
      ".about-section, .message-section, .notice-section, .stats-section, .map-section, " +
        ".about-image, .about-text, .message-author, .message-text, " +
        ".notice-item-public, .stat-box, .section-title"
    );

    elementsToAnimate.forEach((el) => {
      el.classList.add("animate-on-scroll");
      observer.observe(el);
    });

    return () => {
      elementsToAnimate.forEach((el) => observer.unobserve(el));
    };
  }, [homeData]);

  // Fetch home data from API
  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      const response = await axios.get(
        `https://backend-yfp1.onrender.com/api/public/home?t=${timestamp}`
      );

      console.log("✅ Home Data Loaded:", response.data.data);
      setHomeData(response.data.data);
    } catch (error) {
      console.error("❌ Failed to fetch home data:", error);
      toast.error("Failed to load website data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch public notices
  const fetchPublicNotices = async () => {
    try {
      const response = await noticeService.getPublicNotices();
      console.log("✅ Public Notices Loaded:", response.data);
      setNotices(response.data || []);
    } catch (error) {
      console.error("❌ Failed to fetch public notices:", error);
    }
  };

  // Carousel navigation
  const nextSlide = () => {
    if (homeData?.carousels?.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % homeData.carousels.length);
    }
  };

  const prevSlide = () => {
    if (homeData?.carousels?.length > 0) {
      setCurrentSlide(
        (prev) =>
          (prev - 1 + homeData.carousels.length) % homeData.carousels.length
      );
    }
  };

  // Handle attachment click to open viewer
  const handleAttachmentClick = (attachment) => {
    setSelectedAttachment(attachment);
  };

  // Format date helper
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Scrolling text pause/resume handlers
  const handleScrollingMouseEnter = () => {
    setScrollingPaused(true);
  };

  const handleScrollingMouseLeave = () => {
    setScrollingPaused(false);
  };

  const handleScrollingClick = () => {
    setScrollingPaused(!scrollingPaused);
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large"></div>
      </div>
    );
  }

  // Extract data from homeData
  const settings = homeData?.websiteSettings || {};
  const carousels = homeData?.carousels || [];
  const blogs = homeData?.blogs || [];
  const principalInfo = homeData?.principalInfo;

  // Dynamic hero images from backend
  const heroImages = homeData?.websiteSettings?.heroImages || [
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&h=600&fit=crop",
  ];

  return (
    <div className="public-home">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="main-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <img
                src={settings.logo || "/logo.png"}
                alt="School Logo"
                className="school-logo"
                onError={(e) => {
                  console.log("Logo load error");
                  e.target.src = "https://via.placeholder.com/80";
                }}
              />
              <div className="school-info">
                <h1>{settings.schoolName || "MALKHANAGAR COLLEGE"}</h1>
                <p className="school-subtitle">HSC - HONOURS / EIIN : 134590</p>
                <p className="school-address">
                  {settings.schoolAddress || "Malkhanagar, Dhaka"}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="desktop-nav">
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#academic">Academic</a>
              <a href="/admission">Admission</a>
              <a href="#notice">Notice</a>
              <a href="#gallery">Gallery</a>
              <a href="#contact">Contact</a>
              <button className="btn-login" onClick={() => navigate("/login")}>
                Login
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Dynamic Scrolling Text from Backend */}
        <div
          className="scrolling-text-container"
          onMouseEnter={handleScrollingMouseEnter}
          onMouseLeave={handleScrollingMouseLeave}
          onClick={handleScrollingClick}
          style={{ cursor: "pointer" }}
        >
          <div className={`scrolling-text ${scrollingPaused ? "paused" : ""}`}>
            {settings.scrollingTexts && settings.scrollingTexts.length > 0 ? (
              <>
                {settings.scrollingTexts.map((item, index) => (
                  <span key={index}>• {item.text} •</span>
                ))}
              </>
            ) : (
              <>
                <span>
                  
                </span>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mobile-nav">
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>
              About
            </a>
            <a href="#academic" onClick={() => setMobileMenuOpen(false)}>
              Academic
            </a>
            <a href="#administration" onClick={() => setMobileMenuOpen(false)}>
              Administration
            </a>
            <a href="#admission" onClick={() => setMobileMenuOpen(false)}>
              Admission
            </a>
            <a href="#notice" onClick={() => setMobileMenuOpen(false)}>
              Notice
            </a>
            <a href="#gallery" onClick={() => setMobileMenuOpen(false)}>
              Gallery
            </a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </a>
            <button
              className="btn-login-mobile"
              onClick={() => {
                navigate("/login");
                setMobileMenuOpen(false);
              }}
            >
              Login
            </button>
          </div>
        )}
      </header>

      {/* Hero Image Carousel */}
      <section className="hero-image-carousel">
        <div className="hero-carousel-wrapper">
          {heroImages.length > 0 ? (
            heroImages.map((image, index) => (
              <div
                key={index}
                className={`hero-carousel-slide ${
                  index === currentHeroSlide ? "active" : ""
                } ${isFading ? "fading" : ""}`}
              >
                <img
                  src={image}
                  alt={`Hero ${index + 1}`}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/1920x600";
                  }}
                />
              </div>
            ))
          ) : (
            <div className="hero-carousel-slide active">
              <img
                src="https://via.placeholder.com/1920x600"
                alt="Hero Placeholder"
              />
            </div>
          )}

          {/* Carousel Indicators */}
          {heroImages.length > 1 && (
            <div className="hero-carousel-dots">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  className={`hero-dot ${
                    index === currentHeroSlide ? "active" : ""
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

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="container">
          <div className="section-title">
            <h2>
              ABOUT{" "}
              {settings.schoolName?.toUpperCase() || "MALKHANAGAR COLLEGE"}
            </h2>
            <div className="title-underline"></div>
          </div>
          <div className="about-content">
            <div className="about-image">
              {settings.aboutImage || "/college.jpg" ? (
                <img
                  src={settings.aboutImage || "/college.jpg"}
                  alt="College Building"
                  onError={(e) => {
                    console.log("About image load error");
                    e.target.src = "https://via.placeholder.com/500x400";
                  }}
                />
              ) : (
                <div className="image-placeholder">
                  <p>About Image</p>
                </div>
              )}
            </div>

            <div className="about-text">
              <p className="about-intro about-large-text">
                মালখানগর কলেজ স্থানীয়ভাবে এই নামেই পরিচিত এবং শিক্ষা
                মন্ত্রণালয়ের অধীন মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর প্রদত্ত EIIN
                নম্বর ১৩৪৫৯০ বহন করে। প্রতিষ্ঠানটি ১ জুলাই ১৯৯২ সালে প্রতিষ্ঠিত
                হয় এবং ১ জুলাই ২০০২ সালে সরকারি স্বীকৃতি লাভ করে। এটি অনার্স
                পর্যায়ে অনুমোদিত একটি শিক্ষা প্রতিষ্ঠান এবং এমপিওভুক্ত, যার
                এমপিও রেজিস্ট্রেশন নম্বর ২৯০৪১২৩১০১। কলেজটি ঢাকা বোর্ডের অধীনে
                পরিচালিত হয়। এখানে বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা বিভাগ চালু
                আছে। গ্রামীণ এলাকায় অবস্থিত এই কলেজে বাংলা ভার্সনে পাঠদান করা
                হয়।
              </p>

              {settings.aboutText ? (
                <p>{settings.aboutText}</p>
              ) : (
                <p className="about-large-text">
                  এছাড়া কলেজের পরিবেশ শান্ত ও শিক্ষাবান্ধব, যেখানে
                  শিক্ষার্থীদের জন্য পর্যাপ্ত শ্রেণিকক্ষ, লাইব্রেরি ও
                  প্রয়োজনীয় সুযোগ-সুবিধা রয়েছে। এলাকার শিক্ষার্থীদের
                  উচ্চশিক্ষার সুযোগ বাড়াতে প্রতিষ্ঠানটি গুরুত্বপূর্ণ ভূমিকা
                  রাখছে এবং মানসম্মত শিক্ষা প্রদানে নিয়মিত কাজ করে যাচ্ছে।
                </p>
              )}

              {settings.visionMission && (
                <p>
                  <strong>{settings.visionMission}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Chairman Message */}
      <section className="message-section chairman-section">
        <div className="container">
          <div className="section-title">
            <h2>MESSAGE FROM THE PRINCIPAL</h2>
            <div className="title-underline green"></div>
          </div>
          <div className="message-content">
            <div className="message-text">
              <p className="message-large-text"></p>
              <p className="message-large-text">
                মালখানগর কলেজ জ্ঞান, মূল্যবোধ ও আধুনিক শিক্ষার সমন্বয়ে একটি
                অগ্রসরমান প্রতিষ্ঠান। আমরা শিক্ষার্থীদের মেধা, দক্ষতা ও চরিত্র
                গঠনে প্রতিশ্রুতিবদ্ধ। প্রিয় শিক্ষার্থীরা—স্বপ্ন দেখো, শিখো এবং
                নৈতিকতা ও অধ্যবসায়ের সাথে এগিয়ে চলো। তোমাদের প্রতিটি
                অগ্রযাত্রায় মালখানগর কলেজ সর্বদা পাশে রয়েছে।
              </p>
            </div>
            <div className="message-author">
              <img
                src={settings.chairmanImage || "/sir.jpg"}
                alt="Chairman"
                className="author-photo"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/200x200";
                }}
              />
              <h3>অধ্যক্ষ (ভারপ্রাপ্ত) মালখানগর কলেজ</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Principal Message */}
      {principalInfo && (
        <section className="message-section principal-section">
          <div className="container">
            <div className="section-title">
              <h2>MESSAGE FROM THE PRINCIPAL</h2>
              <div className="title-underline blue"></div>
            </div>
            <div className="message-content reverse">
              <div className="message-author">
                <img
                  src={
                    principalInfo.image || "https://via.placeholder.com/200x200"
                  }
                  alt={principalInfo.name}
                  className="author-photo"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/200x200";
                  }}
                />
                <h3>{principalInfo.name}</h3>
                <p>Principal, {settings.schoolName || "Ideal College"}</p>
              </div>
              <div className="message-text">
                <p>{principalInfo.message}</p>
                {principalInfo.qualification && (
                  <p className="qualification">
                    <em>{principalInfo.qualification}</em>
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Notice Section with Side Image */}
      <section className="notice-section" id="notice">
        <div className="container">
          <div className="notice-header">
            <h2 className="notice-title">NOTICE BOARD</h2>
            <button
              className="btn-view-all"
              onClick={() => setShowAllNotices(!showAllNotices)}
            >
              {showAllNotices ? "SHOW LESS" : "VIEW ALL"}
            </button>
          </div>

          <div className="notice-content-wrapper">
            <div className="notice-board">
              {notices.length === 0 ? (
                <div className="no-notices">
                  <Bell size={60} color="#ccc" />
                  <p>No notices available at the moment</p>
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

                          {notice.attachments &&
                            notice.attachments.length > 0 && (
                              <div className="notice-attachment-indicator">
                                📎 {notice.attachments.length}
                              </div>
                            )}
                        </div>

                        <h4>{notice.title}</h4>

                        <p className="notice-description">
                          {notice.description.substring(0, 150)}
                          {notice.description.length > 150 && "..."}
                        </p>

                        {notice.attachments &&
                          notice.attachments.length > 0 && (
                            <div className="notice-files-grid">
                              {notice.attachments.map((attachment, index) => (
                                <button
                                  key={index}
                                  className="file-preview-btn"
                                  onClick={() =>
                                    handleAttachmentClick(attachment)
                                  }
                                >
                                  {attachment.fileType === "pdf" ? (
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
                                  <Download
                                    size={14}
                                    className="download-icon"
                                  />
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

      {/* Notice Viewer Modal */}
      {selectedAttachment && (
        <NoticeViewer
          attachment={selectedAttachment}
          onClose={() => setSelectedAttachment(null)}
        />
      )}

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <h2 className="stats-title">
            We are in <span className="highlight">Members</span> at a glance
          </h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3>{settings.totalTeachers || 80}</h3>
              <p>Teachers</p>
            </div>

            <div className="stat-box">
              <div className="stat-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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

      {/* Google Map Section */}
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
              referrerPolicy="no-referrer-when-downgrade"
              title="Malkhanagar College Location"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-logo-section">
                {settings.logo || "/logo.png" ? (
                  <img
                    src={settings.logo || "/logo.png"}
                    alt="Logo"
                    className="footer-logo"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/60";
                    }}
                  />
                ) : (
                  <div className="footer-logo-placeholder">LOGO</div>
                )}
                <h3>{settings.schoolName || "Malkhanagar College"}</h3>
              </div>

              <div className="footer-address">
                <p>
                  <strong>
                    {settings.schoolName || "Malkhanagar College"}, Sirajdikhan
                  </strong>
                </p>
                <p>Address: {settings.schoolAddress || "Sirajdikhan, Dhaka"}</p>
                <p>Phone: {settings.schoolPhone || "+880 1234-xxxxxxx"}</p>
                <p>
                  Email:{" "}
                  {settings.schoolEmail || "malkhanagarcollege@gmail.com"}
                </p>
              </div>
            </div>

            <div className="footer-col">
              <h4>Ministry of Education</h4>
              <ul className="footer-links">
                <li>
                  <a href="#">Secondary and Higher Secondary Education Board</a>
                </li>
                <li>
                  <a href="#">Chittagong Board</a>
                </li>
                <li>
                  <a href="#">NCTB</a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Social Media</h4>
              <div className="social-icons">
                <a
                  href={settings.facebookLink || "https://www.facebook.com/malkhanagar.UC"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook size={24} />
                </a>

                <a
                  href={settings.youtubeLink || "https://youtube.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Youtube size={24} />
                </a>

                <a
                  href={settings.whatsappLink || "https://wa.me/"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
              </div>

              <div className="app-download">
                <h4>Download Our App</h4>
                <div className="app-buttons">
                  {settings.playStoreLink ? (
                    <a
                      href={settings.playStoreLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                        alt="Google Play"
                      />
                    </a>
                  ) : (
                    <a
                      href="https://play.google.com/store"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                        alt="Google Play"
                      />
                    </a>
                  )}
                  {settings.appStoreLink && (
                    <a
                      href={settings.appStoreLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                        alt="App Store"
                      />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              &copy; All Rights Reserved of{" "}
              {settings.schoolName || "MALKHANAGAR COLLEGE"}. 2025
            </p>
            <p>
              Developed by{" "}
              <a
                href="https://amaderwebsite.com.bd/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Amader Website
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHome;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import toast, { Toaster } from 'react-hot-toast';
// import {
//   FileText,
//   Download,
//   ExternalLink,
//   ChevronLeft,
//   ChevronRight,
//   Calendar,
//   Menu,
//   X,
//   Facebook,
//   Youtube,
//   Bell,
//   Image as ImageIcon
// } from 'lucide-react';
// import NoticeViewer from '../components/NoticeViewer';
// import noticeService from '../services/noticeService';
// import './PublicHome.css';

// const PublicHome = () => {
//   // All State Variables
//   const [homeData, setHomeData] = useState(null);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [showAllNotices, setShowAllNotices] = useState(false);
//   const [notices, setNotices] = useState([]);
//   const [selectedAttachment, setSelectedAttachment] = useState(null);
//   const [scrollingPaused, setScrollingPaused] = useState(false);
//   const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
//   const [isFading, setIsFading] = useState(false);

//   const navigate = useNavigate();

//   // Initial data fetch
//   useEffect(() => {
//     fetchHomeData();
//   }, []);

//   // Fetch notices for public home
//   useEffect(() => {
//     fetchPublicNotices();
//   }, []);

//   // Check for update notification
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     if (urlParams.get('updated') === 'true') {
//       toast.success('Website content updated successfully!', {
//         duration: 4000,
//         icon: '✅'
//       });
//       window.history.replaceState({}, document.title, '/');
//     }
//   }, []);

//   // Auto-play carousel
//   useEffect(() => {
//     if (homeData?.carousels?.length > 0) {
//       const timer = setInterval(() => {
//         setCurrentSlide((prev) => (prev + 1) % homeData.carousels.length);
//       }, 5000);
//       return () => clearInterval(timer);
//     }
//   }, [homeData]);

//   // Auto-play hero carousel with fade effect (10 seconds)
//   useEffect(() => {
//     const heroImages = homeData?.websiteSettings?.heroImages || [];
//     if (heroImages.length > 0) {
//       const timer = setInterval(() => {
//         setIsFading(true);

//         setTimeout(() => {
//           setCurrentHeroSlide((prev) => {
//             if (prev === heroImages.length - 1) {
//               return 0;
//             }
//             return prev + 1;
//           });
//           setIsFading(false);
//         }, 500);

//       }, 10000);
//       return () => clearInterval(timer);
//     }
//   }, [homeData]);

//   // Auto-rotate news headlines (5 seconds)
//   useEffect(() => {
//     if (homeData?.blogs?.length > 0) {
//       const timer = setInterval(() => {
//         setCurrentNewsIndex((prev) => (prev + 1) % homeData.blogs.length);
//       }, 5000);
//       return () => clearInterval(timer);
//     }
//   }, [homeData]);

//   // Fetch home data from API
//   const fetchHomeData = async () => {
//     try {
//       setLoading(true);
//       const timestamp = new Date().getTime();
//       const response = await axios.get(`http://localhost:5000/api/public/home?t=${timestamp}`);

//       console.log('✅ Home Data Loaded:', response.data.data);
//       setHomeData(response.data.data);
//     } catch (error) {
//       console.error('❌ Failed to fetch home data:', error);
//       toast.error('Failed to load website data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch public notices
//   const fetchPublicNotices = async () => {
//     try {
//       const response = await noticeService.getPublicNotices();
//       console.log('✅ Public Notices Loaded:', response.data);
//       setNotices(response.data || []);
//     } catch (error) {
//       console.error('❌ Failed to fetch public notices:', error);
//     }
//   };

//   // Carousel navigation
//   const nextSlide = () => {
//     if (homeData?.carousels?.length > 0) {
//       setCurrentSlide((prev) => (prev + 1) % homeData.carousels.length);
//     }
//   };

//   const prevSlide = () => {
//     if (homeData?.carousels?.length > 0) {
//       setCurrentSlide((prev) => (prev - 1 + homeData.carousels.length) % homeData.carousels.length);
//     }
//   };

//   // Handle attachment click to open viewer
//   const handleAttachmentClick = (attachment) => {
//     setSelectedAttachment(attachment);
//   };

//   // Format date helper
//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString('en-GB', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   // Scrolling text pause/resume handlers
//   const handleScrollingMouseEnter = () => {
//     setScrollingPaused(true);
//   };

//   const handleScrollingMouseLeave = () => {
//     setScrollingPaused(false);
//   };

//   const handleScrollingClick = () => {
//     setScrollingPaused(!scrollingPaused);
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="loading-screen">
//         <div className="spinner-large"></div>
//       </div>
//     );
//   }

//   // Extract data from homeData
//   const settings = homeData?.websiteSettings || {};
//   const carousels = homeData?.carousels || [];
//   const blogs = homeData?.blogs || [];
//   const principalInfo = homeData?.principalInfo;

//   // Dynamic hero images from backend
//   const heroImages = homeData?.websiteSettings?.heroImages || [
//     'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&h=600&fit=crop'
//   ];

//   return (
//     <div className="public-home">
//       <Toaster position="top-right" />

//       {/* Header */}
//       <header className="main-header">
//         <div className="container">
//           <div className="header-content">
//             <div className="logo-section">
//               <img
//                 src={settings.logo || "/logo.png"}
//                 alt="School Logo"
//                 className="school-logo"
//                 onError={(e) => {
//                   console.log("Logo load error");
//                   e.target.src = "https://via.placeholder.com/80";
//                 }}
//               />
//               <div className="school-info">
//                 <h1>{settings.schoolName || "MALKHANAGAR COLLEGE"}</h1>
//                 <p className="school-subtitle">HSC - HONOURS / EIIN : 134590</p>
//                 <p className="school-address">{settings.schoolAddress || "Malkhanagar, Dhaka"}</p>
//               </div>
//             </div>

//             {/* Desktop Navigation */}
//             <nav className="desktop-nav">
//               <a href="#home">Home</a>
//               <a href="#about">About</a>
//               <a href="#academic">Academic</a>
//               <a href="/admission">Admission</a>
//               <a href="#notice">Notice</a>
//               <a href="#gallery">Gallery</a>
//               <a href="#contact">Contact</a>
//               <button className="btn-login" onClick={() => navigate("/login")}>
//                 Login
//               </button>
//             </nav>

//             {/* Mobile Menu Button */}
//             <button
//               className="mobile-menu-btn"
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             >
//               {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
//             </button>
//           </div>
//         </div>

//         {/* Dynamic Scrolling Text from Backend */}
//         <div
//           className="scrolling-text-container"
//           onMouseEnter={handleScrollingMouseEnter}
//           onMouseLeave={handleScrollingMouseLeave}
//           onClick={handleScrollingClick}
//           style={{ cursor: "pointer" }}
//         >
//           <div className={`scrolling-text ${scrollingPaused ? "paused" : ""}`}>
//             {settings.scrollingTexts && settings.scrollingTexts.length > 0 ? (
//               settings.scrollingTexts.map((item, index) => (
//                 <span key={index}>• {item.text} •</span>
//               ))
//             ) : (
//               <>
//                 <span>• আগামীকাল মালখানগর কলেজে সকল ক্লাস সাময়িকভাবে বন্ধ থাকবে •</span>
//                 <span>• পরীক্ষার রুটিন কলেজ ওয়েবসাইটে প্রকাশ হয়েছে •</span>
//                 <span>• নতুন শিক্ষার্থীদের আইডি কার্ড বিতরণ রবিবার সকাল দশটায় শুরু হবে •</span>
//               </>
//             )}
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         {mobileMenuOpen && (
//           <div className="mobile-nav">
//             <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
//             <a href="#academic" onClick={() => setMobileMenuOpen(false)}>Academic</a>
//             <a href="#administration" onClick={() => setMobileMenuOpen(false)}>Administration</a>
//             <a href="#admission" onClick={() => setMobileMenuOpen(false)}>Admission</a>
//             <a href="#notice" onClick={() => setMobileMenuOpen(false)}>Notice</a>
//             <a href="#gallery" onClick={() => setMobileMenuOpen(false)}>Gallery</a>
//             <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
//             <button
//               className="btn-login-mobile"
//               onClick={() => {
//                 navigate("/login");
//                 setMobileMenuOpen(false);
//               }}
//             >
//               Login
//             </button>
//           </div>
//         )}
//       </header>

//       {/* Hero Image Carousel */}
//       <section className="hero-image-carousel">
//         <div className="hero-carousel-wrapper">
//           {heroImages.length > 0 ? (
//             heroImages.map((image, index) => (
//               <div
//                 key={index}
//                 className={`hero-carousel-slide ${index === currentHeroSlide ? 'active' : ''} ${isFading ? 'fading' : ''}`}
//               >
//                 <img
//                   src={image}
//                   alt={`Hero ${index + 1}`}
//                   onError={(e) => {
//                     e.target.src = 'https://via.placeholder.com/1920x600';
//                   }}
//                 />
//               </div>
//             ))
//           ) : (
//             <div className="hero-carousel-slide active">
//               <img
//                 src="https://via.placeholder.com/1920x600"
//                 alt="Hero Placeholder"
//               />
//             </div>
//           )}

//           {/* Carousel Indicators */}
//           {heroImages.length > 1 && (
//             <div className="hero-carousel-dots">
//               {heroImages.map((_, index) => (
//                 <button
//                   key={index}
//                   className={`hero-dot ${index === currentHeroSlide ? 'active' : ''}`}
//                   onClick={() => {
//                     setIsFading(true);
//                     setTimeout(() => {
//                       setCurrentHeroSlide(index);
//                       setIsFading(false);
//                     }, 500);
//                   }}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </section>

//       {/* About Section */}
//       <section className="about-section" id="about">
//         <div className="container">
//           <div className="section-title">
//             <h2>ABOUT {settings.schoolName?.toUpperCase() || 'MALKHANAGAR COLLEGE'}</h2>
//             <div className="title-underline"></div>
//           </div>
//           <div className="about-content">
//             <div className="about-image">
//               {settings.aboutImage || "/college.jpg" ? (
//                 <img
//                   src={settings.aboutImage || "/college.jpg"}
//                   alt="College Building"
//                   onError={(e) => {
//                     console.log('About image load error');
//                     e.target.src = 'https://via.placeholder.com/500x400';
//                   }}
//                 />
//               ) : (
//                 <div className="image-placeholder">
//                   <p>About Image</p>
//                 </div>
//               )}
//             </div>

//             <div className="about-text">
//               <p className="about-intro about-large-text">
//                 মালখানগর কলেজ স্থানীয়ভাবে এই নামেই পরিচিত এবং শিক্ষা মন্ত্রণালয়ের অধীন মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর প্রদত্ত EIIN নম্বর ১৩৪৫৯০ বহন করে। প্রতিষ্ঠানটি ১ জুলাই ১৯৯২ সালে প্রতিষ্ঠিত হয় এবং ১ জুলাই ২০০২ সালে সরকারি স্বীকৃতি লাভ করে। এটি অনার্স পর্যায়ে অনুমোদিত একটি শিক্ষা প্রতিষ্ঠান এবং এমপিওভুক্ত, যার এমপিও রেজিস্ট্রেশন নম্বর ২৯০৪১২৩১০১। কলেজটি ঢাকা বোর্ডের অধীনে পরিচালিত হয়। এখানে বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা বিভাগ চালু আছে। প্রতিষ্ঠানটি ডে শিফটে ক্লাস পরিচালনা করে এবং গভর্নিং বডি কর্তৃক পরিচালিত হয়। গ্রামীণ এলাকায় অবস্থিত এই কলেজে বাংলা ভার্সনে পাঠদান করা হয়।
//               </p>

//               {settings.aboutText ? (
//                 <p>{settings.aboutText}</p>
//               ) : (
//                 <p className="about-large-text">
//                   এছাড়া কলেজের পরিবেশ শান্ত ও শিক্ষাবান্ধব, যেখানে শিক্ষার্থীদের জন্য পর্যাপ্ত শ্রেণিকক্ষ, লাইব্রেরি ও প্রয়োজনীয় সুযোগ-সুবিধা রয়েছে। এলাকার শিক্ষার্থীদের উচ্চশিক্ষার সুযোগ বাড়াতে প্রতিষ্ঠানটি গুরুত্বপূর্ণ ভূমিকা রাখছে এবং মানসম্মত শিক্ষা প্রদানে নিয়মিত কাজ করে যাচ্ছে।
//                 </p>
//               )}

//               {settings.visionMission && (
//                 <p><strong>{settings.visionMission}</strong></p>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Chairman Message */}
//       <section className="message-section chairman-section">
//         <div className="container">
//           <div className="section-title">
//             <h2>MESSAGE FROM THE PRINCIPAL</h2>
//             <div className="title-underline green"></div>
//           </div>
//           <div className="message-content">
//             <div className="message-text">
//               <p className="message-large-text">

//               </p>
//               <p className="message-large-text">
//                 মালখানগর কলেজ জ্ঞান, মূল্যবোধ ও আধুনিক শিক্ষার সমন্বয়ে একটি অগ্রসরমান প্রতিষ্ঠান। আমরা শিক্ষার্থীদের মেধা, দক্ষতা ও চরিত্র গঠনে প্রতিশ্রুতিবদ্ধ। প্রিয় শিক্ষার্থীরা—স্বপ্ন দেখো, শিখো এবং নৈতিকতা ও অধ্যবসায়ের সাথে এগিয়ে চলো। তোমাদের প্রতিটি অগ্রযাত্রায় মালখানগর কলেজ সর্বদা পাশে রয়েছে।
//               </p>
//             </div>
//             <div className="message-author">
//               <img
//                 src={settings.chairmanImage || '/sir.jpg'}
//                 alt="Chairman"
//                 className="author-photo"
//                 onError={(e) => {
//                   e.target.src = 'https://via.placeholder.com/200x200';
//                 }}
//               />
//               <h3>অধ্যক্ষ (ভারপ্রাপ্ত) মালখানগর কলেজ</h3>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Principal Message */}
//       {principalInfo && (
//         <section className="message-section principal-section">
//           <div className="container">
//             <div className="section-title">
//               <h2>MESSAGE FROM THE PRINCIPAL</h2>
//               <div className="title-underline blue"></div>
//             </div>
//             <div className="message-content reverse">
//               <div className="message-author">
//                 <img
//                   src={principalInfo.image || 'https://via.placeholder.com/200x200'}
//                   alt={principalInfo.name}
//                   className="author-photo"
//                   onError={(e) => {
//                     e.target.src = 'https://via.placeholder.com/200x200';
//                   }}
//                 />
//                 <h3>{principalInfo.name}</h3>
//                 <p>Principal, {settings.schoolName || 'Ideal College'}</p>
//               </div>
//               <div className="message-text">
//                 <p>{principalInfo.message}</p>
//                 {principalInfo.qualification && (
//                   <p className="qualification"><em>{principalInfo.qualification}</em></p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Notice Section with Side Image */}
//       <section className="notice-section" id="notice">
//         <div className="container">
//           <div className="notice-header">
//             <h2 className="notice-title">NOTICE BOARD</h2>
//             <button className="btn-view-all" onClick={() => setShowAllNotices(!showAllNotices)}>
//               {showAllNotices ? 'SHOW LESS' : 'VIEW ALL'}
//             </button>
//           </div>

//           <div className="notice-content-wrapper">
//             <div className="notice-board">
//               {notices.length === 0 ? (
//                 <div className="no-notices">
//                   <Bell size={60} color="#ccc" />
//                   <p>No notices available at the moment</p>
//                 </div>
//               ) : (
//                 <div className="notice-list-public">
//                   {(showAllNotices ? notices : notices.slice(0, 4)).map((notice) => (
//                     <div
//                       key={notice._id}
//                       className="notice-item-public"
//                     >
//                       <div className="notice-item-header">
//                         <div className="notice-item-left">
//                           <span className={`notice-badge ${notice.type}`}>
//                             {notice.type}
//                           </span>

//                           <div className="notice-date-public">
//                             <Calendar size={16} />
//                             <span>{formatDate(notice.publishDate)}</span>
//                           </div>
//                         </div>

//                         {notice.attachments && notice.attachments.length > 0 && (
//                           <div className="notice-attachment-indicator">
//                             📎 {notice.attachments.length}
//                           </div>
//                         )}
//                       </div>

//                       <h4>{notice.title}</h4>

//                       <p className="notice-description">
//                         {notice.description.substring(0, 150)}
//                         {notice.description.length > 150 && '...'}
//                       </p>

//                       {notice.attachments && notice.attachments.length > 0 && (
//                         <div className="notice-files-grid">
//                           {notice.attachments.map((attachment, index) => (
//                             <button
//                               key={index}
//                               className="file-preview-btn"
//                               onClick={() => handleAttachmentClick(attachment)}
//                             >
//                               {attachment.fileType === 'pdf' ? (
//                                 <>
//                                   <FileText size={18} />
//                                   <span>PDF Document</span>
//                                 </>
//                               ) : (
//                                 <>
//                                   <ImageIcon size={18} />
//                                   <span>Image File</span>
//                                 </>
//                               )}
//                               <Download size={14} className="download-icon" />
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Notice Side Image - 16:9 ratio */}
//             {/* <div className="notice-side-image">
//               <img
//                 src={settings.noticeImage || "/call.png"}
//                 alt="Notice Board"
//                 onError={(e) => {
//                   e.target.src = 'https://via.placeholder.com/800x450';
//                 }}
//               />
//             </div> */}
//           </div>
//         </div>
//       </section>

//       {/* Notice Viewer Modal */}
//       {selectedAttachment && (
//         <NoticeViewer
//           attachment={selectedAttachment}
//           onClose={() => setSelectedAttachment(null)}
//         />
//       )}

//       {/* Stats Section */}
//       <section className="stats-section">
//         <div className="container">
//           <h2 className="stats-title">We are in <span className="highlight">Members</span> at a glance</h2>
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

//       {/* Google Map Section */}
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
//               referrerPolicy="no-referrer-when-downgrade"
//               title="Malkhanagar College Location"
//             ></iframe>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="main-footer">
//         <div className="container">
//           <div className="footer-grid">
//             <div className="footer-col">
//               <div className="footer-logo-section">
//                 {settings.logo || "/logo.png" ? (
//                   <img
//                     src={settings.logo || "/logo.png"}
//                     alt="Logo"
//                     className="footer-logo"
//                     onError={(e) => {
//                       e.target.src = 'https://via.placeholder.com/60';
//                     }}
//                   />
//                 ) : (
//                   <div className="footer-logo-placeholder">LOGO</div>
//                 )}
//                 <h3>{settings.schoolName || 'Malkhanagar College'}</h3>
//               </div>

//               <div className="footer-address">
//                 <p><strong>{settings.schoolName || 'Malkhanagar College'}, Sirajdikhan</strong></p>
//                 <p>Address: {settings.schoolAddress || 'Sirajdikhan, Dhaka'}</p>
//                 <p>Phone: {settings.schoolPhone || '+880 1234-xxxxxxx'}</p>
//                 <p>Email: {settings.schoolEmail || 'malkhanagarcollege@gmail.com'}</p>
//               </div>
//             </div>

//             <div className="footer-col">
//               <h4>Ministry of Education</h4>
//               <ul className="footer-links">
//                 <li><a href="#">Secondary and Higher Secondary Education Board</a></li>
//                 <li><a href="#">Chittagong Board</a></li>
//                 <li><a href="#">NCTB</a></li>
//               </ul>
//             </div>

//             <div className="footer-col">
//               <h4>Social Media</h4>
//               <div className="social-icons">
//                 {settings.facebookLink && (
//                   <a href={settings.facebookLink} target="_blank" rel="noopener noreferrer">
//                     <Facebook size={24} />
//                   </a>
//                 )}
//                 {settings.youtubeLink && (
//                   <a href={settings.youtubeLink} target="_blank" rel="noopener noreferrer">
//                     <Youtube size={24} />
//                   </a>
//                 )}
//               </div>

//               <div className="app-download">
//                 <h4>Download Our App</h4>
//                 <div className="app-buttons">
//                   {settings.playStoreLink && (
//                     <a href={settings.playStoreLink} target="_blank" rel="noopener noreferrer">
//                       <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" />
//                     </a>
//                   )}
//                   {settings.appStoreLink && (
//                     <a href={settings.appStoreLink} target="_blank" rel="noopener noreferrer">
//                       <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" />
//                     </a>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//       <div className="footer-bottom">
//         <p>&copy; All Rights Reserved of {settings.schoolName || 'MALKHANAGAR COLLEGE'}. 2025</p>
//         <p>Developed by <a href="https://amaderwebsite.com.bd/" target="_blank">Amader Website</a></p>
//       </div>
//     </div>
//   </footer>
// </div>
// );
// };
// export default PublicHome;
