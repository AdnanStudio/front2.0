import React from 'react';
import { Facebook, Youtube } from 'lucide-react';
import './PublicFooter.css';

const PublicFooter = ({ settings = {} }) => {
  return (
    <>
      <footer className="main-footer">
        <div className="container">
          <div className="footer-grid">
            {/* Column 1 */}
            <div className="footer-col">
              <div className="footer-logo-section">
                <img
                  src={settings.logo || '/logo.png'}
                  alt="Logo"
                  className="footer-logo"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/60';
                  }}
                />
                <h3>{settings.schoolName || 'Malkhanagar College'}</h3>
              </div>

              <div className="footer-address">
                <p>
                  <strong>{settings.schoolName || 'Malkhanagar College'}</strong>
                </p>
                <p>
                  Address: {settings.schoolAddress || 'Sirajdikhan, Dhaka'}
                </p>
                <p>
                  Phone: {settings.schoolPhone || '+880 1234-xxxxxxx'}
                </p>
                <p>
                  Email: {settings.schoolEmail || 'info@college.edu.bd'}
                </p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="footer-col">
              <h4>Social Media</h4>
              <div className="social-icons">
                <a
                  href={settings.facebookLink || 'https://facebook.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook size={24} />
                </a>

                <a
                  href={settings.youtubeLink || 'https://youtube.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Youtube size={24} />
                </a>
              </div>

              <div className="app-download">
                <h4>Download Our App</h4>
                <div className="app-buttons">
                  <a
                    href={settings.playStoreLink || '/install-guide'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Google Play"
                    />
                  </a>
                </div>
              </div>
            </div>

            {/* Column 3 - Quick Links replaced with Helpline Image */}
            <div className="footer-col">
              {/* <h4></h4> */}
              <div className="helpline-image-container">
                <img
                  src="https://itss.com.bd/itn/view/kso/images/Helpline.jpg"
                  alt="Helpline Information"
                  className="helpline-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x400?text=Helpline';
                  }}
                />
              </div>
            </div>

            
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <p>
              © All Rights Reserved {settings.schoolName || 'MALKHANAGAR COLLEGE'} 2025
            </p>
            <p>
              Developed by{' '}
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
    </>
  );
};

export default PublicFooter;