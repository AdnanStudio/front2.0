// src/components/PublicLayout.js
// Wraps any content page with PublicHeader + PublicFooter
import React, { useEffect } from 'react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import './PublicLayout.css';

export default function PublicLayout({ children }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="pl-root">
      <PublicHeader />
      <main className="pl-main">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}