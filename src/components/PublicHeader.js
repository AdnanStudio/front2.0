// src/components/PublicHeader.js
// ✅ NOT sticky — scrolls naturally with page
// ✅ Each nav item has its own colored pill (like hero buttons)
// ✅ Full Bangla labels
// ✅ Seamless double-copy ticker loop
// ✅ Mobile: logo+name in header row with hamburger
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import './PublicHeader.css';

const API = process.env.REACT_APP_API_URL || 'https://malkhanagarcollege.onrender.com/api';

/* ══════════════════════════════════════════════════
   NAV — Bangla labels, each with its own pill color
══════════════════════════════════════════════════ */
const NAV = [
  { id: 'home', label: '🏠︎ হোম', path: '/', color: '#1b5e20', bg: '#e8f5e9', sub: [] },

  {
    id: 'about', label: 'প্রতিষ্ঠান পরিচিতি', color: '#fff', bg: '#6a1b9a',
    sub: [
      { label: 'কলেজের ইতিহাস',     path: '/about/history',                dot: '#9c27b0' },
      { label: 'মিশন ও ভিশন',       path: '/about/mission-vision',          dot: '#8e24aa' },
      { label: 'সুযোগ-সুবিধা',      path: '/about/facilities',              dot: '#ab47bc' },
      { label: 'সাফল্যসমূহ',        path: '/about/achievements',            dot: '#7b1fa2' },
      { label: 'শিক্ষক পরিষদ',      path: '/about/faculty-council',         dot: '#6a1b9a' },
      { label: 'অর্গানোগ্রাম',       path: '/about/organogram',              dot: '#9c27b0' },
      { label: 'স্টাফ ও কর্মচারী',  path: '/about/staff',                   dot: '#8e24aa' },
      { label: 'পরিচালনা পর্ষদ',    path: '/administration/governing-body', dot: '#ab47bc' },
      { label: 'অধ্যক্ষের বাণী',    path: '/about/principal',               dot: '#7b1fa2' },
    ],
  },

  {
    id: 'academic', label: 'একাডেমিক', color: '#fff', bg: '#1565c0',
    sub: [
      { label: 'প্রোগ্রামসমূহ',          path: '/academic/programs',      dot: '#1565c0' },
      { label: 'বিভাগসমূহ',              path: '/academic/departments',   dot: '#1976d2' },
      { label: 'সিলেবাস',                path: '/academic/syllabus',      dot: '#1e88e5' },
      { label: 'একাডেমিক ক্যালেন্ডার',  path: '/academic/calendar',      dot: '#0d47a1' },
      { label: 'এইচএসসি রুটিন',         path: '/academic/hsc-routine',   dot: '#1565c0' },
      { label: 'স্নাতক পাস কোর্স',      path: '/academic/degree-pass',   dot: '#1976d2' },
      { label: 'স্নাতক সম্মান',         path: '/academic/degree-honors', dot: '#1e88e5' },
    ],
  },

  {
    id: 'administration', label: 'প্রশাসন', color: '#fff', bg: '#b71c1c',
    sub: [
      { label: 'শিক্ষকবৃন্দ',          path: '/administration/teachers',          dot: '#c62828' },
      { label: 'পরিচালনা পর্ষদ',       path: '/administration/governing-body',    dot: '#d32f2f' },
      { label: 'শিক্ষক প্রশিক্ষণ',     path: '/administration/teacher-training',  dot: '#e53935' },
      { label: 'ক্লাব ব্যবস্থাপনা',    path: '/administration/club-management',   dot: '#ef5350' },
    ],
  },

  {
    id: 'admission', label: 'ভর্তি', color: '#fff', bg: '#e65100',
    sub: [
      { label: 'অনলাইনে আবেদন',     path: '/admission/apply',        dot: '#e65100' },
      { label: 'ভর্তির শর্তাবলী',   path: '/admission/requirements', dot: '#ef6c00' },
      { label: 'ভর্তির পদ্ধতি',     path: '/admission/procedure',    dot: '#f57c00' },
      { label: 'এইচএসসি ভর্তি',     path: '/admission/hsc',          dot: '#fb8c00' },
      { label: 'স্নাতক পাস',         path: '/admission/degree-pass',  dot: '#e65100' },
      { label: 'স্নাতক সম্মান',      path: '/admission/degree',       dot: '#ef6c00' },
    ],
  },

  {
    id: 'gallery', label: 'গ্যালারি', color: '#fff', bg: '#00695c',
    sub: [
      { label: 'ফটো গ্যালারি',  path: '/gallery/photos', dot: '#00695c' },
      { label: 'ভিডিও গ্যালারি', path: '/gallery/videos', dot: '#00796b' },
      { label: 'ইভেন্টসমূহ',    path: '/gallery/events', dot: '#00897b' },
    ],
  },

  { id: 'notice',  label: 'নোটিশ',   path: '/notices',  color: '#1a237e', bg: '#e8eaf6', sub: [] },
  { id: 'contact', label: 'যোগাযোগ', path: '/contact',   color: '#fff',    bg: '#8F6767', sub: [] },

  { id: 'login', label: 'লগইন', path: '/login',   color: '#fff',    bg: '#37474f', sub: [] },
];

const DEFAULT_TICKER =
  'মালখানগর কলেজে ✦✦ EIIN: 134590 ✦✦ ঢাকা শিক্ষা বোর্ড';

export default function PublicHeader({ settings }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDD,     setOpenDD]     = useState(null);
  const [mobExpand,  setMobExpand]  = useState(null);
  const [ticker,     setTicker]     = useState(DEFAULT_TICKER);
  const [schoolName, setSchoolName] = useState('মালখানগর কলেজ');
  const [logo,       setLogo]       = useState('/logo.png');
  const [address,    setAddress]    = useState('মালখানগর, সিরাজদিখান, মুন্সিগঞ্জ');
  const ddTimer  = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/settings`);
        const d = await r.json();
        if (d.success && d.data) {
          const active = (d.data.scrollingTexts || []).filter(t => t.isActive !== false);
          if (active.length) setTicker(active.map(t => t.text).join(' ✦ '));
          if (d.data.schoolName)    setSchoolName(d.data.schoolName);
          if (d.data.logo)          setLogo(d.data.logo);
          if (d.data.schoolAddress) setAddress(d.data.schoolAddress);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (settings?.schoolName)    setSchoolName(settings.schoolName);
    if (settings?.logo)          setLogo(settings.logo);
    if (settings?.schoolAddress) setAddress(settings.schoolAddress);
    if (settings?.scrollingTexts?.length) {
      const active = settings.scrollingTexts.filter(t => t.isActive !== false);
      if (active.length) setTicker(active.map(t => t.text).join(' ✦ '));
    }
  }, [settings]);

  const openDrop  = id => { clearTimeout(ddTimer.current); setOpenDD(id); };
  const closeDrop = ()  => { ddTimer.current = setTimeout(() => setOpenDD(null), 220); };

  const go = path => {
    navigate(path);
    setMobileOpen(false); setOpenDD(null); setMobExpand(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="ph-root">

      {/* ── TOP INFO STRIP ── */}
      

      {/* ── BRAND BAR ── */}
      <div className="ph-brand-bar">
        <div className="ph-brand-inner">
          {/* Logo + name */}
          <div className="ph-brand" onClick={() => go('/')} role="button" tabIndex={0}>
            <img
              src={logo} alt="লোগো" className="ph-brand-logo"
              onError={e => { e.target.src = '/logo.png'; }}
            />
            <div className="ph-brand-text">
              <h1 className="ph-brand-name">{schoolName}</h1>
              <p className="ph-brand-sub">উচ্চ মাধ্যমিক · স্নাতক (পাস) · স্নাতক (সম্মান)</p>
              <p className="ph-brand-addr">{address}</p>
            </div>
          </div>

          {/* Desktop login */}
          <button className="ph-login-btn" onClick={() => go('/login')}>
            🔐 লগইন
          </button>

          {/* Mobile hamburger */}
          <button className="ph-ham" onClick={() => setMobileOpen(!mobileOpen)} aria-label="মেনু">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── DESKTOP NAV BAR — colored pills ── */}
      <nav className="ph-nav-bar" aria-label="মূল নেভিগেশন">
        <div className="ph-nav-inner">
          {NAV.map(item => (
            <div
              key={item.id}
              className="ph-nav-item"
              onMouseEnter={() => item.sub.length && openDrop(item.id)}
              onMouseLeave={closeDrop}
            >
              {item.sub.length === 0 ? (
                <Link
                  to={item.path}
                  className={`ph-pill${location.pathname === item.path ? ' active' : ''}`}
                  style={{ '--pc': item.bg, '--tc': item.color }}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  className={`ph-pill${openDD === item.id ? ' active' : ''}`}
                  style={{ '--pc': item.bg, '--tc': item.color }}
                >
                  {item.label}
                  <ChevronDown size={12} className={openDD === item.id ? 'ph-arr-up' : 'ph-arr'} />
                </button>
              )}

              {/* Dropdown */}
              {item.sub.length > 0 && openDD === item.id && (
                <div
                  className="ph-dd"
                  style={{ '--dc': item.bg }}
                  onMouseEnter={() => openDrop(item.id)}
                  onMouseLeave={closeDrop}
                >
                  {item.sub.map((s, i) => (
                    <Link
                      key={i} to={s.path}
                      className={`ph-dd-a${location.pathname === s.path ? ' active' : ''}`}
                      onClick={() => { setOpenDD(null); window.scrollTo({ top: 0 }); }}
                    >
                      <span className="ph-dd-dot" style={{ background: s.dot }} />
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* ── TICKER — seamless double-copy loop ── */}
      <div className="ph-ticker">
        <span className="ph-tk-badge">📢 সংবাদ</span>
        <div className="ph-tk-track" onMouseEnter={() => {}} onMouseLeave={() => {}}>
          <div className="ph-tk-belt">
            <span className="ph-tk-txt">✦ {ticker} &nbsp;&nbsp;&nbsp;</span>
            <span className="ph-tk-txt" aria-hidden="true">✦ {ticker} &nbsp;&nbsp;&nbsp;</span>
          </div>
        </div>
        <Link to="/notices" className="ph-tk-all">সব দেখুন »</Link>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <nav className="ph-mob-drawer" aria-label="মোবাইল নেভিগেশন">
          {NAV.map(item => (
            <div key={item.id} className="ph-mob-item">
              <div
                className="ph-mob-row"
                style={{ borderLeftColor: item.bg }}
                onClick={() =>
                  item.sub.length === 0
                    ? go(item.path)
                    : setMobExpand(mobExpand === item.id ? null : item.id)
                }
              >
                <span
                  className="ph-mob-label-pill"
                  style={{ background: item.bg, color: item.color }}
                >
                  {item.label}
                </span>
                {item.sub.length > 0 && (
                  <ChevronDown size={14} className={mobExpand === item.id ? 'ph-arr-up' : 'ph-arr'} />
                )}
              </div>

              {item.sub.length > 0 && mobExpand === item.id && (
                <div className="ph-mob-sub">
                  {item.sub.map((s, i) => (
                    <Link
                      key={i} to={s.path}
                      className={`ph-mob-sub-a${location.pathname === s.path ? ' active' : ''}`}
                      onClick={() => {
                        setMobileOpen(false); setMobExpand(null);
                        window.scrollTo({ top: 0 });
                      }}
                    >
                      <span className="ph-mob-dot" style={{ background: s.dot }} />
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="ph-mob-footer">
            <button className="ph-mob-login" onClick={() => go('/login')}>
              লগইন করুন
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}