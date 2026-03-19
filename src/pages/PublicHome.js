// src/pages/PublicHome.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SkeletonLoader from '../components/SkeletonLoader';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import './PublicHome.css';

const API = process.env.REACT_APP_API_URL || 'https://malkhanagarcollege.onrender.com/api';

/* ── 5 varied 3D transition classes ── */
const TRANSITIONS = ['ph-t-slide3d', 'ph-t-cube', 'ph-t-flip', 'ph-t-zoom', 'ph-t-swipe'];

/* ── Quick-access hero buttons ── */
const HERO_BTNS = [
  { label: 'শিক্ষক পরিষদ',          path: '/about/faculty-council',         color: '#c62828' },
  { label: 'অর্গানোগ্রাম',            path: '/about/organogram',              color: '#6a1b9a' },
  { label: 'শিক্ষকবৃন্দ',             path: '/administration/teachers',       color: '#1565c0' },
  { label: 'পরিচালনা পর্ষদ',          path: '/administration/governing-body', color: '#2e7d32' },
  { label: 'ভর্তি আবেদন',            path: '/admission/apply',               color: '#e65100' },
  { label: 'উচ্চ মাধ্যমিক',           path: '/admission/hsc',                 color: '#00695c' },
  { label: 'স্নাতক (পাস)',            path: '/admission/degree-pass',         color: '#827717' },
  { label: 'ফর্ম ফিলাপ',             path: '/form/hsc',                      color: '#4527a0' },
  { label: 'পরীক্ষার ফলাফল',         path: '/result/internal',               color: '#37474f' },
  { label: 'নোটিশ বোর্ড',            path: '/notices',                       color: '#1b5e20' },
  { label: 'গ্রন্থাগার',              path: '/library',                       color: '#4e342e' },
  { label: 'ই-লাইব্রেরি',             path: '/e-library',                     color: '#880e4f' },
  { label: 'একাডেমিক ক্যালেন্ডার',  path: '/academic/calendar',             color: '#0277bd' },
  { label: 'ফটো গ্যালারি',           path: '/gallery/photos',                color: '#558b2f' },
];

/* ── Full navigation data from all content folders ── */
const CONTENT_SECTIONS = [
  {
    title: 'প্রতিষ্ঠান পরিচিতি',
    icon: '🏛️',
    color: '#6a1b9a',
    // maps to: content/about/ + content/pages/
    items: [
      ['কলেজের ইতিহাস',       '/about/history'],
      ['মিশন ও ভিশন',         '/about/mission-vision'],
      ['সুযোগ-সুবিধা',        '/about/facilities'],
      ['সাফল্যসমূহ',          '/about/achievements'],
      ['শিক্ষক পরিষদ',        '/about/faculty-council'],
      ['অর্গানোগ্রাম',         '/about/organogram'],
      ['পরিচালনা পর্ষদ',      '/administration/governing-body'],
      ['অধ্যক্ষের বাণী',      '/about/principal'],
      ['স্টাফ ও কর্মচারী',    '/about/staff'],
    ],
  },
  {
    title: 'প্রশাসন',
    icon: '👨‍💼',
    color: '#1565c0',
    // maps to: content/administration/
    items: [
      ['শিক্ষকবৃন্দ',          '/administration/teachers'],
      ['পরিচালনা পর্ষদ',       '/administration/governing-body'],
      ['শিক্ষক প্রশিক্ষণ',     '/administration/teacher-training'],
      ['ক্লাব ব্যবস্থাপনা',    '/administration/club-management'],
    ],
  },
  {
    title: 'একাডেমিক',
    icon: '📘',
    color: '#00695c',
    // maps to: content/academic/ + content/pages/
    items: [
      ['উচ্চ মাধ্যমিক রুটিন',     '/academic/hsc-routine'],
      ['স্নাতক (পাস)',             '/academic/degree-pass'],
      ['স্নাতক (সম্মান)',          '/academic/degree-honors'],
      ['বিভাগসমূহ',               '/academic/departments'],
      ['প্রোগ্রামসমূহ',            '/academic/programs'],
      ['সিলেবাস',                  '/academic/syllabus'],
      ['একাডেমিক ক্যালেন্ডার',    '/academic/calendar'],
    ],
  },
  {
    title: 'ভর্তি',
    icon: '📋',
    color: '#e65100',
    // maps to: content/admission/
    items: [
      ['অনলাইনে আবেদন',       '/admission/apply'],
      ['উচ্চ মাধ্যমিক ভর্তি', '/admission/hsc'],
      ['স্নাতক পাস ভর্তি',    '/admission/degree-pass'],
      ['স্নাতক ভর্তি',        '/admission/degree'],
      ['ভর্তির শর্তাবলী',     '/admission/requirements'],
      ['ভর্তির পদ্ধতি',       '/admission/procedure'],
    ],
  },
  {
    title: 'পরীক্ষা ও ফলাফল',
    icon: '📊',
    color: '#c62828',
    items: [
      ['অভ্যন্তরীণ এডমিট কার্ড', '/result/admit-card'],
      ['অভ্যন্তরীণ ফলাফল',       '/result/internal'],
      ['উচ্চ মাধ্যমিক ফলাফল',    '/result/hsc'],
      ['স্নাতক পাস ফলাফল',       '/result/degree-pass'],
      ['স্নাতক ফলাফল',            '/result/degree'],
    ],
  },
  {
    title: 'ফর্ম পূরণ',
    icon: '📝',
    color: '#4527a0',
    items: [
      ['এইচএসসি ফর্ম',   '/form/hsc'],
      ['স্নাতক পাস ফর্ম', '/form/degree-pass'],
      ['স্নাতক ফর্ম',     '/form/degree'],
    ],
  },
  {
    title: 'গ্যালারি',
    icon: '📷',
    color: '#558b2f',
    // maps to: content/gallery/
    items: [
      ['ফটো গ্যালারি',  '/gallery/photos'],
      ['ভিডিও গ্যালারি', '/gallery/videos'],
      ['ইভেন্টসমূহ',    '/gallery/events'],
    ],
  },
  {
    title: 'ডাউনলোড ও সেবা',
    icon: '📥',
    color: '#37474f',
    items: [
      ['ফর্ম ডাউনলোড',   '/notices'],
      ['সিটিজেন চার্টার', '/about/history'],
      ['নোটিশ বোর্ড',    '/notices'],
      ['অফিস আদেশ',      '/notices'],
    ],
  },
  {
    title: 'অনলাইন শিক্ষা',
    icon: '💻',
    color: '#0277bd',
    items: [
      ['EasyCollegeMate',  '/easy-college-mate'],
      ['ই-লাইব্রেরি',      '/e-library'],
      ['গ্রন্থাগার',        '/library'],
      ['ইউটিউব লিংক',     '/easy-college-mate'],
    ],
  },
  {
    title: 'সহশিক্ষা কার্যক্রম',
    icon: '🎨',
    color: '#1b5e20',
    // maps to: content/administration/ clubs
    items: [
      ['ক্লাব ব্যবস্থাপনা', '/administration/club-management'],
      ['শিক্ষক প্রশিক্ষণ',  '/administration/teacher-training'],
      ['বিএনসিসি',          '/administration/club-management'],
      ['রোভার স্কাউটস',     '/administration/club-management'],
    ],
  },
];

const IMP_LINKS = [
  { label: 'শিক্ষা মন্ত্রণালয়',       url: 'https://moedu.gov.bd' },
  { label: 'ঢাকা শিক্ষা বোর্ড',     url: 'https://dhakaeducationboard.gov.bd' },
  { label: 'জাতীয় বিশ্ববিদ্যালয়',     url: 'https://www.nu.ac.bd' },
  { label: 'শিক্ষক বাতায়ন',            url: 'https://teachers.gov.bd' },
  { label: 'EMIS | DSHE',               url: 'https://emis.gov.bd' },
  { label: 'জাতীয় তথ্য বাতায়ন',       url: 'https://www.bangladesh.gov.bd' },
  { label: 'শিক্ষা পরিচালকের দপ্তর',  url: 'https://www.dshe.gov.bd' },
];

const HOTLINES = [
  { number: '৩৩৩',  label: 'সরকারি তথ্য',   color: '#1565c0' },
  { number: '৯৯৯',  label: 'জরুরি সেবা',     color: '#c62828' },
  { number: '১০৯',  label: 'নারী ও শিশু',    color: '#7b1fa2' },
  { number: '১০৬',  label: 'দুদক',            color: '#e65100' },
  { number: '১০৯০', label: 'দুযোর্গ',        color: '#37474f' },
  { number: '১০৯৮', label: 'শিশু সহায়তা',     color: '#2e7d32' },
];

/* ── Lightbox ── */
function Lightbox({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const prev = e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); };
  const next = e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); };
  useEffect(() => {
    const kd = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length);
    };
    window.addEventListener('keydown', kd);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', kd); document.body.style.overflow = ''; };
  }, [onClose, images.length]);

  return (
    <div className="lb-overlay" onClick={onClose}>
      <button className="lb-close" onClick={onClose}>✕</button>
      <button className="lb-nav lb-prev" onClick={prev}>‹</button>
      <div className="lb-center" onClick={e => e.stopPropagation()}>
        <img src={images[idx].url} alt={images[idx].alt || `ছবি ${idx + 1}`} className="lb-img" />
        <p className="lb-caption">{images[idx].alt || ''} ({idx + 1}/{images.length})</p>
      </div>
      <button className="lb-nav lb-next" onClick={next}>›</button>
      <div className="lb-dots">
        {images.map((_, i) => (
          <button key={i} className={`lb-dot${i === idx ? ' on' : ''}`}
            onClick={e => { e.stopPropagation(); setIdx(i); }} />
        ))}
      </div>
    </div>
  );
}

/* ── Per-image skeleton wrapper ── */
function ImgSkeleton({ src, alt, className, style, onClick }) {
  const [loaded,  setLoaded]  = useState(false);
  const [errored, setErrored] = useState(false);
  return (
    <div className="isk-wrap" style={style} onClick={onClick}>
      {!loaded && !errored && (
        <div className="isk-sk">
          <SkeletonLoader type="image" height="100%" />
        </div>
      )}
      {src && (
        <img
          src={src} alt={alt || ''}
          className={`isk-img${loaded ? ' isk-show' : ''} ${className || ''}`}
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(true); setErrored(true); }}
        />
      )}
      {errored && <div className="isk-err">🖼️</div>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
export default function PublicHome() {
  const [slides,       setSlides]       = useState([]);
  const [cur,          setCur]          = useState(0);
  const [transIdx,     setTransIdx]     = useState(0);
  const [animating,    setAnimating]    = useState(false);
  const [notices,      setNotices]      = useState([]);
  const [principalImg, setPrincipalImg] = useState(null);
  const [presidentImg, setPresidentImg] = useState(null);
  const [principalName,setPrincipalName]= useState('');
  const [galleryImgs,  setGalleryImgs]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [lightbox,     setLightbox]     = useState({ open: false, idx: 0 });
  const timerRef    = useRef(null);
  const slideCount  = useRef(1);

  useEffect(() => {
    fetchAll();
    return () => clearInterval(timerRef.current);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (slideCount.current > 1) startAuto();
    return () => clearInterval(timerRef.current);
  }, [slides.length]); // eslint-disable-line

  const startAuto = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTransIdx(i => (i + 1) % TRANSITIONS.length);
      setAnimating(true);
      setTimeout(() => {
        setCur(p => (p + 1) % slideCount.current);
        setAnimating(false);
      }, 750);
    }, 4200);
  }, []);

  const goTo = useCallback((idx) => {
    if (animating) return;
    clearInterval(timerRef.current);
    setTransIdx(i => (i + 1) % TRANSITIONS.length);
    setAnimating(true);
    setTimeout(() => { setCur(idx); setAnimating(false); startAuto(); }, 750);
  }, [animating, startAuto]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, nRes, hRes] = await Promise.allSettled([
        fetch(`${API}/settings`),
        fetch(`${API}/notices/public?limit=10`),
        fetch(`${API}/public/home`),
      ]);

      if (sRes.status === 'fulfilled' && sRes.value.ok) {
        const d = await sRes.value.json();
        if (d.success && d.data) {
          const heroImgs = [...(d.data.heroImages || [])].sort((a, b) => (a.order||0) - (b.order||0));
          const imgs = heroImgs.map(img => ({ url: img.url, alt: img.title || 'কলেজ চিত্র' }));
          if (imgs.length > 0) {
            setSlides(imgs); slideCount.current = imgs.length;
            setGalleryImgs(imgs);
          } else {
            const fb = [{ url: '/college.jpg', alt: 'মালখানগর কলেজ' }];
            setSlides(fb); slideCount.current = 1;
          }
          if (d.data.chairmanImage?.url) setPrincipalImg(d.data.chairmanImage.url);
          if (d.data.noticeImage?.url)   setPresidentImg(d.data.noticeImage.url);
        }
      }

      if (nRes.status === 'fulfilled' && nRes.value.ok) {
        const d = await nRes.value.json();
        if (d.success && d.data?.length) setNotices(d.data);
      }

      if (hRes.status === 'fulfilled' && hRes.value.ok) {
        const d = await hRes.value.json();
        if (d.success && d.data) {
          if (d.data.principalInfo?.name) setPrincipalName(d.data.principalInfo.name);
          if (d.data.carousels?.length > 0 && galleryImgs.length === 0) {
            setGalleryImgs(
              d.data.carousels.slice(0, 8)
                .map((c, i) => ({ url: c.image, alt: c.title || `ছবি ${i+1}` }))
                .filter(x => x.url)
            );
          }
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const n = slides.length || 1;
  const gallery = galleryImgs.length > 0 ? galleryImgs : slides;
  const ct = TRANSITIONS[transIdx % TRANSITIONS.length];

  if (loading) {
    return (
      <div className="ph-page">
        <PublicHeader />
        <SkeletonLoader type="image" height="460px" />
        <div style={{ maxWidth: 1200, margin: '20px auto', padding: '0 14px' }}>
          <SkeletonLoader type="text" count={3} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 20 }}>
            <SkeletonLoader type="card" /><SkeletonLoader type="card" /><SkeletonLoader type="card" />
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="ph-page">
      <PublicHeader />

      {/* ═══════ HERO CAROUSEL ═══════ */}
      <section className="ph-hero">
        {slides.map((slide, i) => {
          const isActive = i === cur;
          return (
            <div
              key={i}
              className={[
                'ph-slide',
                isActive ? 'ph-active' : '',
                isActive && animating ? `${ct}-out` : '',
                i === (cur + 1) % n && animating ? `${ct}-in` : '',
              ].filter(Boolean).join(' ')}
            >
              <ImgSkeleton
                src={slide.url}
                alt={slide.alt}
                className="ph-slide-img"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          );
        })}

        {/* ── LIQUID GLASS OVERLAY ── */}
        <div className="ph-glass-bar">
          <div className="ph-glass-pill">
            {/* Raw logo image — no shape/border */}
            <img src="/logo.png" alt="লোগো" className="ph-glass-logo" />
            <div className="ph-glass-texts">
              <h1 className="ph-glass-title">মালখানগর কলেজ</h1>
              <div style={{fontSize: 16}} className="ph-glass-meta">
                <span>সিরাজদিখান, মুন্সিগঞ্জ, ঢাকা </span>
              </div>
              <div className="ph-glass-meta">
                <span>𝖤𝖨𝖨𝖭: 𝟏𝟑𝟒𝟓𝟗𝟎</span>
                {/* <span className="sep">·</span> */}
                <span>𝖬𝖯𝖮: 𝟐𝟗𝟎𝟒𝟏𝟐𝟑𝟏𝟎𝟏</span>
                {/* <span className="sep">·</span>
                <span>ঢাকা বোর্ড</span> */}
              </div>
            </div>
          </div>
        </div>

        {/* Prev / Next arrows */}
        {n > 1 && (
          <>
            <button className="ph-ctrl ph-prev" onClick={() => goTo((cur - 1 + n) % n)}>‹</button>
            <button className="ph-ctrl ph-next" onClick={() => goTo((cur + 1) % n)}>›</button>
            <div className="ph-dots">
              {slides.map((_, i) => (
                <button key={i} className={`ph-dot${i === cur ? ' on' : ''}`} onClick={() => goTo(i)} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── QUICK NAV BUTTONS ── */}
      <div className="ph-hnb">
        <div className="ph-hnb-inner">
          {HERO_BTNS.map((b, i) => (
            <Link key={i} to={b.path} className="ph-hnb-btn" style={{ backgroundColor: b.color }}>
              {b.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="ph-main">
        {/* ─── CONTENT AREA ─── */}
        <div className="ph-content">

          {/* NOTICE BOARD */}
          <div className="ph-box">
            <div className="ph-box-head green"><span>🔔</span><h3>Notice Board</h3></div>
            <div className="ph-box-body">
              {notices.length > 0 ? notices.slice(0, 10).map((n, i) => (
                <div key={n._id || i} className="ph-notice-row">
                  <span className="ph-nr-dot">▶</span>
                  <Link to={`/notices/${n._id}`} className="ph-nr-link">{n.title}</Link>
                  {i < 2 && <span className="ph-nr-new">নতুন</span>}
                  {n.type === 'urgent' && <span className="ph-nr-urgent">জরুরি</span>}
                </div>
              )) : (
                ['এইচএসসি ফর্ম পূরণ চলছে', 'স্নাতক ভর্তি বিজ্ঞপ্তি', 'পরীক্ষার রুটিন প্রকাশ'].map((t, i) => (
                  <div key={i} className="ph-notice-row">
                    <span className="ph-nr-dot">▶</span>
                    <Link to="/notices" className="ph-nr-link">{t}</Link>
                    {i === 0 && <span className="ph-nr-new">নতুন</span>}
                  </div>
                ))
              )}
              <div style={{ textAlign: 'right', marginTop: 10 }}>
                <Link to="/notices" className="ph-more-btn">আরও দেখুন »</Link>
              </div>
            </div>
          </div>

          {/* CONTENT SECTIONS GRID — all content folder files */}
          <div className="ph-grid">
            {CONTENT_SECTIONS.map((sec, i) => (
              <div key={i} className="ph-card">
                <div className="ph-card-head" style={{ backgroundColor: sec.color }}>
                  <span>{sec.icon}</span>
                  <h4>{sec.title}</h4>
                </div>
                <div className="ph-card-body">
                  {sec.items.map(([label, path], j) => (
                    <div key={j} className="ph-card-row">
                      <span className="ph-row-arr">▶</span>
                      <Link to={path} className="ph-row-link">{label}</Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* PHOTO GALLERY — dynamic from hero images */}
          <div className="ph-box">
            <div className="ph-box-head green"><span>📷</span><h3>Photo Gallery</h3></div>
            <div className="ph-gallery-grid">
              {gallery.slice(0, 6).map((img, i) => (
                <button
                  key={i} className="ph-gallery-thumb" type="button"
                  onClick={() => setLightbox({ open: true, idx: i })}
                  aria-label={`Open image ${i + 1}`}
                >
                  <ImgSkeleton
                    src={img.url}
                    alt={img.alt || `ছবি ${i + 1}`}
                    className="ph-gallery-img"
                    style={{ width: '100%', height: '100%' }}
                  />
                  <div className="ph-gallery-ov">🔍</div>
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center', padding: '10px 12px 14px' }}>
              <Link to="/gallery/photos" className="ph-more-btn">সব ছবি দেখুন »</Link>
            </div>
          </div>

          {/* GOOGLE MAP */}
          <div className="ph-box">
            <div className="ph-box-head green"><span>📍</span><h3>Our Location</h3></div>
            <iframe
              title="কলেজ অবস্থান" width="100%" height="280"
              frameBorder="0" loading="lazy" allowFullScreen
              style={{ display: 'block', border: 'none' }}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2871.5546102087783!2d90.42362907405689!3d23.55754499615533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755a52601a27fdd%3A0x6efa6be14a5985c0!2sMalkhanagar%20College!5e1!3m2!1sen!2sbd!4v1"
            />
          </div>
        </div>

        {/* ─── SIDEBAR ─── */}
        <aside className="ph-sidebar">

          {/* সভাপতির বাণী */}
          <div className="ph-sb-card">
            <div className="ph-sb-head green">সভাপতির বাণী</div>
            <div className="ph-sb-body">
              <ImgSkeleton
                src={presidentImg || '/sir.jpg'} alt="সভাপতি"
                style={{ width: '100%', height: 190 }}
                className="ph-sb-photo"
              />
              <p className="ph-sb-name">সভাপতি</p>
              <p className="ph-sb-title">পরিচালনা পর্ষদ, মালখানগর কলেজ</p>
              <Link to="/administration/governing-body" className="ph-sb-view">View Details →</Link>
            </div>
          </div>

          {/* অধ্যক্ষের বাণী */}
          <div className="ph-sb-card">
            <div className="ph-sb-head green">অধ্যক্ষের বাণী</div>
            <div className="ph-sb-body">
              <ImgSkeleton
                src={principalImg || '/sir.jpg'} alt="অধ্যক্ষ"
                style={{ width: '100%', height: 190 }}
                className="ph-sb-photo"
              />
              <p className="ph-sb-name">{principalName || 'অধ্যক্ষ (ভারপ্রাপ্ত)'}</p>
              <p className="ph-sb-title">মালখানগর কলেজ</p>
              <Link to="/about/principal" className="ph-sb-view">View Details →</Link>
            </div>
          </div>

          {/* Important Links */}
          <div className="ph-sb-card">
            <div className="ph-sb-head gdark">Important Links</div>
            <div className="ph-sb-body no-pad">
              {IMP_LINKS.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="ph-sb-link">
                  <span className="ph-sbl-arr">▶</span> {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="ph-sb-card">
            <div className="ph-sb-head green">Calendar</div>
            <div className="ph-sb-body"><MiniCal /></div>
          </div>

          {/* Hotlines */}
          <div className="ph-sb-card">
            <div className="ph-sb-head red">জরুরি হটলাইন</div>
            <div className="ph-sb-body">
              <div className="ph-hotlines">
                {HOTLINES.map((h, i) => (
                  <div key={i} className="ph-hot-item" style={{ borderColor: h.color }}>
                    <span className="ph-hot-num" style={{ color: h.color }}>{h.number}</span>
                    <span className="ph-hot-lbl">{h.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <PublicFooter />

      {lightbox.open && (
        <Lightbox
          images={gallery.slice(0, 6)}
          startIdx={lightbox.idx}
          onClose={() => setLightbox({ open: false, idx: 0 })}
        />
      )}
    </div>
  );
}

/* ── Mini Calendar ── */
function MiniCal() {
  const today = new Date();
  const y = today.getFullYear(), m = today.getMonth();
  const MN = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const DN = ['M','T','W','T','F','S','S'];
  const first = new Date(y, m, 1).getDay();
  const adj   = first === 0 ? 6 : first - 1;
  const days  = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < adj; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  return (
    <div className="ph-cal">
      <div className="ph-cal-head">{MN[m]} {y}</div>
      <div className="ph-cal-grid">
        {DN.map((d, i) => <div key={i} className="ph-cal-dn">{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} className={`ph-cal-d${d === today.getDate() ? ' today' : ''}${!d ? ' empty' : ''}`}>
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  );
}