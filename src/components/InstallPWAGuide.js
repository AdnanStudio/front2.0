import React, { useState } from 'react';
import { Smartphone, Monitor, Download, Home, Share, PlusSquare, CheckCircle } from 'lucide-react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import './InstallPWAGuide.css';

const InstallPWAGuide = () => {
  // Default settings - you can pass these as props later
  const settings = {
    schoolName: 'MALKHANAGAR COLLEGE',
    schoolAddress: 'Malkhanagar, Sirajdikhan, Dhaka',
    schoolPhone: '+880 1234-xxxxxxx',
    schoolEmail: 'info@college.edu.bd',
    logo: '/logo.png',
    facebookLink: 'https://facebook.com',
    youtubeLink: 'https://youtube.com',
    scrollingTexts: []
  };

  const [activeTab, setActiveTab] = useState('android');

  const androidSteps = [
    {
      id: 1,
      title: '১. Chrome Browser ওপেন করুন',
      description: 'আপনার Android মোবাইলে Chrome ব্রাউজার ওপেন করুন এবং আমাদের ওয়েবসাইট ভিজিট করুন',
      image: 'https://i.pinimg.com/736x/77/bf/23/77bf23659a685ebd8f18d351728ef542.jpg',
      icon: <Monitor size={24} />
    },
    {
      id: 2,
      title: '২. Three Dots Menu (⋮) তে ক্লিক করুন',
      description: 'Chrome এর উপরের ডান কোণে থাকা তিন ডট মেনুতে ক্লিক করুন',
      image: 'https://i.pinimg.com/736x/b5/14/59/b5145914e4b67c95ce0e51b38ad81f87.jpg',
      icon: <Share size={24} />
    },
    {
      id: 3,
      title: '৩. "Add to Home screen" সিলেক্ট করুন',
      description: 'মেনু থেকে "Add to Home screen" অপশনে ক্লিক করুন (নিচের দিকে স্ক্রল করতে হতে পারে)',
      image: 'https://i.pinimg.com/736x/8e/42/ff/8e42ff0a4e9f3e0e1c1f0a9e3c7d5b6e.jpg',
      icon: <PlusSquare size={24} />
    },
    {
      id: 4,
      title: '৪. নাম Confirm করে "Add" করুন',
      description: 'App এর নাম দেখুন এবং "Add" বাটনে ক্লিক করুন',
      image: 'https://i.pinimg.com/736x/c9/24/8c/c9248c0e3e1d5f5f5e0f8e7f0e9f5e6e.jpg',
      icon: <Download size={24} />
    },
    {
      id: 5,
      title: '৫. হোম স্ক্রিনে অ্যাপ পাবেন ✓',
      description: 'এখন আপনার হোম স্ক্রিনে আমাদের ওয়েবসাইট অ্যাপের মতো দেখতে পাবেন। যেকোনো সময় এক ট্যাপে ওপেন করতে পারবেন।',
      image: 'https://i.pinimg.com/736x/a2/3e/7d/a23e7d6c5e4f3e2f1e0e9f8e7f6e5e4e.jpg',
      icon: <CheckCircle size={24} />
    }
  ];

  const iosSteps = [
    {
      id: 1,
      title: '১. Safari Browser ওপেন করুন',
      description: 'আপনার iPhone/iPad এ Safari ব্রাউজার ওপেন করে আমাদের ওয়েবসাইট ভিজিট করুন',
      image: 'https://i.pinimg.com/736x/d4/5e/8f/d45e8f9e0f1e2f3e4f5e6f7e8f9e0f1e.jpg',
      icon: <Monitor size={24} />
    },
    {
      id: 2,
      title: '২. Share আইকনে (↑) ক্লিক করুন',
      description: 'নিচের মাঝখানে থাকা Share বাটনে ক্লিক করুন',
      image: 'https://i.pinimg.com/736x/e5/6f/9a/e56f9a0f1e2f3e4f5e6f7e8f9e0f1e2f.jpg',
      icon: <Share size={24} />
    },
    {
      id: 3,
      title: '৩. "Add to Home Screen" খুঁজুন',
      description: 'Share মেনু থেকে "Add to Home Screen" অপশন খুঁজে বের করুন (নিচে scroll করুন)',
      image: 'https://i.pinimg.com/736x/f6/7a/ab/f67aab0f1e2f3e4f5e6f7e8f9e0f1e2f.jpg',
      icon: <PlusSquare size={24} />
    },
    {
      id: 4,
      title: '৪. "Add" বাটনে ক্লিক করুন',
      description: 'নাম confirm করে উপরের ডান কোণের "Add" বাটনে ক্লিক করুন',
      image: 'https://i.pinimg.com/736x/a7/8b/bc/a78bbc0f1e2f3e4f5e6f7e8f9e0f1e2f.jpg',
      icon: <Download size={24} />
    },
    {
      id: 5,
      title: '৫. হোম স্ক্রিনে অ্যাপ দেখুন ✓',
      description: 'এখন আপনার হোম স্ক্রিনে আমাদের ওয়েবসাইট অ্যাপ আইকন দেখতে পাবেন',
      image: 'https://i.pinimg.com/736x/b8/9c/cd/b89ccd0f1e2f3e4f5e6f7e8f9e0f1e2f.jpg',
      icon: <CheckCircle size={24} />
    }
  ];

  const currentSteps = activeTab === 'android' ? androidSteps : iosSteps;

  return (
    <div className="install-guide-wrapper">
      <PublicHeader settings={settings} currentPath="/install-guide" />
      
      <div className="install-guide-container">
        <div className="install-guide-header">
          <div className="header-icon">
            <Smartphone size={48} />
          </div>
          <h1>ওয়েবসাইট ইনস্টল করুন 📱</h1>
          <p>মোবাইল অ্যাপের মতো আমাদের ওয়েবসাইট ব্যবহার করুন - কোনো Play Store লাগবে না!</p>
        </div>

        <div className="platform-tabs">
          <button
            className={`tab-btn ${activeTab === 'android' ? 'active' : ''}`}
            onClick={() => setActiveTab('android')}
          >
            <Smartphone size={20} />
            Android (Chrome)
          </button>
          <button
            className={`tab-btn ${activeTab === 'ios' ? 'active' : ''}`}
            onClick={() => setActiveTab('ios')}
          >
            <Smartphone size={20} />
            iOS (iPhone/iPad)
          </button>
        </div>

        <div className="steps-container">
          {currentSteps.map((step, index) => (
            <div key={step.id} className="step-card">
              <div className="step-number">
                <span>{index + 1}</span>
              </div>
              
              <div className="step-content">
                <div className="step-header">
                  <div className="step-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                </div>
                
                <p className="step-description">{step.description}</p>
                
                <div className="step-image-wrapper">
                  <img 
                    src={step.image} 
                    alt={step.title}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x400?text=Screenshot+Not+Available';
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="benefits-section">
          <h2>কেন ইনস্টল করবেন? 🎯</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <Home size={32} />
              <h4>সহজ এক্সেস</h4>
              <p>হোম স্ক্রিন থেকে সরাসরি ওয়েবসাইট ওপেন করুন</p>
            </div>
            <div className="benefit-card">
              <Download size={32} />
              <h4>দ্রুত লোড</h4>
              <p>অফলাইনেও কিছু ফিচার ব্যবহার করতে পারবেন</p>
            </div>
            <div className="benefit-card">
              <Monitor size={32} />
              <h4>ফুল স্ক্রিন</h4>
              <p>ব্রাউজার বার ছাড়াই পুরো স্ক্রিন ব্যবহার করুন</p>
            </div>
          </div>
        </div>

        <div className="video-tutorial-section">
          <h2>ভিডিও টিউটোরিয়াল 📹</h2>
          <p>স্টেপ বুঝতে সমস্যা হলে এই ভিডিও দেখুন:</p>
          <div className="video-links">
            <a 
              href="https://www.youtube.com/results?search_query=how+to+add+website+to+home+screen+android" 
              target="_blank" 
              rel="noopener noreferrer"
              className="video-link"
            >
              📱 Android Tutorial
            </a>
            <a 
              href="https://www.youtube.com/results?search_query=how+to+add+website+to+home+screen+iphone" 
              target="_blank" 
              rel="noopener noreferrer"
              className="video-link"
            >
              🍎 iOS Tutorial
            </a>
          </div>
        </div>

        <div className="help-section">
          <h3>সমস্যা হচ্ছে? 🤔</h3>
          <p>যেকোনো সাহায্যের জন্য আমাদের সাথে যোগাযোগ করুন:</p>
          <p>
            <strong>📞 Phone:</strong> {settings.schoolPhone}
          </p>
          <p>
            <strong>✉️ Email:</strong> {settings.schoolEmail}
          </p>
        </div>
      </div>

      <PublicFooter settings={settings} />
    </div>
  );
};

export default InstallPWAGuide;