import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  BookOpen, 
  Calendar,
  Download,
  LogIn
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const [carousels, setCarousels] = useState([]);
  const [notices, setNotices] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [principalInfo, setPrincipalInfo] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchHomeData();
  }, []);

  useEffect(() => {
    if (carousels.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carousels.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [carousels]);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://malkhanagarcollege.onrender.com/api/public/home');
      const { carousels, notices, blogs, principalInfo } = response.data.data;
      
      setCarousels(carousels);
      setNotices(notices);
      setBlogs(blogs);
      setPrincipalInfo(principalInfo);
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carousels.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carousels.length) % carousels.length);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <BookOpen size={40} className="logo-icon" />
              <div>
                <h1>School Management System</h1>
                <p>Excellence in Education</p>
              </div>
            </div>
            <button className="btn-login" onClick={() => navigate('/login')}>
              <LogIn size={20} />
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Carousel Section */}
      {carousels.length > 0 && (
        <section className="carousel-section">
          <div className="carousel-container">
            <div 
              className="carousel-slides"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {carousels.map((carousel, index) => (
                <div key={carousel._id} className="carousel-slide">
                  <img src={carousel.image} alt={carousel.title} />
                  <div className="carousel-caption">
                    <h2>{carousel.title}</h2>
                    {carousel.description && <p>{carousel.description}</p>}
                  </div>
                </div>
              ))}
            </div>

            {carousels.length > 1 && (
              <>
                <button className="carousel-btn prev" onClick={prevSlide}>
                  <ChevronLeft size={30} />
                </button>
                <button className="carousel-btn next" onClick={nextSlide}>
                  <ChevronRight size={30} />
                </button>

                <div className="carousel-indicators">
                  {carousels.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Notice Board Section */}
      <section className="notice-section">
        <div className="container">
          <div className="section-header">
            <Bell size={32} />
            <h2>Notice Board</h2>
          </div>
          <div className="notice-board">
            {notices.length === 0 ? (
              <p className="no-data">No notices available</p>
            ) : (
              <div className="notice-list">
                {notices.slice(0, 5).map((notice) => (
                  <div key={notice._id} className="notice-item">
                    <div className="notice-icon">
                      <Bell size={20} />
                    </div>
                    <div className="notice-content">
                      <div className="notice-header">
                        <h4>{notice.title}</h4>
                        <span className={`notice-type ${notice.type}`}>
                          {notice.type}
                        </span>
                      </div>
                      <p>{notice.description}</p>
                      <div className="notice-footer">
                        <span className="notice-date">
                          <Calendar size={14} />
                          {formatDate(notice.publishDate)}
                        </span>
                        <span className="notice-author">
                          By: {notice.createdBy?.name || 'Admin'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {notices.length > 5 && (
              <button className="btn-view-all">View All Notices</button>
            )}
          </div>
        </div>
      </section>

      {/* Principal Section */}
      {principalInfo && (
        <section className="principal-section">
          <div className="container">
            <div className="principal-card">
              <div className="principal-image">
                <img src={principalInfo.image} alt={principalInfo.name} />
              </div>
              <div className="principal-content">
                <h3>Message from Principal</h3>
                <h2>{principalInfo.name}</h2>
                {principalInfo.qualification && (
                  <p className="qualification">{principalInfo.qualification}</p>
                )}
                <div className="principal-message">
                  <p>{principalInfo.message}</p>
                </div>
                {principalInfo.email && (
                  <a href={`mailto:${principalInfo.email}`} className="principal-email">
                    {principalInfo.email}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Section */}
      {blogs.length > 0 && (
        <section className="blog-section">
          <div className="container">
            <div className="section-header">
              <BookOpen size={32} />
              <h2>Latest News & Events</h2>
            </div>
            <div className="blog-grid">
              {blogs.map((blog) => (
                <div key={blog._id} className="blog-card">
                  {blog.featuredImage && (
                    <div className="blog-image">
                      <img src={blog.featuredImage} alt={blog.title} />
                      <span className="blog-category">{blog.category}</span>
                    </div>
                  )}
                  <div className="blog-content">
                    <h3>{blog.title}</h3>
                    <p>{blog.excerpt || blog.content.substring(0, 150) + '...'}</p>
                    <div className="blog-footer">
                      <div className="blog-author">
                        <img 
                          src={blog.author?.profileImage || 'https://via.placeholder.com/30'} 
                          alt={blog.author?.name} 
                        />
                        <span>{blog.author?.name}</span>
                      </div>
                      <span className="blog-date">{formatDate(blog.createdAt)}</span>
                    </div>
                    <button className="btn-read-more">Read More</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>About Us</h3>
              <p>Excellence in education, building tomorrow's leaders today.</p>
            </div>
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#admissions">Admissions</a></li>
                <li><a href="#academics">Academics</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Contact Info</h3>
              <p>Email: info@school.com</p>
              <p>Phone: +880 1234-567890</p>
              <p>Address: Dhaka, Bangladesh</p>
            </div>
            <div className="footer-section">
              <h3>Download Our App</h3>
              <button className="btn-download">
                <Download size={20} />
                Download App
              </button>
              <div className="app-badges">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Google Play" 
                  className="app-badge"
                />
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="App Store" 
                  className="app-badge"
                />
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 School Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;