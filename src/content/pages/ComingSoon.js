// src/content/pages/ComingSoon.js
// Shared "Coming Soon" page displayed for any route without full content yet
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ContentPageShell from './ContentPageShell';

// Map paths to title info
const PATH_META = {
  '/database/college':  { title: 'College Database',         bn: 'কলেজ ডাটাবেজ',          icon: '🗄️' },
  '/database/teachers': { title: 'Teachers Database',        bn: 'শিক্ষক ডাটাবেজ',         icon: '👨‍🏫' },
  '/database/students': { title: 'Students Database',        bn: 'স্টুডেন্ট ডাটাবেজ',      icon: '🎓' },
  '/database/e-payment':{ title: 'E-Payment',                bn: 'ই-পেমেন্ট',               icon: '💳' },
  '/info':              { title: 'Information Service',      bn: 'তথ্য সেবা',               icon: 'ℹ️' },
  '/complaints':        { title: 'Complaint Resolution',     bn: 'অভিযোগ নিষ্পত্তি',       icon: '📋' },
  '/recognition':       { title: 'Recognition & Approval',  bn: 'পাঠদানের অনুমতি ও স্বীকৃতি', icon: '📜' },
  '/apa':               { title: 'Annual Performance Agreement', bn: 'বার্ষিক কর্মসম্পাদন চুক্তি', icon: '📑' },
  '/online-edu/youtube':{ title: 'YouTube Classes',          bn: 'ইউটিউব লিংক',             icon: '▶️' },
  '/online-edu/facebook':{ title:'Facebook Page',            bn: 'ফেসবুক লিংক',             icon: '📘' },
};

export default function ComingSoon({ title, banglaTitle, icon, breadcrumb, message }) {
  const location = useLocation();
  const meta = PATH_META[location.pathname] || {};

  const resolvedTitle  = title       || meta.bn     || 'শীঘ্রই আসছে';
  const resolvedEn     = banglaTitle || meta.title  || 'Coming Soon';
  const resolvedIcon   = icon        || meta.icon   || '🚧';
  const resolvedBc     = breadcrumb  || [{ label: 'হোম', path: '/' }];

  return (
    <ContentPageShell
      title={resolvedEn}
      banglaTitle={resolvedTitle}
      icon={resolvedIcon}
      breadcrumb={resolvedBc}
    >
      <div style={{ background: '#fff', borderRadius: 12, padding: '50px 24px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,.08)' }}>
        <div style={{ fontSize: 72, marginBottom: 16, lineHeight: 1 }}>🚧</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1b5e20', margin: '0 0 12px', fontFamily: "'Hind Siliguri', sans-serif" }}>
          শীঘ্রই আসছে
        </h2>
        <p style={{ fontSize: 16, color: '#555', fontFamily: "'Hind Siliguri', sans-serif", lineHeight: 1.8, maxWidth: 500, margin: '0 auto 20px' }}>
          {message || `"${resolvedTitle}" বিভাগটি প্রস্তুত করা হচ্ছে। অল্প সময়ের মধ্যে এই পাতায় বিস্তারিত তথ্য যুক্ত করা হবে।`}
        </p>
        <p style={{ fontSize: 14, color: '#888', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 28 }}>
          যেকোনো তথ্যের জন্য কলেজ অফিসে যোগাযোগ করুন।
        </p>
        <Link to="/" style={{ display: 'inline-block', background: '#2e7d32', color: '#fff', padding: '10px 28px', borderRadius: 25, fontWeight: 700, textDecoration: 'none', fontFamily: "'Hind Siliguri', sans-serif", fontSize: 15, transition: 'background .2s' }}>
          ← হোম পেজে ফিরুন
        </Link>
      </div>
    </ContentPageShell>
  );
}