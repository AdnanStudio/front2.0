import React, { useState, useEffect } from 'react';
import SkeletonLoader from '../components/SkeletonLoader';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import './ContentPages.css';

const Contact = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return (
      <div className="content-page-wrapper">
        <div className="container">
          <SkeletonLoader type="title" />
          <SkeletonLoader type="text" count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="content-page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Contact Us</h1>
          <div className="title-underline"></div>
        </div>

        <div className="contact-grid">
          <div className="contact-info-card">
            <div className="contact-icon">
              <MapPin size={32} />
            </div>
            <h3>Address</h3>
            <p>Malkhanagar, Sirajdikhan, Dhaka</p>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon">
              <Phone size={32} />
            </div>
            <h3>Phone</h3>
            <p>+880 1309-134590</p>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon">
              <Mail size={32} />
            </div>
            <h3>Email</h3>
            <p>malkhanagarcollege@gmail.com</p>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon">
              <Clock size={32} />
            </div>
            <h3>Office Hours</h3>
            <p>Sun - Thu: 9:00 AM - 5:00 PM</p>
          </div>
        </div>

        <div className="map-section" style={{ marginTop: '40px' }}>
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
      </div>
    </div>
  );
};

export default Contact;