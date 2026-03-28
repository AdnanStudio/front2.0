// ============================================================
// FILE PATH: src/pages/IDCardGenerator.jsx
// npm install html2canvas jspdf xlsx
// ============================================================
import React, {
  useState, useEffect, useRef, useCallback, useMemo
} from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Download, Printer, Users, User, Loader,
  CreditCard, Upload, X, Search, CheckSquare, Square,
  Eye, EyeOff, RefreshCw, Filter, ChevronDown, ChevronUp,
  CheckCircle, Info, AlertTriangle, FileSpreadsheet,
  BookOpen, GraduationCap, School, Calendar
} from 'lucide-react';
import studentService  from '../services/studentService';
import classService    from '../services/classService';
import websiteService  from '../services/websiteService';
import './IDCardGenerator.css';

// ─────────────────────────────────────────────────────────
//  COLLEGE INFO
// ─────────────────────────────────────────────────────────
const COLLEGE = {
  nameBn : 'মালখানগর কলেজ',
  nameEn : 'MALKHANAGAR COLLEGE',
  address: 'Sirajdikhan, Munshiganj',
  eiin   : '134590',
  mpo    : '2904123101',
  phone  : '01309-134590',
  email  : 'MalkhannagarCollege@gmail.com',
  motto  : 'জ্ঞান · চরিত্র · সেবা',
};

// ─────────────────────────────────────────────────────────
//  PROGRAM COLOR THEMES
// ─────────────────────────────────────────────────────────
export const CARD_THEMES = {
  HSC: {
    id             : 'HSC',
    label          : 'HSC',
    headerGrad     : 'linear-gradient(135deg,#5a0408 0%,#84070f 55%,#c0392b 100%)',
    stripeGrad     : 'linear-gradient(90deg,#84070f,#e74c3c,#84070f)',
    botBarGrad     : 'linear-gradient(90deg,#5a0408 0%,#84070f 40%,#c0392b 70%,#e74c3c 100%)',
    backHdrGrad    : 'linear-gradient(135deg,#5a0408,#84070f)',
    backFootGrad   : 'linear-gradient(135deg,#5a0408,#84070f)',
    photoRingGrad  : 'linear-gradient(135deg,#84070f 0%,#e74c3c 100%)',
    nameColor      : '#5a0408',
    labelBg        : '#5a0408',
    validBg        : '#fef2f2',
    validColor     : '#84070f',
    validBorder    : '#fecaca',
    dividerGrad    : 'linear-gradient(90deg,transparent,#e74c3c,#f59e0b,transparent)',
    accentColor    : '#e74c3c',
    lightBg        : '#fff5f5',
  },
  Degree: {
    id             : 'Degree',
    label          : 'Degree',
    headerGrad     : 'linear-gradient(135deg,#064E3B 0%,#065F46 55%,#059669 100%)',
    stripeGrad     : 'linear-gradient(90deg,#D97706,#FBBF24,#D97706)',
    botBarGrad     : 'linear-gradient(90deg,#065F46 0%,#059669 40%,#D97706 70%,#FBBF24 100%)',
    backHdrGrad    : 'linear-gradient(135deg,#064E3B,#065F46)',
    backFootGrad   : 'linear-gradient(135deg,#064E3B,#059669)',
    photoRingGrad  : 'linear-gradient(135deg,#059669 0%,#D97706 100%)',
    nameColor      : '#064E3B',
    labelBg        : '#1E293B',
    validBg        : '#ECFDF5',
    validColor     : '#065F46',
    validBorder    : '#A7F3D0',
    dividerGrad    : 'linear-gradient(90deg,transparent,#34D399,#FBBF24,transparent)',
    accentColor    : '#059669',
    lightBg        : '#f0fdf4',
  },
  Honours: {
    id             : 'Honours',
    label          : 'Honours',
    headerGrad     : 'linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 55%,#3b82f6 100%)',
    stripeGrad     : 'linear-gradient(90deg,#1d4ed8,#60a5fa,#1d4ed8)',
    botBarGrad     : 'linear-gradient(90deg,#1e3a8a 0%,#1d4ed8 40%,#3b82f6 70%,#60a5fa 100%)',
    backHdrGrad    : 'linear-gradient(135deg,#1e3a8a,#1d4ed8)',
    backFootGrad   : 'linear-gradient(135deg,#1e3a8a,#1d4ed8)',
    photoRingGrad  : 'linear-gradient(135deg,#1d4ed8 0%,#60a5fa 100%)',
    nameColor      : '#1e3a8a',
    labelBg        : '#1e3a8a',
    validBg        : '#eff6ff',
    validColor     : '#1e3a8a',
    validBorder    : '#bfdbfe',
    dividerGrad    : 'linear-gradient(90deg,transparent,#60a5fa,#93c5fd,transparent)',
    accentColor    : '#3b82f6',
    lightBg        : '#f0f7ff',
  },
};

// ─────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────
const fmtDate = d => d
  ? new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit',year:'numeric'})
  : null;

const safeFile = v =>
  (v||'').toString().replace(/\s+/g,'_').replace(/[^\w.-]/g,'');

const getTheme = program => CARD_THEMES[program] || CARD_THEMES.Degree;

// ─────────────────────────────────────────────────────────
//  CARD FRONT
//  ✅ Valid date removed from front
//  ✅ Session shown below Reg. No (from sidebar override)
// ─────────────────────────────────────────────────────────
export const CardFront = React.memo(({ student, logoUrl, settings, program, sessionOverride }) => {
  const theme   = getTheme(program);
  const name    = student.userId?.name || '—';
  const photo   = student.userId?.profileImage || null;
  const cls     = student.class?.name ||(typeof student.class==='string'?student.class:'')||'—';
  const section = student.section    || '—';
  const roll    = student.rollNumber || '—';
  const regNo   = student.registrationNumber || student.studentId || '—';
  // ✅ Session: sidebar override takes priority, then student data
  const session = sessionOverride || student.session || null;
  const nameEn  = settings?.schoolName || COLLEGE.nameEn;
  const addr    = COLLEGE.address;

  return (
    <div className="idc idc-front" style={{ background: theme.lightBg }}>
      {/* ── HEADER ── */}
      <div className="idc-hdr" style={{ background: theme.headerGrad }}>
        <div className="idc-logo-wrap">
          {logoUrl
            ? <img src={logoUrl} alt="logo" crossOrigin="anonymous"
                className="idc-logo-img"
                onError={e=>{e.target.style.display='none';}} />
            : <div className="idc-logo-fb">{COLLEGE.nameBn[0]}</div>
          }
        </div>
        <div className="idc-hdr-text">
          <p className="idc-cname-bn">𝖬𝖠𝖫𝖪𝖧𝖠𝖭𝖠𝖦𝖠𝖱 𝖢𝖮𝖫𝖫𝖤𝖦𝖤</p>
          <p className="idc-cname-en">{addr}</p>
        </div>
      </div>

      {/* ── ACCENT STRIPE ── */}
      <div className="idc-stripe" style={{ background: theme.stripeGrad }} />

      {/* ── PROGRAM BADGE ── */}
      <div className="idc-label-row">
        <span className="idc-card-label" style={{ background: theme.labelBg }}>
          {program ? `${program.toUpperCase()} ` : ''}STUDENT ID CARD
        </span>
      </div>

      {/* ── PHOTO ── */}
      <div className="idc-photo-center">
        <div className="idc-photo-ring" style={{ background: theme.photoRingGrad }}>
          <div className="idc-photo-inner">
            {photo
              ? <img src={photo} alt={name} crossOrigin="anonymous"
                  className="idc-photo-img"
                  onError={e=>{e.target.style.display='none';}} />
              : <div className="idc-photo-ph"><User size={26} /></div>
            }
          </div>
        </div>
      </div>

      {/* ── NAME ── */}
      <div className="idc-name-center">
        <p className="idc-stu-name" style={{ color: theme.nameColor }}>{name}</p>
      </div>

      {/* ── DIVIDER ── */}
      <div className="idc-front-divider" style={{ background: theme.dividerGrad }} />

      {/* ── DETAILS ──
           Valid date removed. Session shown below Reg. No from sidebar.
      ── */}
      <div className="idc-details-block">
        {[
          ['Class',   cls    ],
          ['Section', section],
          ['Roll No', roll   ],
          ['Reg. No', regNo  ],
          ['Session', session],
        ].filter(([,v]) => v && v !== '—' && v !== null).map(([l,v]) => (
          <div key={l} className="idc-detail-row">
            <span className="idc-dl">{l}</span>
            <span className="idc-dsep">:</span>
            <span className="idc-dv">{v}</span>
          </div>
        ))}
      </div>

      {/* ── BOTTOM BAR (no valid date here anymore) ── */}
      <div style={{flex:1}}/>
      <div className="idc-bot-bar" style={{ background: theme.botBarGrad }} />
    </div>
  );
});

// ─────────────────────────────────────────────────────────
//  CARD BACK
// ─────────────────────────────────────────────────────────
export const CardBack = React.memo(({ student, signUrl, validDate, settings, program }) => {
  const theme    = getTheme(program);
  const name     = student.userId?.name || '—';
  const sid      = student.registrationNumber || student.studentId || '—';
  const blood    = student.bloodGroup  || null;
  const dob      = fmtDate(student.userId?.dateOfBirth || student.dateOfBirth);
  const religion = student.religion || student.userId?.religion || null;
  const address  = student.address || student.presentAddress
                || student.permanentAddress || student.userId?.address || null;

  const guardianPhone = student.guardianPhone
    || student.guardianMobile
    || student.fatherPhone
    || student.fatherMobile
    || student.parentPhone
    || student.contactNumber
    || student.emergencyContact
    || null;

  let displayValid = validDate || '';
  if (!displayValid) {
    const session = student.session || '';
    const yp = session ? session.split(/[-–]/) : [];
    const vy = yp.length > 1 ? yp[yp.length-1] : String(new Date().getFullYear()+1);
    displayValid = `31/12/${vy}`;
  }

  const rows = [
    ['Name',          name         ],
    ['DOB', dob          ],
    ['Religion',      religion     ],
    ['Blood',   blood        ],
    ['Guardian',      guardianPhone],
    // ['Address',       address      ],
  ].filter(([,v])=>v);

  return (
    <div className="idc idc-back" style={{ background: '#F8FAFC' }}>
      <div className="idc-back-hdr" style={{ background: theme.backHdrGrad }}>
        <div>
          
          <p className="idc-back-id-val">𝖬𝖠𝖫𝖪𝖧𝖠𝖭𝖠𝖦𝖠𝖱 𝖢𝖮𝖫𝖫𝖤𝖦𝖤</p>
        </div>
      </div>
      <div className="idc-stripe" style={{ background: theme.stripeGrad }} />
      <div className="idc-back-rows">
        {rows.map(([l,v])=>(
          <div key={l} className="idc-back-row">
            <span className="idc-brl">{l}</span>
            <span className="idc-brsep">:</span>
            <span className="idc-brv">{v}</span>
          </div>
        ))}
      </div>
      <div className="idc-notice">
        {/* <AlertTriangle size={20} /> */}
        <span>এই পরিচয়পত্র পাওয়া গেলে নিন্মোক্ত ঠিকানায় যোগাযোগ করুন। <br />
        ⮞ Call : 𝟎𝟏𝟑𝟎𝟗-𝟏𝟑𝟒𝟓𝟗𝟎 </span>
      </div>
      <div className="idc-back-spacer" />
      <div className="idc-back-bottom-row">
        <div className="idc-back-valid">
          <span>Valid: {displayValid}</span>
        </div>
        <div className="idc-back-sig-block">
          {signUrl
            ? <img src={signUrl} alt="Principal Signature" className="idc-back-sig-img" />
            : <div className="idc-back-sig-blank" />
          }
          <div className="idc-back-sig-rule" style={{ background: theme.nameColor }} />
          <p className="idc-back-sig-cap">Principal</p>
        </div>
      </div>
      <div className="idc-back-foot" style={{ background: theme.backFootGrad }}>
        <p className="idc-bf-ids">𝐄𝐈𝐈𝐍 : 𝟏𝟑𝟒𝟓𝟗𝟎 &nbsp;|&nbsp; 𝐂𝐀𝐋𝐋: 𝟎𝟏𝟑𝟎𝟗-𝟏𝟑𝟒𝟓𝟗𝟎</p>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────
//  PROGRESS OVERLAY
// ─────────────────────────────────────────────────────────
const ProgressOverlay = ({ progress, current, total, type = 'pdf' }) => (
  <div className="pg-overlay">
    <div className="pg-box">
      <svg viewBox="0 0 80 80" width="76" height="76">
        <circle cx="40" cy="40" r="32" fill="none" stroke="#E5E7EB" strokeWidth="7" />
        <circle cx="40" cy="40" r="32" fill="none"
          stroke={type === 'excel' ? '#059669' : '#D97706'} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${2*Math.PI*32}`}
          strokeDashoffset={`${2*Math.PI*32*(1-progress/100)}`}
          transform="rotate(-90 40 40)"
          style={{transition:'stroke-dashoffset .3s'}} />
        <text x="40" y="45" textAnchor="middle" fontSize="13" fontWeight="800" fill="#065F46">
          {progress}%
        </text>
      </svg>
      <p className="pg-title">{type==='excel' ? 'Generating Excel…' : 'Generating PDF…'}</p>
      <p className="pg-sub">{current} of {total}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
//  PROGRAM SELECTOR
// ─────────────────────────────────────────────────────────
const ProgramSelector = ({ value, onChange }) => {
  const opts = [
    { key:'HSC',     label:'HSC',     icon:<School size={13}/>,        color:'#84070f' },
    { key:'Degree',  label:'Degree',  icon:<BookOpen size={13}/>,      color:'#065F46' },
    { key:'Honours', label:'Honours', icon:<GraduationCap size={13}/>, color:'#1d4ed8' },
  ];
  return (
    <div className="prog-selector">
      {opts.map(o=>(
        <button key={o.key}
          className={`prog-btn${value===o.key?' on':''}`}
          style={value===o.key ? {
            background: o.color, borderColor: o.color, color:'#fff',
            boxShadow:`0 4px 12px ${o.color}44`,
          } : { borderColor: o.color+'44', color: o.color }}
          onClick={()=>onChange(o.key)}>
          {o.icon}<span>{o.label}</span>
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  PANEL
// ─────────────────────────────────────────────────────────
const Panel = ({ title, icon, children, badge, defaultOpen=true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="panel">
      <button className="panel-head" onClick={()=>setOpen(o=>!o)}>
        <span className="panel-head-l">
          {icon}{title}
          {badge != null && <span className="panel-badge">{badge}</span>}
        </span>
        {open ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
      </button>
      {open && <div className="panel-body">{children}</div>}
    </section>
  );
};

// ─────────────────────────────────────────────────────────
//  UPLOAD FIELD
// ─────────────────────────────────────────────────────────
const UpField = ({ label, val, onUp, onRm, isSig }) => {
  const ref = useRef(null);
  const onChange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => onUp(ev.target.result);
    r.readAsDataURL(f);
    e.target.value = '';
  };
  return (
    <div className="upfield">
      <div className="upfield-label">
        {label}
        {val && <span className="upfield-ok"><CheckCircle size={10}/> Set</span>}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{display:'none'}} onChange={onChange}/>
      <div className="upfield-row">
        <button className="upfield-btn" onClick={()=>ref.current?.click()}>
          <Upload size={11}/>{val?'Change':'Upload'}
        </button>
        {val && <button className="upfield-del" onClick={onRm}><X size={11}/></button>}
      </div>
      {val && (
        <div className="upfield-thumb-wrap">
          <img src={val} alt="" className={`upfield-thumb${isSig?' sig':''}`}/>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  STUDENT ROW
// ─────────────────────────────────────────────────────────
const SRow = React.memo(({ s, sel, isPrev, onToggle, onPrev, program }) => {
  const theme = getTheme(program);
  const nm    = s.userId?.name || '—';
  const ph    = s.userId?.profileImage || null;
  const cls   = s.class?.name||(typeof s.class==='string'?s.class:'')||'';
  return (
    <div className={`srow${sel?' sel':''}`}
      onClick={()=>onToggle(s._id)}
      role="checkbox" aria-checked={sel} tabIndex={0}
      onKeyDown={e=>e.key===' '&&onToggle(s._id)}
      style={sel?{background:theme.validBg,borderLeft:`3px solid ${theme.accentColor}`}:{}}>
      <div className={`srow-chk${sel?' on':''}`} style={sel?{color:theme.accentColor}:{}}>
        {sel ? <CheckSquare size={14}/> : <Square size={14}/>}
      </div>
      <div className="srow-ava">
        {ph ? <img src={ph} alt="" crossOrigin="anonymous"/> : <User size={12}/>}
      </div>
      <div className="srow-info">
        <p className="srow-name">{nm}</p>
        <p className="srow-meta">
          {[cls, s.section, s.rollNumber&&`Roll-${s.rollNumber}`].filter(Boolean).join(' · ')}
        </p>
      </div>
      <button className={`srow-eye${isPrev?' on':''}`}
        onClick={e=>{e.stopPropagation();onPrev(s._id);}}>
        {isPrev ? <EyeOff size={12}/> : <Eye size={12}/>}
      </button>
    </div>
  );
});

// ─────────────────────────────────────────────────────────
//  EXCEL EXPORT
//  ✅ Fixed: Registration No, Religion, Address, Session
// ─────────────────────────────────────────────────────────
const exportToExcel = async ({ students, program, className, section, sessionOverride, toast }) => {
  try {
    let XLSX;
    try { XLSX = await import('xlsx'); }
    catch { toast.error('xlsx not found. Run: npm install xlsx'); return false; }

    const sorted = [...students].sort((a, b) => {
      const ra = parseInt(a.rollNumber, 10) || 0;
      const rb = parseInt(b.rollNumber, 10) || 0;
      if (ra !== rb) return ra - rb;
      return (a.userId?.name || '').localeCompare(b.userId?.name || '');
    });

    const rows = sorted.map((s, idx) => {
      const cls  = s.class?.name || (typeof s.class==='string'?s.class:'') || '—';
      const dob  = (s.userId?.dateOfBirth || s.dateOfBirth)
        ? new Date(s.userId?.dateOfBirth || s.dateOfBirth).toLocaleDateString('en-GB')
        : '—';

      // ✅ Fixed field paths
      const regNo   = s.registrationNumber || s.admissionNo || s.userId?.registrationNumber || '—';
      const religion= s.religion || s.userId?.religion || '—';
      const address = s.address || s.presentAddress || s.permanentAddress || s.userId?.address || '—';
      const session = sessionOverride || s.session || s.userId?.session || '—';

      const guardianPhone = s.guardianPhone || s.guardianMobile || s.fatherPhone
        || s.fatherMobile || s.parentPhone || s.contactNumber || s.emergencyContact || '—';
      const guardianName  = s.guardianName || s.fatherName || s.parentName || '—';

      return {
        'Serial No'       : idx + 1,
        'Name'            : s.userId?.name || '—',
        'Roll Number'     : s.rollNumber   || '—',
        'Registration No' : regNo,
        'Student ID'      : s.studentId   || '—',
        'Class'           : cls,
        'Section'         : s.section     || '—',
        'Session'         : session,
        'Program'         : program       || '—',
        'Guardian Name'   : guardianName,
        'Guardian Phone'  : guardianPhone,
        'Blood Group'     : s.bloodGroup  || '—',
        'Date of Birth'   : dob,
        'Religion'        : religion,
        'Address'         : address,
        'Status'          : s.userId?.isActive ? 'Active' : 'Inactive',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      {wch:10},{wch:26},{wch:13},{wch:18},{wch:16},
      {wch:14},{wch:10},{wch:13},{wch:12},{wch:24},
      {wch:16},{wch:13},{wch:15},{wch:12},{wch:32},{wch:11},
    ];
    ws['!freeze'] = { xSplit:0, ySplit:1 };

    const wb = XLSX.utils.book_new();
    wb.Props = {
      Title: `${className||'Class'} Student List`,
      Subject: `${program||''} Students`,
      Author: COLLEGE.nameEn,
      CreatedDate: new Date(),
    };
    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    const wsSummary = XLSX.utils.json_to_sheet([
      { 'Field':'College',        'Value': COLLEGE.nameEn },
      { 'Field':'Program',        'Value': program     || '—' },
      { 'Field':'Class',          'Value': className   || '—' },
      { 'Field':'Section',        'Value': section     || 'All' },
      { 'Field':'Session',        'Value': sessionOverride || 'From Student Data' },
      { 'Field':'Total Students', 'Value': sorted.length },
      { 'Field':'Generated On',   'Value': new Date().toLocaleString('en-GB') },
      { 'Field':'EIIN',           'Value': COLLEGE.eiin },
      { 'Field':'Phone',          'Value': COLLEGE.phone },
    ]);
    wsSummary['!cols'] = [{wch:20},{wch:36}];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    const fileName = [
      className       || 'Class',
      section         || 'AllSec',
      program         || 'Students',
      sessionOverride || new Date().getFullYear(),
    ].map(p=>safeFile(String(p))).join('_') + '.xlsx';

    XLSX.writeFile(wb, fileName);
    return fileName;
  } catch(err) {
    console.error('Excel export error:', err);
    throw err;
  }
};

// ─────────────────────────────────────────────────────────
//  SETTINGS ICON
// ─────────────────────────────────────────────────────────
const Settings2 = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

// ─────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────
const IDCardGenerator = () => {
  const navigate = useNavigate();

  const [all,        setAll]        = useState([]);
  const [classes,    setClasses]    = useState([]);
  const [sections,   setSections]   = useState([]);
  const [settings,   setSettings]   = useState(null);
  const [logoUrl,    setLogoUrl]    = useState('/logo.png');
  const [signUrl,    setSignUrl]    = useState(null);
  const [customLogo, setCustomLogo] = useState(null);

  // Card config
  const [program,         setProgram]         = useState('Degree');
  const [validDate,       setValidDate]       = useState('');
  const [sessionOverride, setSessionOverride] = useState(''); // ✅ NEW

  // Filters
  const [fCls,  setFCls]  = useState('');
  const [fSec,  setFSec]  = useState('');
  const [fStat, setFStat] = useState('');
  const [q,     setQ]     = useState('');

  // Selection / preview
  const [sel,      setSel]      = useState(new Set());
  const [prevId,   setPrevId]   = useState(null);
  const [prevSide, setPrevSide] = useState('front');

  // Loading
  const [initLoad,     setInitLoad]     = useState(true);
  const [stuLoad,      setStuLoad]      = useState(false);
  const [genning,      setGenning]      = useState(false);
  const [genPct,       setGenPct]       = useState(0);
  const [genCur,       setGenCur]       = useState(0);
  const [genTot,       setGenTot]       = useState(0);
  const [genType,      setGenType]      = useState('pdf');
  const [excelLoading, setExcelLoading] = useState(false);

  // UI
  const [printMode, setPrintMode] = useState(false);
  const [sideOpen,  setSideOpen]  = useState(false);

  const filtered = useMemo(()=>{
    const ql = q.toLowerCase().trim();
    return all.filter(s=>{
      const cls = s.class?.name||(typeof s.class==='string'?s.class:'')||'';
      const nm  = s.userId?.name||'';
      return(
        (!fCls  || cls===fCls) &&
        (!fSec  || s.section===fSec) &&
        (!fStat ||
          (fStat==='active'   && s.userId?.isActive) ||
          (fStat==='inactive' && !s.userId?.isActive)) &&
        (!ql || nm.toLowerCase().includes(ql) ||
                (s.studentId ||'').toLowerCase().includes(ql) ||
                (s.rollNumber||'').toString().includes(ql))
      );
    });
  },[all,fCls,fSec,fStat,q]);

  const selList = useMemo(()=>all.filter(s=>sel.has(s._id)),[all,sel]);
  const allSel  = filtered.length>0 && filtered.every(s=>sel.has(s._id));
  const uniCls  = useMemo(()=>[...new Map(classes.map(c=>[c.name,c])).values()],[classes]);
  const theme   = getTheme(program);

  const currentClassName = useMemo(()=>{
    const sc = classes.find(c=>c._id===fCls || c.name===fCls);
    return sc?.name || fCls || '';
  },[classes,fCls]);

  // Init
  useEffect(()=>{
    (async()=>{
      try{
        const [cr,sr] = await Promise.allSettled([
          classService.getAllClasses(),
          websiteService.getSettings(),
        ]);
        if(cr.status==='fulfilled') setClasses(cr.value?.data||[]);
        if(sr.status==='fulfilled'){
          const d = sr.value?.data||{};
          setSettings(d);
          const logo = d.logo||d.schoolLogo||d.collegeLogo;
          if(logo) setLogoUrl(logo);
        }
      } catch(_){}
      finally{ setInitLoad(false); }
    })();
  },[]);

  useEffect(()=>{
    if(!fCls){ setSections([]); setFSec(''); return; }
    const s = classes.find(c=>c._id===fCls||c.name===fCls);
    if(!s){ setSections([]); return; }
    setSections([...new Set(classes.filter(c=>c.name===s.name).map(c=>c.section).filter(Boolean))].sort());
    setFSec('');
  },[fCls,classes]);

  const fetchStudents = useCallback(async()=>{
    setStuLoad(true); setSel(new Set()); setPrevId(null);
    try{
      const p={};
      const sc = classes.find(c=>c._id===fCls||c.name===fCls);
      if(sc)   p.class   = sc.name;
      if(fSec) p.section = fSec;
      const res  = await studentService.getAllStudents(p);
      const list = res?.data||res?.students||(Array.isArray(res)?res:[]);
      setAll(list);
      toast[list.length?'success':'error'](
        list.length?`${list.length} students loaded`:'No students found'
      );
      if(list.length) setSideOpen(false);
    } catch{ toast.error('Failed to load students'); }
    finally{ setStuLoad(false); }
  },[classes,fCls,fSec]);

  const toggleOne = useCallback(id=>{
    setSel(p=>{const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n;});
  },[]);

  const toggleAll = ()=>{
    const ids = filtered.map(s=>s._id);
    setSel(p=>{
      const n=new Set(p);
      if(allSel) ids.forEach(id=>n.delete(id));
      else       ids.forEach(id=>n.add(id));
      return n;
    });
  };

  const togglePrev = id=>{ setPrevId(p=>p===id?null:id); setPrevSide('front'); };

  const handleLogoUp = b64=>{ setCustomLogo(b64); setLogoUrl(b64); };
  const handleLogoRm = ()=>{
    setCustomLogo(null);
    setLogoUrl(settings?.logo||settings?.schoolLogo||'/logo.png');
  };

  const buildFn = s =>
    [safeFile(s.userId?.name), safeFile(s.class?.name||s.class),
     safeFile(s.rollNumber), safeFile(s.studentId), safeFile(program)]
    .filter(Boolean).join('_')+'.pdf';

  const captureEl = async id=>{
    const h2c = (await import('html2canvas')).default;
    const el  = document.getElementById(id);
    if(!el) return null;
    el.style.left='0px'; el.style.top='0px'; el.style.zIndex='9998';
    await new Promise(r=>setTimeout(r,60));
    const canvas = await h2c(el,{
      scale:4, useCORS:true, allowTaint:true,
      backgroundColor:'#fff', logging:false,
      width:el.offsetWidth||230, height:el.offsetHeight||380,
    });
    el.style.left='-9999px'; el.style.top='-9999px'; el.style.zIndex='-1';
    return canvas;
  };

  const dlOne = async student=>{
    try{
      const {jsPDF} = await import('jspdf');
      const [fc,bc] = await Promise.all([
        captureEl(`idc-f-${student._id}`),
        captureEl(`idc-b-${student._id}`),
      ]);
      if(!fc||!bc){ toast.error('Render failed'); return; }
      const pdf = new jsPDF({orientation:'portrait',unit:'mm',format:[54,90]});
      pdf.addImage(fc.toDataURL('image/jpeg',.96),'JPEG',0,0,54,90);
      pdf.addPage([54,90],'portrait');
      pdf.addImage(bc.toDataURL('image/jpeg',.96),'JPEG',0,0,54,90);
      pdf.save(buildFn(student));
    } catch(err){ console.error(err); toast.error('PDF error'); }
  };

  const handleDlAll = async()=>{
    if(!selList.length){ toast.error('Select at least one student'); return; }
    setGenning(true); setGenPct(0); setGenCur(0); setGenTot(selList.length); setGenType('pdf');
    for(let i=0;i<selList.length;i++){
      setGenCur(i+1);
      setGenPct(Math.round(((i+1)/selList.length)*100));
      await dlOne(selList[i]);
      await new Promise(r=>setTimeout(r,280));
    }
    setGenning(false);
    toast.success(`✅ ${selList.length} PDFs downloaded!`);
  };

  const handleExcelDownload = async()=>{
    const studentsToExport = filtered.length > 0 ? filtered : all;
    if(!studentsToExport.length){ toast.error('No students to export'); return; }
    setExcelLoading(true);
    try{
      const fileName = await exportToExcel({
        students: studentsToExport,
        program,
        className: currentClassName,
        section: fSec,
        sessionOverride,   // ✅
        toast,
      });
      if(fileName) toast.success(`✅ Excel saved: ${fileName}`);
    } catch(err){
      console.error(err);
      toast.error('Excel export failed');
    } finally{ setExcelLoading(false); }
  };

  const handlePrint = ()=>{
    if(!selList.length){ toast.error('Select at least one student'); return; }
    setPrintMode(true);
    setTimeout(()=>{ window.print(); setTimeout(()=>setPrintMode(false),800); },200);
  };

  // ─────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="idcg">
      {genning && (
        <ProgressOverlay progress={genPct} current={genCur} total={genTot} type={genType}/>
      )}

      {/* TOP BAR */}
      <header className="idcg-topbar">
        <div className="idcg-topbar-l">
          <button className="btn-back" onClick={()=>navigate('/dashboard/students')}>
            <ArrowLeft size={15}/><span>Students</span>
          </button>
          <div className="page-heading">
            <div className="page-heading-icon" style={{background:theme.headerGrad}}>
              <CreditCard size={17}/>
            </div>
            <div>
              <h1>ID Card Generator</h1>
              
            </div>
          </div>
          {program && (
            <span className="prog-topbadge" style={{
              background:theme.validBg, color:theme.validColor, borderColor:theme.validBorder,
            }}>{program}</span>
          )}
        </div>
        <div className="idcg-topbar-r">
          {selList.length>0 && (
            <span className="sel-chip" style={{
              background:theme.validBg, borderColor:theme.validBorder, color:theme.validColor,
            }}>
              <CheckCircle size={12}/>{selList.length} selected
            </span>
          )}
          {selList.length>0 && <>
            <button className="tbtn ghost" onClick={()=>setSel(new Set())}>
              <X size={13}/><span>Clear</span>
            </button>
            {/* <button className="tbtn teal" onClick={handlePrint}>
              <Printer size={14}/><span>Print</span>
            </button> */}
            <button className="tbtn amber" onClick={handleDlAll} disabled={genning}>
              <Download size={14}/><span>PDF ({selList.length})</span>
            </button>
          </>}
          {all.length>0 && (
            <button className="tbtn excel" onClick={handleExcelDownload}
              disabled={excelLoading}
              title={`Download Excel for ${currentClassName}${fSec?' · '+fSec:''}`}>
              {excelLoading ? <Loader size={14} className="spin"/> : <FileSpreadsheet size={14}/>}
              <span>{excelLoading?'…':'Excel'}</span>
            </button>
          )}
          <button className="tbtn ghost sidebar-toggle" onClick={()=>setSideOpen(o=>!o)}>
            <Filter size={14}/>
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="idcg-body">

        {/* ── SIDEBAR ── */}
        <aside className={`idcg-sidebar${sideOpen?' open':''}`}>

          {/* ✅ Fixed sidebar header with close button */}
          <div className="sidebar-header">
            <span className="sidebar-header-title">
              <Filter size={13}/> Options
            </span>
            <button className="sidebar-close-btn" onClick={()=>setSideOpen(false)}>
              <X size={16}/>
            </button>
          </div>

          {/* ✅ Scrollable content area */}
          <div className="sidebar-scroll">

            <Panel title="Program / Course" icon={<GraduationCap size={12}/>} defaultOpen={true}>
              <ProgramSelector value={program} onChange={setProgram}/>
              <div className="prog-swatch-row">
                {Object.values(CARD_THEMES).map(t=>(
                  <div key={t.id} className={`prog-swatch${program===t.id?' active':''}`}
                    style={{background:t.headerGrad,
                      outline:program===t.id?`2px solid ${t.accentColor}`:undefined}}
                    title={t.label}/>
                ))}
              </div>
            </Panel>

            <Panel title="Upload" icon={<Upload size={12}/>}>
              <UpField label="College Logo" val={customLogo}
                onUp={handleLogoUp} onRm={handleLogoRm}/>
              <UpField label="Principal Signature (PNG)" val={signUrl}
                onUp={setSignUrl} onRm={()=>setSignUrl(null)} isSig/>
              {/* <div className="hint-box">
                <Info size={10}/>
                <span>Signature appears on the back side. Use transparent PNG for best result.</span>
              </div> */}
            </Panel>

            {/* ✅ Card Settings — with Session input */}
            <Panel title="Card Settings" icon={<Settings2 size={12}/>}>
              <div className="fg">
                <label>Session</label>
                <div className="input-icon-wrap">
                  <Calendar size={12} className="input-icon-left"/>
                  <input
                    className="fsel fsel-padded"
                    type="text"
                    placeholder="e.g. 2023-2024"
                    value={sessionOverride}
                    onChange={e=>setSessionOverride(e.target.value)}
                  />
                  {sessionOverride && (
                    <button className="input-icon-clear" onClick={()=>setSessionOverride('')}>
                      <X size={10}/>
                    </button>
                  )}
                </div>
                <span className="field-hint">
                  Shows on front card below Reg. No. Also saved in Excel export.
                </span>
              </div>
              <div className="fg">
                <label>Valid Till Date (Back Card)</label>
                <input className="fsel date-inp" type="text"
                  placeholder="e.g. 31/12/2026"
                  value={validDate}
                  onChange={e=>setValidDate(e.target.value)}/>
                <span className="field-hint">Leave blank to auto-calculate from session.</span>
              </div>
            </Panel>

            <Panel title="Filter Students" icon={<Filter size={12}/>}>
              <div className="sf-wrap">
                <Search size={12} className="sf-ico"/>
                <input className="sf-inp" type="text"
                  placeholder="Name / ID / Roll…"
                  value={q} onChange={e=>setQ(e.target.value)}/>
                {q && <button className="sf-clr" onClick={()=>setQ('')}><X size={11}/></button>}
              </div>
              <div className="fg-2col">
                <div className="fg">
                  <label>Class</label>
                  <select className="fsel" value={fCls} onChange={e=>setFCls(e.target.value)}>
                    <option value="">All Classes</option>
                    {uniCls.map(c=><option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>Section</label>
                  <select className="fsel" value={fSec} onChange={e=>setFSec(e.target.value)}
                    disabled={!fCls||!sections.length}>
                    <option value="">All</option>
                    {sections.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="fg">
                <label>Status</label>
                <select className="fsel" value={fStat} onChange={e=>setFStat(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button className="load-btn" onClick={fetchStudents}
                disabled={stuLoad||initLoad}
                style={{background:theme.headerGrad}}>
                {stuLoad
                  ? <><Loader size={13} className="spin"/> Loading…</>
                  : <><RefreshCw size={13}/> Load Students</>
                }
              </button>
            </Panel>

            {all.length>0 && (
              <div className="excel-sidebar-block">
                <div className="excel-info">
                  <FileSpreadsheet size={14} style={{color:'#059669',flexShrink:0}}/>
                  <div>
                    <p className="excel-info-title">Download Excel Sheet</p>
                    <p className="excel-info-sub">
                      {filtered.length} students · sorted by roll no.
                      {currentClassName && ` · ${currentClassName}`}
                      {fSec && ` · ${fSec}`}
                      {sessionOverride && ` · ${sessionOverride}`}
                    </p>
                  </div>
                </div>
                <button className="act-btn excel-btn"
                  onClick={handleExcelDownload} disabled={excelLoading}>
                  {excelLoading
                    ? <><Loader size={14} className="spin"/> Generating…</>
                    : <><FileSpreadsheet size={14}/> Download Excel</>
                  }
                </button>
              </div>
            )}

            {all.length>0 && (
              <Panel title="Students" icon={<Users size={12}/>} badge={filtered.length}>
                <div className="selbar">
                  <button className={`selall-btn${allSel?' on':''}`}
                    onClick={toggleAll}
                    style={allSel?{borderColor:theme.accentColor,color:theme.accentColor,background:theme.validBg}:{}}>
                    {allSel
                      ? <><CheckSquare size={12}/> Deselect All</>
                      : <><Square size={12}/> Select All</>
                    }
                  </button>
                  {sel.size>0 && <span className="selcount">{sel.size} selected</span>}
                </div>
                <div className="slist">
                  {filtered.length===0
                    ? <div className="slist-empty"><Search size={18}/><span>No results</span></div>
                    : filtered.map(s=>(
                      <SRow key={s._id} s={s} sel={sel.has(s._id)}
                        isPrev={prevId===s._id}
                        onToggle={toggleOne} onPrev={togglePrev}
                        program={program}/>
                    ))
                  }
                </div>
              </Panel>
            )}

            {selList.length>0 && (
              <div className="action-block">
                <div className="stat-row">
                  {[
                    {v:all.length,      l:'Loaded'  },
                    {v:filtered.length, l:'Filtered'},
                    {v:selList.length,  l:'Selected', hi:true},
                  ].map(({v,l,hi})=>(
                    <div key={l} className={`stat-item${hi?' hi':''}`}
                      style={hi?{color:theme.accentColor}:{}}>
                      <div className="stat-v" style={hi?{color:theme.accentColor}:{}}>{v}</div>
                      <div className="stat-l">{l}</div>
                    </div>
                  ))}
                </div>
                <button className="act-btn amber" onClick={handleDlAll} disabled={genning}
                  style={{background:theme.headerGrad}}>
                  <Download size={15}/> Download PDF ({selList.length})
                </button>
                {/* <button className="act-btn outline" onClick={handlePrint} disabled={genning}
                  style={{borderColor:theme.accentColor,color:theme.validColor}}>
                  <Printer size={15}/> Print Cards
                </button> */}
              </div>
            )}

          </div>{/* end sidebar-scroll */}
        </aside>

        {sideOpen && <div className="sidebar-overlay" onClick={()=>setSideOpen(false)}/>}

        {/* MAIN */}
        <main className="idcg-main">
          {initLoad && (
            <div className="state-box">
              <Loader size={48} className="spin state-ico"/>
              <h3>Initialising…</h3>
            </div>
          )}

          {!initLoad && !all.length && !stuLoad && (
            <div className="state-box">
              <div className="empty-icon" style={{background:theme.headerGrad}}>
                <CreditCard size={40}/>
              </div>
              <h3>ID Card Generator</h3>
              <p>Select a program, then filter and load students.</p>
              <div className="program-preview-grid">
                {Object.values(CARD_THEMES).map(t=>(
                  <button key={t.id}
                    className={`prog-preview-card${program===t.id?' active':''}`}
                    style={{
                      borderColor: program===t.id ? t.accentColor : undefined,
                      background: program===t.id ? t.validBg : undefined,
                    }}
                    onClick={()=>setProgram(t.id)}>
                    <div className="ppc-hdr" style={{background:t.headerGrad}}/>
                    <div className="ppc-body">
                      <p className="ppc-name" style={{color:t.nameColor}}>{t.label}</p>
                      <p className="ppc-sub">
                        {t.id==='HSC'?'Higher Secondary':''}
                        {t.id==='Degree'?'Degree Pass':''}
                        {t.id==='Honours'?'Degree Honours':''}
                      </p>
                    </div>
                    {program===t.id && (
                      <div className="ppc-check" style={{background:t.accentColor}}>
                        <CheckCircle size={12} color="#fff"/>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="howto-grid">
                {[
                  ['01','Program','Choose HSC / Degree / Honours'],
                  ['02','Filter', 'Choose class & section'],
                  ['03','Load',   'Click Load Students'],
                  ['04','Select', 'Tick the students'],
                  ['05','Export', 'PDF, Print or Excel'],
                ].map(([n,t,d])=>(
                  <div key={n} className="howto-card">
                    <div className="howto-n" style={{color:theme.accentColor}}>{n}</div>
                    <div className="howto-t">{t}</div>
                    <div className="howto-d">{d}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stuLoad && (
            <div className="state-box">
              <Loader size={48} className="spin state-ico"/>
              <h3>Loading students…</h3>
            </div>
          )}

          {!stuLoad && all.length>0 && (
            <div className="cards-area">
              <div className="toolbar">
                <div className="toolbar-left">
                  <span className="toolbar-count">
                    {filtered.length} students{sel.size>0 && ` · ${sel.size} selected`}
                  </span>
                  <span className="toolbar-prog-badge" style={{
                    background:theme.validBg, color:theme.validColor, borderColor:theme.validBorder,
                  }}>{program}</span>
                  {sessionOverride && (
                    <span className="toolbar-prog-badge" style={{
                      background:'#f0f9ff', color:'#0369a1', borderColor:'#bae6fd',
                    }}>{sessionOverride}</span>
                  )}
                </div>
                <div className="toolbar-btns">
                  <button className="tb" onClick={toggleAll}>
                    {allSel
                      ? <><CheckSquare size={12}/> Deselect All</>
                      : <><Square size={12}/> Select All</>
                    }
                  </button>
                  <button className="tb excel" onClick={handleExcelDownload}
                    disabled={excelLoading}
                    title="Download Excel sheet sorted by roll number">
                    {excelLoading ? <Loader size={12} className="spin"/> : <FileSpreadsheet size={12}/>}
                    Excel ({filtered.length})
                  </button>
                  {selList.length>0 && <>
                    <button className="tb amber" onClick={handleDlAll}>
                      <Download size={12}/> PDF ({selList.length})
                    </button>
                    {/* <button className="tb teal" onClick={handlePrint}>
                      <Printer size={12}/> Print
                    </button> */}
                  </>}
                </div>
              </div>

              {currentClassName && (
                <div className="excel-bar">
                  <FileSpreadsheet size={13} style={{color:'#059669'}}/>
                  <span>
                    <strong>{currentClassName}{fSec?` · ${fSec}`:''}</strong>
                    {sessionOverride && <> · <strong>{sessionOverride}</strong></>}
                    {' '}— {filtered.length} students. Excel sorted by roll number.
                  </span>
                  <button className="excel-bar-btn" onClick={handleExcelDownload}
                    disabled={excelLoading}>
                    {excelLoading ? <Loader size={11} className="spin"/> : <Download size={11}/>}
                    {excelLoading ? 'Generating…' : 'Download Excel'}
                  </button>
                </div>
              )}

              <div className="card-list">
                {filtered.map(student=>{
                  const isSel  = sel.has(student._id);
                  const isPrev = prevId===student._id;
                  const nm     = student.userId?.name||'—';
                  const cls    = student.class?.name||student.class||'—';
                  const ph     = student.userId?.profileImage||null;
                  const actv   = student.userId?.isActive;

                  return (
                    <div key={student._id}
                      className={`card-row${isSel?' sel':''}${isPrev?' open':''}`}
                      style={isSel?{borderColor:theme.accentColor,background:theme.lightBg}
                        :isPrev?{borderColor:theme.accentColor+'88'}:{}}>
                      <div className="cr-head">
                        <div className="cr-l">
                          <button className={`cr-chk${isSel?' on':''}`}
                            onClick={()=>toggleOne(student._id)}
                            style={isSel?{color:theme.accentColor}:{}}>
                            {isSel?<CheckSquare size={15}/>:<Square size={15}/>}
                          </button>
                          <div className="cr-ava">
                            {ph ? <img src={ph} alt="" crossOrigin="anonymous"/> : <User size={14}/>}
                            <div className={`cr-dot${actv?' active':''}`}/>
                          </div>
                          <div className="cr-text">
                            <p className="cr-name">{nm}</p>
                            <p className="cr-meta">
                              {cls}{student.section&&` · ${student.section}`}
                              {student.rollNumber&&` · Roll ${student.rollNumber}`}
                            </p>
                          </div>
                        </div>
                        <div className="cr-r">
                          <span className={`cr-badge${actv?' active':''}`}>
                            {actv?'Active':'Inactive'}
                          </span>
                          <button className={`cr-btn${isPrev?' on':''}`}
                            onClick={()=>togglePrev(student._id)}
                            style={isPrev?{background:theme.validBg,borderColor:theme.accentColor,color:theme.validColor}:{}}>
                            {isPrev?<EyeOff size={13}/>:<Eye size={13}/>}
                            <span>{isPrev?'Close':'Preview'}</span>
                          </button>
                          <button className="cr-btn amber" onClick={()=>dlOne(student)}>
                            <Download size={13}/><span>PDF</span>
                          </button>
                        </div>
                      </div>
                      {isPrev && (
                        <div className="cr-drawer">
                          <div className="cr-tabs">
                            <button className={`cr-tab${prevSide==='front'?' on':''}`}
                              onClick={()=>setPrevSide('front')}
                              style={prevSide==='front'
                                ?{background:theme.accentColor,borderColor:theme.accentColor}
                                :{borderColor:theme.accentColor,color:theme.accentColor}}>
                              Front Side
                            </button>
                            <button className={`cr-tab${prevSide==='back'?' on':''}`}
                              onClick={()=>setPrevSide('back')}
                              style={prevSide==='back'
                                ?{background:theme.accentColor,borderColor:theme.accentColor}
                                :{borderColor:theme.accentColor,color:theme.accentColor}}>
                              Back Side
                            </button>
                          </div>
                          <div className="cr-stage">
                            <div className="cr-card-wrap">
                              {prevSide==='front'
                                ? <CardFront student={student} logoUrl={logoUrl}
                                    settings={settings} program={program}
                                    sessionOverride={sessionOverride}/>
                                : <CardBack student={student} signUrl={signUrl}
                                    validDate={validDate} settings={settings} program={program}/>
                              }
                            </div>
                            <p className="cr-note">PDF will look exactly like this preview</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PDF POOL */}
      <div className="pdf-pool" aria-hidden="true">
        {selList.map(s=>(
          <React.Fragment key={s._id}>
            <div id={`idc-f-${s._id}`} className="pdf-slot">
              <CardFront student={s} logoUrl={logoUrl}
                settings={settings} program={program} sessionOverride={sessionOverride}/>
            </div>
            <div id={`idc-b-${s._id}`} className="pdf-slot">
              <CardBack student={s} signUrl={signUrl}
                validDate={validDate} settings={settings} program={program}/>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* PRINT ROOT */}
      {printMode && (
        <div id="print-root">
          <div className="print-hdr">
            {COLLEGE.nameBn} — {program} Student Identity Card
            {sessionOverride && ` · Session: ${sessionOverride}`}
          </div>
          {selList.map(s=>(
            <div key={s._id} className="print-page">
              <div className="print-slot">
                <p className="print-lbl">Front</p>
                <CardFront student={s} logoUrl={logoUrl}
                  settings={settings} program={program} sessionOverride={sessionOverride}/>
              </div>
              <div className="print-slot">
                <p className="print-lbl">Back</p>
                <CardBack student={s} signUrl={signUrl}
                  validDate={validDate} settings={settings} program={program}/>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IDCardGenerator;