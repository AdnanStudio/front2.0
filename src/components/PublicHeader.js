import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { navigationData } from '../data/navigationData';
import LazyImage from './LazyImage';
import './PublicHeader.css';

const PublicHeader = ({ settings, onNavigate, currentPath }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrollingPaused, setScrollingPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownTimerRef = useRef(null);
  const navigate = useNavigate();

  const handleNavClick = (path) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleMouseEnter = (id) => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
    }
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 2000);
  };

  const handleDropdownMouseEnter = () => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
    }
  };

  const handleDropdownMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 2000);
  };

  const handleLogoClick = () => {
    setIsAnimating(true);

    setTimeout(() => {
      onNavigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);

    setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimerRef.current) {
        clearTimeout(dropdownTimerRef.current);
      }
    };
  }, []);

  return (
    <header className="main-header">
      <div className="container">
        <div className="header-content">
          {/* Logo Section */}
          <div
            className={`logo-section ${isAnimating ? 'water-wave-animation' : ''}`}
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
          >
            <div className="school-logo-wrapper">
              <LazyImage
                src={settings.logo || '/logo.png'}
                alt="School Logo"
                className="school-logo"
                placeholderType="spinner"
              />
            </div>
            <div className="school-info">
              <h1>{settings.schoolName || 'MALKHANAGAR COLLEGE'}</h1>
              <p className="school-subtitle">HSC - HONOURS / EIIN : 134590</p>
              <p className="school-address">
                {settings.schoolAddress || 'Malkhanagar, Sirajdikhan, Dhaka'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {navigationData.map((item) => (
              <div
                key={item.id}
                className="nav-item-wrapper"
                onMouseEnter={() =>
                  item.subItems.length > 0 && handleMouseEnter(item.id)
                }
                onMouseLeave={handleMouseLeave}
              >
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.subItems.length === 0) {
                      handleNavClick(item.path);
                    }
                  }}
                  className={currentPath === item.path ? 'active' : ''}
                >
                  {item.label}
                  {item.subItems.length > 0 && <ChevronDown size={16} />}
                </a>

                {item.subItems.length > 0 && activeDropdown === item.id && (
                  <div
                    className="dropdown-menu"
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    {item.subItems.map((subItem) => (
                      <a
                        key={subItem.id}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavClick(subItem.path);
                        }}
                        className={
                          currentPath === subItem.path ? 'active' : ''
                        }
                      >
                        {subItem.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button className="btn-login" onClick={() => navigate('/login')}>
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

      {/* Scrolling Text Banner */}
      <div
        className="scrolling-text-container"
        onMouseEnter={() => setScrollingPaused(true)}
        onMouseLeave={() => setScrollingPaused(false)}
        onClick={() => setScrollingPaused(!scrollingPaused)}
      >
        <div className={`scrolling-text ${scrollingPaused ? 'paused' : ''}`}>
          {settings.scrollingTexts?.length > 0 ? (
            settings.scrollingTexts.map((item, index) => (
              <span key={index}>• {item.text} •</span>
            ))
          ) : (
            <>
              <span>• Welcome to Malkhanagar College •</span>
              <span>• Admission is going on •</span>
              <span>• Check our latest notices •</span>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          {navigationData.map((item) => (
            <div key={item.id} className="mobile-nav-item">
              <div
                className="mobile-nav-link"
                onClick={() =>
                  item.subItems.length === 0
                    ? handleNavClick(item.path)
                    : toggleDropdown(item.id)
                }
              >
                <span>{item.label}</span>
                {item.subItems.length > 0 && (
                  <ChevronDown
                    size={16}
                    className={activeDropdown === item.id ? 'rotated' : ''}
                  />
                )}
              </div>

              {item.subItems.length > 0 && activeDropdown === item.id && (
                <div className="mobile-dropdown">
                  {item.subItems.map((subItem) => (
                    <a
                      key={subItem.id}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(subItem.path);
                      }}
                      className={
                        currentPath === subItem.path ? 'active' : ''
                      }
                    >
                      {subItem.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            className="btn-login-mobile"
            onClick={() => {
              navigate('/login');
              setMobileMenuOpen(false);
            }}
          >
            Login
          </button>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;