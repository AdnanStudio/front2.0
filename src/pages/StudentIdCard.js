// ============================================
// FILE PATH: src/pages/StudentIdCard.js
//
// Install: npm install html2canvas jspdf qrcode.react
// ============================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate }     from 'react-router-dom';
import { QRCodeSVG }       from 'qrcode.react';
import toast               from 'react-hot-toast';
import * as studentService from '../services/studentService';
import classService        from '../services/classService';
import websiteService      from '../services/websiteService';
import {
  ArrowLeft, Download, Printer, Users,
  User, Loader, CreditCard, Upload, X, CheckCircle
} from 'lucide-react';
import './StudentIdCard.css';

// ── College defaults (overridden by website settings) ──
const DEFAULTS = {
  nameBn:  'মালখানগর ডিগ্রি কলেজ',
  nameEn:  'Malkhanagar Degree College',
  estd:    'Estd. 1972',
  address: 'মালখানগর, কুমিল্লা, বাংলাদেশ',
  phone:   '+880 XXXX-XXXXXX',
  email:   'info@malkhanagarcollegebd.edu',
  website: 'www.malkhanagarcollegebd.edu',
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('bn-BD') : 'N/A';

// ════════════════════════════════════════════
// FRONT CARD — Horizontal (85.6mm × 54mm)
// Layout matches reference: logo+name header,
// photo left, info right, orange footer
// ════════════════════════════════════════════
const IdCardFront = ({ student, logoUrl, settings }) => {
  const name     = student.userId?.name         || 'N/A';
  const photo    = student.userId?.profileImage || null;
  const phone    = student.userId?.phone        || student.guardianPhone || 'N/A';
  const dob      = fmtDate(student.userId?.dateOfBirth);
  const blood    = student.bloodGroup           || null;
  const session  = student.session              || 'N/A';
  const guardian = student.guardianName         || 'N/A';
  const cls      = student.class?.name || (typeof student.class === 'string' ? student.class : '') || 'N/A';
  const section  = student.section              || 'N/A';
  const roll     = student.rollNumber           || 'N/A';
  const sid      = student.studentId            || 'N/A';

  const yearParts = session !== 'N/A' ? session.split(/[-–]/) : [];
  const yearEnd   = yearParts.length > 1 ? yearParts[yearParts.length - 1] : String(new Date().getFullYear() + 1);

  const nameBn  = settings?.schoolNameBn  || DEFAULTS.nameBn;
  const nameEn  = settings?.schoolName    || DEFAULTS.nameEn;
  const address = settings?.schoolAddress || DEFAULTS.address;

  return (
    <div className="id-card-h front">

      {/* ── HEADER: logo + college name + badge ── */}
      <div className="ich-hdr">
        <div className="ich-logo">
          {logoUrl
            ? <img src={logoUrl} alt="logo" crossOrigin="anonymous"
                onError={e => { e.target.style.display = 'none'; }} />
            : <span className="ich-logo-ltr">ম</span>
          }
        </div>
        <div className="ich-hdr-text">
          <div className="ich-name-bn">{nameBn}</div>
          <div className="ich-name-en">{nameEn}</div>
          <div className="ich-estd">{DEFAULTS.estd} &nbsp;|&nbsp; {address}</div>
        </div>
        <div className="ich-hdr-badge">পরিচয়পত্র</div>
      </div>

      {/* ── BODY: photo left, info right ── */}
      <div className="ich-body">

        {/* Photo + Student ID */}
        <div className="ich-photo-col">
          <div className="ich-photo">
            {photo ? (
              <img
                src={photo}
                alt={name}
                crossOrigin="anonymous"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                }}
              />
            ) : null}
            {!photo && (
              <div className="ich-photo-ph">
                <User size={24} />
                <span>ছবি নেই</span>
              </div>
            )}
          </div>
          <div className="ich-sid-tag">{sid}</div>
        </div>

        {/* Info rows */}
        <div className="ich-info">
          <div className="ich-sname">{name}</div>
          <div className="ich-rows">
            <div className="ich-row">
              <span className="ich-lbl">শ্রেণী</span>
              <span className="ich-sep">:</span>
              <span className="ich-val">{cls}</span>
            </div>
            <div className="ich-row">
              <span className="ich-lbl">শাখা / গ্রুপ</span>
              <span className="ich-sep">:</span>
              <span className="ich-val">{section}</span>
            </div>
            <div className="ich-row">
              <span className="ich-lbl">রোল নং</span>
              <span className="ich-sep">:</span>
              <span className="ich-val">{roll}</span>
            </div>
            <div className="ich-row">
              <span className="ich-lbl">সেশন</span>
              <span className="ich-sep">:</span>
              <span className="ich-val">{session}</span>
            </div>
            <div className="ich-row">
              <span className="ich-lbl">পিতা / অভিভাবক</span>
              <span className="ich-sep">:</span>
              <span className="ich-val">{guardian}</span>
            </div>
            <div className="ich-row">
              <span className="ich-lbl">মোবাইল</span>
              <span className="ich-sep">:</span>
              <span className="ich-val">{phone}</span>
            </div>
            <div className="ich-row">
              <span className="ich-lbl">জন্ম তারিখ</span>
              <span className="ich-sep">:</span>
              <span className="ich-val">{dob}</span>
            </div>
            {blood && (
              <div className="ich-row">
                <span className="ich-lbl">রক্তের গ্রুপ</span>
                <span className="ich-sep">:</span>
                <span className="ich-val blood">{blood}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FOOTER: orange bar ── */}
      <div className="ich-ftr">
        <span className="ich-ftr-addr">{address}</span>
        <span className="ich-ftr-valid">মেয়াদ : ৩১/১২/{yearEnd}</span>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════
// BACK CARD — Horizontal
// Layout: terms+contact left, QR+validity+sign right
// ════════════════════════════════════════════
const IdCardBack = ({ student, signatureUrl, settings }) => {
  const session  = student.session || 'N/A';
  const yearParts= session !== 'N/A' ? session.split(/[-–]/) : [];
  const yearEnd  = yearParts.length > 1 ? yearParts[yearParts.length - 1] : String(new Date().getFullYear() + 1);
  const admDate  = fmtDate(student.admissionDate || student.createdAt);
  const nameEn   = settings?.schoolName    || DEFAULTS.nameEn;
  const nameBn   = settings?.schoolNameBn  || DEFAULTS.nameBn;
  const phone    = settings?.schoolPhone   || DEFAULTS.phone;
  const email    = settings?.schoolEmail   || DEFAULTS.email;

  const qrValue = [
    nameEn,
    `ID:${student.studentId}`,
    student.userId?.name || '',
    student.class?.name || (typeof student.class === 'string' ? student.class : '') || '',
    `Roll:${student.rollNumber}`,
    `Session:${student.session || ''}`,
  ].join(' | ');

  return (
    <div className="id-card-h back">

      {/* ── HEADER ── */}
      <div className="ich-bhdr">
        <span className="ich-bhdr-title">নিয়মাবলী ও শর্তসমূহ</span>
        <span className="ich-bhdr-college">{nameEn}</span>
      </div>

      {/* ── BODY ── */}
      <div className="ich-bbody">

        {/* Left: terms + contact */}
        <div className="ich-bleft">
          <div className="ich-terms-ttl">নিয়মাবলী</div>
          {[
            'এই কার্ড অহস্তান্তরযোগ্য এবং সর্বদা বহন বাধ্যতামূলক।',
            'কার্ড হারিয়ে গেলে অবিলম্বে কলেজ অফিসে জানান।',
            'কর্তৃপক্ষের চাহিদামতে এই কার্ড প্রদর্শন করতে হবে।',
            'পাওয়া গেলে নিকটস্থ কলেজ অফিসে জমা দেওয়ার অনুরোধ।',
          ].map((t, i) => (
            <div className="ich-term" key={i}>
              <div className="ich-tdot" />
              <span className="ich-ttext">{t}</span>
            </div>
          ))}

          <div className="ich-cbox">
            <div className="ich-cttl">যোগাযোগ</div>
            <div className="ich-crow">
              <span className="ich-clbl">ফোন</span>
              <span className="ich-cval">{phone}</span>
            </div>
            <div className="ich-crow">
              <span className="ich-clbl">ইমেইল</span>
              <span className="ich-cval">{email}</span>
            </div>
            <div className="ich-crow">
              <span className="ich-clbl">ওয়েব</span>
              <span className="ich-cval">{DEFAULTS.website}</span>
            </div>
          </div>
        </div>

        {/* Right: QR + validity + signature */}
        <div className="ich-bright">
          <div className="ich-qr-wrap">
            <div className="ich-qr-box">
              <QRCodeSVG
                value={qrValue}
                size={52}
                bgColor="#ffffff"
                fgColor="#0a2d6e"
                level="M"
              />
            </div>
            <span className="ich-qr-lbl">স্ক্যান করুন</span>
          </div>

          <div className="ich-validity">
            <div className="ich-vrow">
              <span className="ich-vlbl">ভর্তি</span>
              <span className="ich-vval">{admDate}</span>
            </div>
            <div className="ich-vrow">
              <span className="ich-vlbl">মেয়াদ</span>
              <span className="ich-vval">৩১/১২/{yearEnd}</span>
            </div>
          </div>

          <div className="ich-sign-blk">
            {signatureUrl
              ? <img src={signatureUrl} alt="স্বাক্ষর" className="ich-sign-img" />
              : <div className="ich-sign-line" />
            }
            <span className="ich-sign-lbl">অধ্যক্ষ</span>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="ich-bftr">
        <span className="ich-bftr-name">{nameBn}</span>
        <span className="ich-bftr-tag">জ্ঞান • চরিত্র • সেবা</span>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════
// Download single student card as PDF
// Captures a hidden div that has both front+back
// ════════════════════════════════════════════
const downloadPdf = async (wrapId, name) => {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF }   = await import('jspdf');

    const el = document.getElementById(wrapId);
    if (!el) { toast.error('কার্ড পাওয়া যায়নি'); return; }

    // Temporarily show the hidden element
    el.style.position = 'static';
    el.style.visibility = 'visible';
    el.style.left = '0';
    el.style.top = '0';
    el.style.zIndex = '9999';
    el.style.background = 'white';

    await new Promise(r => setTimeout(r, 150)); // let DOM render

    const canvas = await html2canvas(el, {
      scale: 4,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Re-hide
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    el.style.zIndex = '-1';
    el.style.visibility = 'hidden';

    const imgData = canvas.toDataURL('image/jpeg', 0.97);

    // Page = two cards side by side (front 85.6 + gap 5 + back 85.6) × 54mm
    const W = 85.6 * 2 + 5 + 6; // ~182mm
    const H = 54 + 6;             // ~60mm
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [W, H] });
    pdf.addImage(imgData, 'JPEG', 3, 3, W - 6, H - 6);
    pdf.save(`ID_Card_${name.replace(/\s+/g, '_')}.pdf`);
    toast.success('✅ PDF ডাউনলোড হয়েছে!');
  } catch (err) {
    console.error(err);
    toast.error('PDF ব্যর্থ। html2canvas ও jspdf install করুন।');
  }
};

// ════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ════════════════════════════════════════════
const StudentIdCard = () => {
  const navigate = useNavigate();

  const [students,      setStudents]      = useState([]);
  const [classes,       setClasses]       = useState([]);
  const [filterClass,   setFilterClass]   = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterSearch,  setFilterSearch]  = useState('');
  const [sections,      setSections]      = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [loadingCls,    setLoadingCls]    = useState(true);

  // From website settings
  const [logoUrl,       setLogoUrl]       = useState(null);
  const [settings,      setSettings]      = useState(null);

  // Principal signature
  const [signatureUrl,  setSignatureUrl]  = useState(null);
  const signRef = useRef();

  // ── Load logo + settings ─────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await websiteService.getSettings();
        const d   = res.data || {};
        setSettings(d);
        // Backend model has `logo` field (Cloudinary URL)
        if (d.logo && d.logo.trim()) {
          setLogoUrl(d.logo);
        } else {
          // Fallback: public folder logo
          setLogoUrl('/logo.png');
        }
      } catch {
        setLogoUrl('/logo.png');
      }
    })();
  }, []);

  // ── Load classes ─────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await classService.getAllClasses();
        setClasses(res.data || []);
      } catch { toast.error('Class লোড হয়নি'); }
      finally   { setLoadingCls(false); }
    })();
  }, []);

  // ── Update sections when class changes ───────
  useEffect(() => {
    if (filterClass) {
      const sel = classes.find(c => c._id === filterClass);
      if (sel) {
        const same   = classes.filter(c => c.name === sel.name);
        const unique = [...new Set(same.map(c => c.section))].sort();
        setSections(unique);
      } else setSections([]);
    } else {
      setSections([]);
      setFilterSection('');
    }
  }, [filterClass, classes]);

  // ── Fetch students ───────────────────────────
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterClass) {
        const sel = classes.find(c => c._id === filterClass);
        if (sel) params.class = sel.name;
      }
      if (filterSection) params.section = filterSection;

      const res  = await studentService.getAllStudents(params);
      let   data = res.data || [];

      // Client-side search filter
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase();
        data = data.filter(s =>
          s.userId?.name?.toLowerCase().includes(q) ||
          s.studentId?.toLowerCase().includes(q)
        );
      }

      setStudents(data);
      if (data.length > 0)
        toast.success(`${data.length}টি কার্ড তৈরি হয়েছে`, { icon: '🎴' });
      else
        toast('কোনো student পাওয়া যায়নি', { icon: '🔍' });
    } catch { toast.error('Students লোড হয়নি'); }
    finally   { setLoading(false); }
  }, [filterClass, filterSection, filterSearch, classes]);

  // ── Signature upload ─────────────────────────
  const onSignUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('শুধু image file দিন'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setSignatureUrl(reader.result);
    reader.readAsDataURL(file);
    toast.success('স্বাক্ষর আপলোড হয়েছে');
  };

  // ── Print all ────────────────────────────────
  const printAll = () => window.print();

  // ─────────────────────────────────────────────
  return (
    <div className="icp-page">

      {/* ── Page Header ── */}
      <div className="icp-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="icp-back-btn"
            onClick={() => navigate('/dashboard/students')}>
            <ArrowLeft size={17} /> Students
          </button>
          <h1>
            <CreditCard size={22} color="#c0392b" />
            ID Card Generator
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {students.length > 0 && (
            <span className="icp-count-badge">
              <Users size={13} /> {students.length} টি কার্ড
            </span>
          )}
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="icp-controls">
        <div className="icp-controls-row">

          {/* Class */}
          <div className="icp-field">
            <label>শ্রেণী</label>
            <select value={filterClass} disabled={loadingCls}
              onChange={e => setFilterClass(e.target.value)}>
              <option value="">সব শ্রেণী</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div className="icp-field">
            <label>শাখা</label>
            <select value={filterSection} disabled={!filterClass}
              onChange={e => setFilterSection(e.target.value)}>
              <option value="">সব শাখা</option>
              {sections.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="icp-field">
            <label>অনুসন্ধান</label>
            <input type="text" value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              placeholder="নাম বা Student ID..." />
          </div>

          {/* Principal Signature */}
          <div className="icp-field">
            <label>অধ্যক্ষের স্বাক্ষর (ঐচ্ছিক)</label>
            <div className="icp-sign-upload-area">
              <input ref={signRef} type="file" accept="image/*"
                style={{ display: 'none' }} onChange={onSignUpload} />
              <button type="button" className="icp-sign-upload-btn"
                onClick={() => signRef.current?.click()}>
                <Upload size={14} />
                {signatureUrl ? 'পরিবর্তন করুন' : 'স্বাক্ষর আপলোড'}
              </button>
              {signatureUrl && (
                <>
                  <img src={signatureUrl} className="icp-sign-thumb" alt="sign" />
                  <button type="button" className="icp-sign-remove"
                    onClick={() => setSignatureUrl(null)}>
                    <X size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <button className="icp-btn-generate"
              onClick={fetchStudents} disabled={loading}>
              {loading
                ? <Loader size={15} className="spin-ic" />
                : <Users size={15} />}
              {loading ? 'লোড হচ্ছে...' : 'Generate Cards'}
            </button>
            {students.length > 0 && (
              <button className="icp-btn-print" onClick={printAll}>
                <Printer size={15} /> Print All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div className="icp-grid">
        {loading ? (
          <div className="icp-empty">
            <Loader size={56} className="spin-ic" color="#c0392b" />
            <h3>Students লোড হচ্ছে...</h3>
          </div>
        ) : students.length === 0 ? (
          <div className="icp-empty">
            <CreditCard size={72} color="#cbd5e1" />
            <h3>কোনো Card নেই</h3>
            <p>উপরে filter করে Generate Cards চাপুন</p>
          </div>
        ) : (
          students.map((student) => {
            const wrapId  = `icp-dl-${student._id}`;
            const sname   = student.userId?.name || 'student';

            return (
              <div key={student._id} className="icp-card-wrapper">

                {/* Front label */}
                <div className="icp-card-label-bar">
                  <span style={{ color: '#c0392b', fontSize: 14 }}>◆</span>
                  সামনের পিঠ — Front Side
                </div>

                {/* Front card */}
                <div className="icp-card-pad">
                  <IdCardFront
                    student={student}
                    logoUrl={logoUrl}
                    settings={settings}
                  />
                </div>

                {/* Back label */}
                <div className="icp-card-label-bar">
                  <span style={{ color: '#1a4a9e', fontSize: 14 }}>◆</span>
                  পেছনের পিঠ — Back Side
                </div>

                {/* Back card */}
                <div className="icp-card-pad back-pad">
                  <IdCardBack
                    student={student}
                    signatureUrl={signatureUrl}
                    settings={settings}
                  />
                </div>

                {/* ── Hidden capture target (both cards side by side) ── */}
                <div
                  id={wrapId}
                  style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: '-9999px',
                    visibility: 'hidden',
                    display: 'flex',
                    gap: '5px',
                    background: 'white',
                    padding: '3px',
                    zIndex: -1,
                  }}
                >
                  {/* Front at exact aspect ratio */}
                  <div style={{ width: 342, height: 216, flexShrink: 0 }}>
                    <IdCardFront
                      student={student}
                      logoUrl={logoUrl}
                      settings={settings}
                    />
                  </div>
                  {/* Back at exact aspect ratio */}
                  <div style={{ width: 342, height: 216, flexShrink: 0 }}>
                    <IdCardBack
                      student={student}
                      signatureUrl={signatureUrl}
                      settings={settings}
                    />
                  </div>
                </div>

                {/* Download PDF button */}
                <button
                  className="icp-dl-btn"
                  onClick={() => downloadPdf(wrapId, sname)}
                >
                  <Download size={16} />
                  PDF Download করুন
                </button>

              </div>
            );
          })
        )}
      </div>

      {/* ══ PRINT ROOT ════════════════════════════
          Hidden normally, shown only during print.
          Each student on its own A4 page (landscape):
          front card | back card
          ═══════════════════════════════════════ */}
      {students.length > 0 && (
        <div id="icp-print-root" style={{ display: 'none' }}>
          {students.map((student) => (
            <div key={`pr-${student._id}`} className="icp-print-page">

              {/* Front */}
              <div className="icp-print-card">
                <IdCardFront
                  student={student}
                  logoUrl={logoUrl}
                  settings={settings}
                />
              </div>

              {/* Back */}
              <div className="icp-print-card">
                <IdCardBack
                  student={student}
                  signatureUrl={signatureUrl}
                  settings={settings}
                />
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default StudentIdCard;