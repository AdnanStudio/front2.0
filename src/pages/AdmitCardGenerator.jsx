
// FILE PATH: src/pages/AdmitCardGenerator.jsx
// npm install html2canvas jspdf
// ============================================================
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Download, Users, User, Loader, FileText, Upload,
  X, Search, CheckSquare, Square, Eye, EyeOff, RefreshCw,
  Filter, ChevronDown, ChevronUp, CheckCircle, Plus, Trash2,
  Calendar, Clock, BookOpen, GraduationCap, School, Building,
  Hash, MapPin, Printer,
  AlignLeft,
  Target
} from 'lucide-react';
import studentService  from '../services/studentService';
import classService    from '../services/classService';
import websiteService  from '../services/websiteService';
import './AdmitCardGenerator.css';

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
};

// ─────────────────────────────────────────────────────────
//  PROGRAM THEMES
// ─────────────────────────────────────────────────────────
const THEMES = {
  HSC: {
    hg  : 'linear-gradient(135deg,#5a0408 0%,#84070f 55%,#c0392b 100%)',
    ac  : '#e74c3c', nc: '#5a0408', th: '#5a0408',
    vb  : '#fef2f2', vc: '#84070f', vbr: '#fecaca',
    stg : 'linear-gradient(90deg,#84070f,#e74c3c,#f39c12,#84070f)',
  },
  Degree: {
    hg  : 'linear-gradient(135deg,#064E3B 0%,#065F46 55%,#059669 100%)',
    ac  : '#059669', nc: '#064E3B', th: '#065F46',
    vb  : '#ECFDF5', vc: '#065F46', vbr: '#A7F3D0',
    stg : 'linear-gradient(90deg,#065F46,#059669,#D97706,#065F46)',
  },
  Honours: {
    hg  : 'linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 55%,#3b82f6 100%)',
    ac  : '#3b82f6', nc: '#1e3a8a', th: '#1d4ed8',
    vb  : '#eff6ff', vc: '#1e3a8a', vbr: '#bfdbfe',
    stg : 'linear-gradient(90deg,#1d4ed8,#3b82f6,#60a5fa,#1d4ed8)',
  },
};
const getT = p => THEMES[p] || THEMES.Degree;
const safeFile = v => (v||'').toString().replace(/\s+/g,'_').replace(/[^\w.-]/g,'');

// ─────────────────────────────────────────────────────────
//  ADMIT CARD COMPONENT  (A4 portrait, 794px wide)
// ─────────────────────────────────────────────────────────
export const AdmitCard = React.memo(({ student, logoUrl, signUrl, examConfig, subjects, program, settings }) => {
  const t = getT(program);
  const name       = student.userId?.name || '—';
  const photo      = student.userId?.profileImage || null;
  const rollNo     = student.rollNumber || '—';
  const regNo      = student.registrationNumber || student.studentId || '—';
  const cls        = student.class?.name || (typeof student.class==='string'?student.class:'') || '—';
  const section    = student.section || '';
  const session    = examConfig.session || student.session || '—';
  const fatherName = student.fatherName || student.guardianName || '—';
  const dob        = student.userId?.dateOfBirth
    ? new Date(student.userId.dateOfBirth).toLocaleDateString('en-GB')
    : (student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB') : '—');

  return (
    <div className="admit-card">

      {/* ── DECORATIVE TOP BORDER ── */}
      <div className="ac-top-border" style={{ background: t.stg }} />

      {/* ── HEADER ── */}
      <div className="ac-header" style={{ background: t.hg }}>
        <div className="ac-logo-wrap">
          {logoUrl
            ? <img src={logoUrl} alt="logo" crossOrigin="anonymous" className="ac-logo-img"
                onError={e=>{e.target.style.display='none';}} />
            : <div className="ac-logo-fb">{COLLEGE.nameBn[0]}</div>
          }
        </div>
        <div className="ac-hdr-center">
          <p className="ac-college-name">MALKHANAGAR COLLEGE</p>
          
          <div className="ac-divider-line" />
          <p className="ac-exam-title">{examConfig.name || 'EXAMINATION ADMIT CARD'}</p>
          <p className="ac-exam-meta">
             Academic Year: {examConfig.year || new Date().getFullYear()}
          </p>
        </div>
        <div className="ac-hdr-right">
          <div className="ac-eiin-badge">
            {/* <p className="ac-eiin-label">EIIN</p> */}
            <p className="ac-eiin-val">{program}</p>
            <p className="ac-eiin-val">Course</p>
          </div>
        </div>
      </div>

      {/* ── STRIPE ── */}
      <div className="ac-stripe" style={{ background: t.stg }} />

      {/* ── STUDENT INFO + PHOTO ── */}
      <div className="ac-body">
        <div className="ac-info-section">

          {/* Barcode-style decorative strip */}
          

          <div className="ac-info-row">
            {/* Details */}
            <div className="ac-details-block">
              {[
                ['Name',  name],
                ['Class / Course',     `${cls}${section?' — '+section:''}`],
                ['Roll No.',           rollNo],
                ['Session',            session],
                ['Exam Center',        examConfig.center || COLLEGE.nameEn],
                ['Room No.',        examConfig.centerCode || COLLEGE.eiin],
              ].map(([l,v])=>(
                <div key={l} className="ac-drow">
                  <span className="ac-dl">{l}</span>
                  <span className="ac-dsep">:</span>
                  <span className="ac-dv">{v}</span>
                </div>
              ))}
            </div>

            {/* Photo */}
            <div className="ac-photo-section">
              <div className="ac-photo-frame" style={{ borderColor: t.ac }}>
                {photo
                  ? <img src={photo} alt={name} crossOrigin="anonymous" className="ac-photo-img"
                      onError={e=>{e.target.style.display='none';}} />
                  : <div className="ac-photo-ph"><User size={40}/></div>
                }
              </div>
              
              {/* <div className="ac-candidate-sig">
                <div className="ac-sig-area" />
                <div className="ac-sig-line" style={{ background: t.ac }} />
                <p className="ac-sig-label">Candidate's Signature</p>
              </div> */}
            </div>
          </div>
        </div>

        {/* ── SUBJECT TABLE ── */}
        <div className="ac-table-section">
          <div className="ac-table-title" style={{ background: t.th+'22', borderLeft:`4px solid ${t.ac}` }}>
            <BookOpen size={14} style={{ color: t.nc }} />
            <span style={{ color: t.nc }}>Examination Schedule / পরীক্ষার সূচি</span>
          </div>
          <table className="ac-sub-table">
            <thead>
              <tr style={{ background: t.th }}>
                <th className="ac-th">Subject Code</th>
                <th className="ac-th">Subject Name</th>
                <th className="ac-th">Exam Date</th>
                <th className="ac-th">Timings</th>
                <th className="ac-th">Max Marks</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign:'center', color:'#94A3B8', padding:'16px', fontStyle:'italic' }}>
                    No subjects configured
                  </td>
                </tr>
              ) : subjects.map((sub, i) => (
                <tr key={i} className={i%2===0 ? 'ac-tr-even' : 'ac-tr-odd'}>
                  <td className="ac-td-center ac-td-mono">{sub.code || '—'}</td>
                  <td className="ac-td">{sub.name || '—'}</td>
                  <td className="ac-td-center">{sub.date || '—'}</td>
                  <td className="ac-td-center">{sub.time || '—'}</td>
                  <td className="ac-td-center ac-td-marks">{sub.maxMarks || '100'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── IMPORTANT NOTES ── */}
        {/* <div className="ac-notes" style={{ borderColor: t.ac+'44' }}>
          <p className="ac-notes-title" style={{ color: t.nc }}>
            ★ Important Instructions / গুরুত্বপূর্ণ নির্দেশনাবলি
          </p>
          <ol className="ac-notes-list">
            <li>পরীক্ষা শুরুর কমপক্ষে <strong>৩০ মিনিট আগে</strong> পরীক্ষা কেন্দ্রে রিপোর্ট করতে হবে। Candidates must report at least <strong>30 minutes</strong> before the exam.</li>
            <li>এই প্রবেশপত্র অবশ্যই একটি বৈধ ফটো আইডিসহ উপস্থাপন করতে হবে। This admit card must be presented with a valid photo ID.</li>
            <li>পরীক্ষার হলে মোবাইল ফোন ও ইলেকট্রনিক ডিভাইস সম্পূর্ণ নিষিদ্ধ। Mobile phones and electronic devices are strictly prohibited.</li>
            <li>ছবি না থাকলে অধ্যক্ষ কর্তৃক প্রত্যয়িত সাম্প্রতিক পাসপোর্ট ছবি লাগাতে হবে।</li>
            <li>এই প্রবেশপত্র হস্তান্তরযোগ্য নয় এবং পরীক্ষার পরেও সংরক্ষণ করতে হবে।</li>
          </ol>
        </div> */}

        {/* ── SIGNATURE ROW ── */}
        <div className="ac-sign-row" style={{ borderTopColor: t.ac+'55' }}>
          <div className="ac-sign-block">
            <div className="ac-sign-blank-area" />
            <div className="ac-sign-rule" style={{ background: t.ac }} />
            <p className="ac-sign-cap">Candidate's Signature</p>
          </div>
          <div className="ac-sign-center-info">
            <p className="ac-sign-college" style={{ color: t.nc }}>{COLLEGE.nameEn}</p>
            <p className="ac-sign-addr">{COLLEGE.address}</p>
            <p className="ac-sign-phone">☎ {COLLEGE.phone}</p>
          </div>
          <div className="ac-sign-block">
            {signUrl
              ? <img src={signUrl} alt="Controller Signature" className="ac-ctrl-sign-img" />
              : <div className="ac-sign-blank-area" />
            }
            <div className="ac-sign-rule" style={{ background: t.ac }} />
            <p className="ac-sign-cap">Controller of Examinations</p>
          </div>
        </div>
      </div>

      {/* ── FOOTER BAR ── */}
      <div className="ac-footer-bar" style={{ background: t.hg }}>
        <p className="ac-footer-text">
          𝐄𝐈𝐈𝐍: {COLLEGE.eiin} &nbsp;|&nbsp; ☎ {COLLEGE.phone} &nbsp;|&nbsp; {COLLEGE.email}
        </p>
      </div>

      <div className="ac-bottom-border" style={{ background: t.stg }} />
    </div>
  );
});

// ─────────────────────────────────────────────────────────
//  PROGRESS OVERLAY
// ─────────────────────────────────────────────────────────
const ProgressOverlay = ({ progress, current, total }) => (
  <div className="pg-overlay">
    <div className="pg-box">
      <svg viewBox="0 0 80 80" width="76" height="76">
        <circle cx="40" cy="40" r="32" fill="none" stroke="#E5E7EB" strokeWidth="7"/>
        <circle cx="40" cy="40" r="32" fill="none" stroke="#D97706" strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${2*Math.PI*32}`}
          strokeDashoffset={`${2*Math.PI*32*(1-progress/100)}`}
          transform="rotate(-90 40 40)"
          style={{transition:'stroke-dashoffset .3s'}}/>
        <text x="40" y="45" textAnchor="middle" fontSize="13" fontWeight="800" fill="#065F46">{progress}%</text>
      </svg>
      <p className="pg-title">Generating PDF…</p>
      <p className="pg-sub">{current} of {total}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
//  PANEL
// ─────────────────────────────────────────────────────────
const Panel = ({ title, icon, children, badge, defaultOpen=true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="acg-panel">
      <button className="acg-panel-head" onClick={()=>setOpen(o=>!o)}>
        <span className="acg-panel-hl">{icon}{title}
          {badge!=null && <span className="acg-panel-badge">{badge}</span>}
        </span>
        {open ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
      </button>
      {open && <div className="acg-panel-body">{children}</div>}
    </section>
  );
};

// ─────────────────────────────────────────────────────────
//  PROGRAM SELECTOR
// ─────────────────────────────────────────────────────────
const ProgramSelector = ({ value, onChange }) => (
  <div className="prog-sel">
    {[
      {k:'HSC',    label:'HSC',     color:'#84070f'},
      {k:'Degree', label:'Degree',  color:'#065F46'},
      {k:'Honours',label:'Honours', color:'#1d4ed8'},
    ].map(o=>(
      <button key={o.k}
        className={`prog-sel-btn${value===o.k?' on':''}`}
        style={value===o.k
          ? {background:o.color, borderColor:o.color, color:'#fff', boxShadow:`0 4px 12px ${o.color}44`}
          : {borderColor:o.color+'44', color:o.color}}
        onClick={()=>onChange(o.k)}>
        {o.label}
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────
//  UPLOAD FIELD
// ─────────────────────────────────────────────────────────
const UpField = ({ label, val, onUp, onRm, isSig }) => {
  const ref = useRef(null);
  const onChange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => onUp(ev.target.result);
    r.readAsDataURL(f); e.target.value = '';
  };
  return (
    <div className="upfield">
      <div className="upfield-lbl">{label}
        {val && <span className="upfield-ok"><CheckCircle size={10}/> Set</span>}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{display:'none'}} onChange={onChange}/>
      <div style={{display:'flex', gap:6}}>
        <button className="upfield-btn" onClick={()=>ref.current?.click()}>
          <Upload size={11}/>{val?'Change':'Upload'}
        </button>
        {val && <button className="upfield-del" onClick={onRm}><X size={11}/></button>}
      </div>
      {val && <div className="upfield-thumb-wrap">
        <img src={val} alt="" className={`upfield-thumb${isSig?' sig':''}`}/>
      </div>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  STUDENT ROW (sidebar list)
// ─────────────────────────────────────────────────────────
const SRow = React.memo(({ s, sel, isPrev, onToggle, onPrev, program }) => {
  const t = getT(program);
  const nm  = s.userId?.name || '—';
  const ph  = s.userId?.profileImage || null;
  const cls = s.class?.name||(typeof s.class==='string'?s.class:'')||'';
  return (
    <div className={`srow${sel?' sel':''}`} onClick={()=>onToggle(s._id)}
      style={sel?{background:t.vb, borderLeft:`3px solid ${t.ac}`}:{}}
      role="checkbox" aria-checked={sel} tabIndex={0}
      onKeyDown={e=>e.key===' '&&onToggle(s._id)}>
      <div className={`srow-chk${sel?' on':''}`} style={sel?{color:t.ac}:{}}>
        {sel?<CheckSquare size={14}/>:<Square size={14}/>}
      </div>
      <div className="srow-ava">
        {ph?<img src={ph} alt="" crossOrigin="anonymous"/>:<User size={12}/>}
      </div>
      <div className="srow-info">
        <p className="srow-name">{nm}</p>
        <p className="srow-meta">{[cls, s.section, s.rollNumber&&`Roll-${s.rollNumber}`].filter(Boolean).join(' · ')}</p>
      </div>
      <button className={`srow-eye${isPrev?' on':''}`} onClick={e=>{e.stopPropagation();onPrev(s._id);}}>
        {isPrev?<EyeOff size={12}/>:<Eye size={12}/>}
      </button>
    </div>
  );
});

// ─────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────
const AdmitCardGenerator = () => {
  const navigate = useNavigate();

  const [all,        setAll]        = useState([]);
  const [classes,    setClasses]    = useState([]);
  const [sections,   setSections]   = useState([]);
  const [settings,   setSettings]   = useState(null);
  const [logoUrl,    setLogoUrl]    = useState('/logo.png');
  const [signUrl,    setSignUrl]    = useState(null);
  const [customLogo, setCustomLogo] = useState(null);
  const [program,    setProgram]    = useState('Degree');

  const [examConfig, setExamConfig] = useState({
    name       : 'Annual Examination 2025',
    year       : '2025',
    session    : '2024-2025',
    center     : '',
    centerCode : '',
  });

  const [subjects, setSubjects] = useState([
    { code:'BAN101', name:'Bangla (1st Paper)',   date:'', time:'10:00AM — 1:00PM', maxMarks:'100' },
    { code:'BAN102', name:'Bangla (2nd Paper)',   date:'', time:'10:00AM — 1:00PM', maxMarks:'100' },
    { code:'ENG101', name:'English (1st Paper)',  date:'', time:'10:00AM — 1:00PM', maxMarks:'100' },
    { code:'ENG102', name:'English (2nd Paper)',  date:'', time:'10:00AM — 1:00PM', maxMarks:'100' },
  ]);

  const [fCls, setFCls] = useState('');
  const [fSec, setFSec] = useState('');
  const [q,    setQ]    = useState('');

  const [sel,      setSel]      = useState(new Set());
  const [prevId,   setPrevId]   = useState(null);

  const [initLoad, setInitLoad] = useState(true);
  const [stuLoad,  setStuLoad]  = useState(false);
  const [genning,  setGenning]  = useState(false);
  const [genPct,   setGenPct]   = useState(0);
  const [genCur,   setGenCur]   = useState(0);
  const [genTot,   setGenTot]   = useState(0);
  const [sideOpen, setSideOpen] = useState(false);

  const theme = getT(program);

  const filtered = useMemo(()=>{
    const ql = q.toLowerCase();
    return all.filter(s=>{
      const cls = s.class?.name||(typeof s.class==='string'?s.class:'')||'';
      const nm  = s.userId?.name||'';
      return(
        (!fCls || cls===fCls) &&
        (!fSec || s.section===fSec) &&
        (!ql   || nm.toLowerCase().includes(ql) || (s.rollNumber||'').toString().includes(ql))
      );
    });
  },[all,fCls,fSec,q]);

  const selList = useMemo(()=>all.filter(s=>sel.has(s._id)),[all,sel]);
  const allSel  = filtered.length>0 && filtered.every(s=>sel.has(s._id));
  const uniCls  = useMemo(()=>[...new Map(classes.map(c=>[c.name,c])).values()],[classes]);

  useEffect(()=>{
    (async()=>{
      try{
        const [cr,sr] = await Promise.allSettled([
          classService.getAllClasses(), websiteService.getSettings()
        ]);
        if(cr.status==='fulfilled') setClasses(cr.value?.data||[]);
        if(sr.status==='fulfilled'){
          const d = sr.value?.data||{};
          setSettings(d);
          const logo = d.logo||d.schoolLogo||d.collegeLogo;
          if(logo) setLogoUrl(logo);
        }
      }catch(_){}
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
      const p = {};
      const sc = classes.find(c=>c._id===fCls||c.name===fCls);
      if(sc)   p.class   = sc.name;
      if(fSec) p.section = fSec;
      const res  = await studentService.getAllStudents(p);
      const list = res?.data||res?.students||(Array.isArray(res)?res:[]);
      setAll(list);
      toast[list.length?'success':'error'](list.length?`${list.length} students loaded`:'No students found');
      if(list.length) setSideOpen(false);
    }catch{ toast.error('Failed to load students'); }
    finally{ setStuLoad(false); }
  },[classes,fCls,fSec]);

  const toggleOne = useCallback(id=>{
    setSel(p=>{ const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
  },[]);

  const toggleAll = ()=>{
    const ids = filtered.map(s=>s._id);
    setSel(p=>{ const n=new Set(p); if(allSel) ids.forEach(id=>n.delete(id)); else ids.forEach(id=>n.add(id)); return n; });
  };

  const togglePrev = id => setPrevId(p=>p===id?null:id);

  const captureEl = async id => {
    const h2c = (await import('html2canvas')).default;
    const el  = document.getElementById(id);
    if(!el) return null;
    el.style.left='0px'; el.style.top='0px'; el.style.zIndex='9998';
    await new Promise(r=>setTimeout(r,100));
    const canvas = await h2c(el,{
      scale:2, useCORS:true, allowTaint:true,
      backgroundColor:'#fff', logging:false,
      width:el.offsetWidth, height:el.offsetHeight,
    });
    el.style.left='-9999px'; el.style.top='-9999px'; el.style.zIndex='-1';
    return canvas;
  };

  const dlOne = async student => {
    try{
      const {jsPDF} = await import('jspdf');
      const canvas  = await captureEl(`ac-pdf-${student._id}`);
      if(!canvas){ toast.error('Render failed'); return; }
      const pdf  = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
      const imgW = 210;
      const imgH = Math.round((canvas.height/canvas.width)*210);
      pdf.addImage(canvas.toDataURL('image/jpeg',.95),'JPEG',0,0,imgW,Math.min(imgH,297));
      pdf.save(`AdmitCard_${safeFile(student.userId?.name||'')}_Roll${safeFile(student.rollNumber||student.studentId||'')}.pdf`);
    }catch(err){ console.error(err); toast.error('PDF error'); }
  };

  const handleDlAll = async () => {
    if(!selList.length){ toast.error('Select at least one student'); return; }
    setGenning(true); setGenPct(0); setGenCur(0); setGenTot(selList.length);
    for(let i=0;i<selList.length;i++){
      setGenCur(i+1);
      setGenPct(Math.round(((i+1)/selList.length)*100));
      await dlOne(selList[i]);
      await new Promise(r=>setTimeout(r,320));
    }
    setGenning(false);
    toast.success(`✅ ${selList.length} Admit Cards downloaded!`);
  };

  const addSubject    = ()   => setSubjects(p=>[...p,{code:'',name:'',date:'',time:'10:00AM — 1:00PM',maxMarks:'100'}]);
  const removeSubject = i    => setSubjects(p=>p.filter((_,idx)=>idx!==i));
  const updateSubject = (i,f,v) => setSubjects(p=>p.map((s,idx)=>idx===i?{...s,[f]:v}:s));
  const setExam = (k,v) => setExamConfig(p=>({...p,[k]:v}));

  // ─────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="acg-root">
      {genning && <ProgressOverlay progress={genPct} current={genCur} total={genTot}/>}

      {/* TOP BAR */}
      <header className="acg-topbar">
        <div className="acg-topbar-l">
          <button className="acg-btn-back" onClick={()=>navigate('/dashboard/students')}>
            <ArrowLeft size={15}/><span>Students</span>
          </button>
          <div className="acg-page-heading">
            <div className="acg-heading-icon" style={{background:theme.hg}}>
              <FileText size={17}/>
            </div>
            <div>
              <h1 className="acg-heading-title">Admit Card Generator</h1>
            </div>
          </div>
          {program && (
            <span className="acg-prog-badge" style={{background:theme.vb,color:theme.vc,borderColor:theme.vbr}}>
              {program}
            </span>
          )}
        </div>
        <div className="acg-topbar-r">
          {selList.length>0 && (
            <span className="acg-sel-chip" style={{background:theme.vb,borderColor:theme.vbr,color:theme.vc}}>
              <CheckCircle size={12}/>{selList.length} selected
            </span>
          )}
          {selList.length>0 && <>
            <button className="acg-tbtn ghost" onClick={()=>setSel(new Set())}><X size={13}/><span>Clear</span></button>
            <button className="acg-tbtn amber" onClick={handleDlAll} disabled={genning}>
              <Download size={14}/><span>PDF ({selList.length})</span>
            </button>
          </>}
          <button className="acg-tbtn ghost acg-sidebar-toggle" onClick={()=>setSideOpen(o=>!o)}>
            <Filter size={14}/>
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="acg-body">

        {/* ── SIDEBAR ── */}
        <aside className={`acg-sidebar${sideOpen?' open':''}`}>
          <div className="acg-sb-header">
            <span className="acg-sb-title"><Filter size={13}/> Options</span>
            <button className="acg-sb-close" onClick={()=>setSideOpen(false)}><X size={16}/></button>
          </div>
          <div className="acg-sb-scroll">

            <Panel title="Program / Course" icon={<GraduationCap size={12}/>}>
              <ProgramSelector value={program} onChange={setProgram}/>
            </Panel>

            <Panel title="Exam Configuration" icon={<Calendar size={12}/>}>
              {[
                ['name',       'Exam Name',     'Annual Examination 2025'],
                ['year',       'Academic Year', '2025'],
                ['session',    'Session',       '2024-2025'],
                ['center',     'Exam Center',   'Leave blank for college name'],
                ['centerCode', 'Room No.',   COLLEGE.eiin],
              ].map(([k,lbl,ph])=>(
                <div key={k} className="acg-fg">
                  <label>{lbl}</label>
                  <input className="acg-inp" type="text" placeholder={ph}
                    value={examConfig[k]} onChange={e=>setExam(k,e.target.value)}/>
                </div>
              ))}
            </Panel>

            <Panel title="Subject Schedule" icon={<BookOpen size={12}/>} badge={subjects.length}>
              <div className="acg-sub-editor">
                {subjects.map((sub, i) => (
                  <div key={i} className="acg-sub-card">
                    <div className="acg-sub-card-hdr">
                      <div className="acg-sub-card-num" style={{background:theme.hg}}>{i+1}</div>
                      <span className="acg-sub-card-label">{sub.name || `Subject ${i+1}`}</span>
                      <button className="acg-sub-card-del" onClick={()=>removeSubject(i)} title="Remove">
                        <Trash2 size={12}/>
                      </button>
                    </div>
                    <div className="acg-sub-card-fields">
                      <div className="acg-sub-field-group">
                        <label className="acg-sub-field-lbl"><Hash size={10}/> Subject Code</label>
                        <input className="acg-sub-field-inp" placeholder="e.g. BAN101"
                          value={sub.code} onChange={e=>updateSubject(i,'code',e.target.value)}/>
                      </div>
                      <div className="acg-sub-field-group">
                        <label className="acg-sub-field-lbl"><AlignLeft size={10}/> Subject Name</label>
                        <input className="acg-sub-field-inp" placeholder="e.g. Bangla (1st Paper)"
                          value={sub.name} onChange={e=>updateSubject(i,'name',e.target.value)}/>
                      </div>
                      <div className="acg-sub-2col">
                        <div className="acg-sub-field-group">
                          <label className="acg-sub-field-lbl"><Calendar size={10}/> Exam Date</label>
                          <input className="acg-sub-field-inp" placeholder="e.g. 15/06/2025"
                            value={sub.date} onChange={e=>updateSubject(i,'date',e.target.value)}/>
                        </div>
                        <div className="acg-sub-field-group">
                          <label className="acg-sub-field-lbl"><Target size={10}/> Max Marks</label>
                          <input className="acg-sub-field-inp" type="number" placeholder="100"
                            value={sub.maxMarks} onChange={e=>updateSubject(i,'maxMarks',e.target.value)}/>
                        </div>
                      </div>
                      <div className="acg-sub-field-group">
                        <label className="acg-sub-field-lbl"><Clock size={10}/> Exam Time</label>
                        <input className="acg-sub-field-inp" placeholder="e.g. 10:00AM — 1:00PM"
                          value={sub.time} onChange={e=>updateSubject(i,'time',e.target.value)}/>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="acg-sub-add-btn" style={{background:theme.hg}} onClick={addSubject}>
                  <Plus size={13}/> Add Subject
                </button>
              </div>
            </Panel>

            <Panel title="Upload Assets" icon={<Upload size={12}/>}>
              <UpField label="College Logo" val={customLogo}
                onUp={b64=>{setCustomLogo(b64);setLogoUrl(b64);}}
                onRm={()=>{setCustomLogo(null);setLogoUrl(settings?.logo||'/logo.png');}}/>
              <UpField label="Controller Signature (PNG)" val={signUrl}
                onUp={setSignUrl} onRm={()=>setSignUrl(null)} isSig/>
            </Panel>

            <Panel title="Filter Students" icon={<Filter size={12}/>}>
              <div className="acg-sf-wrap">
                <Search size={12} className="acg-sf-ico"/>
                <input className="acg-sf-inp" type="text" placeholder="Name / Roll…"
                  value={q} onChange={e=>setQ(e.target.value)}/>
                {q && <button className="acg-sf-clr" onClick={()=>setQ('')}><X size={11}/></button>}
              </div>
              <div className="acg-2col">
                <div className="acg-fg">
                  <label>Class</label>
                  <select className="acg-sel" value={fCls} onChange={e=>setFCls(e.target.value)}>
                    <option value="">All Classes</option>
                    {uniCls.map(c=><option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="acg-fg">
                  <label>Section</label>
                  <select className="acg-sel" value={fSec} onChange={e=>setFSec(e.target.value)}
                    disabled={!fCls||!sections.length}>
                    <option value="">All</option>
                    {sections.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <button className="acg-load-btn" onClick={fetchStudents}
                disabled={stuLoad||initLoad} style={{background:theme.hg}}>
                {stuLoad
                  ? <><Loader size={13} className="acg-spin"/> Loading…</>
                  : <><RefreshCw size={13}/> Load Students</>
                }
              </button>
            </Panel>

            {all.length>0 && (
              <Panel title="Students" icon={<Users size={12}/>} badge={filtered.length}>
                <div className="acg-selbar">
                  <button className={`acg-selall${allSel?' on':''}`} onClick={toggleAll}
                    style={allSel?{borderColor:theme.ac,color:theme.ac,background:theme.vb}:{}}>
                    {allSel?<><CheckSquare size={12}/> Deselect All</>:<><Square size={12}/> Select All</>}
                  </button>
                  {sel.size>0 && <span className="acg-selcount">{sel.size} selected</span>}
                </div>
                <div className="acg-slist">
                  {filtered.length===0
                    ? <div className="acg-slist-empty"><Search size={18}/><span>No results</span></div>
                    : filtered.map(s=>(
                      <SRow key={s._id} s={s} sel={sel.has(s._id)} isPrev={prevId===s._id}
                        onToggle={toggleOne} onPrev={togglePrev} program={program}/>
                    ))
                  }
                </div>
              </Panel>
            )}

            {selList.length>0 && (
              <div className="acg-action-block">
                <div className="acg-stat-row">
                  {[
                    {v:all.length,      l:'Loaded'},
                    {v:filtered.length, l:'Filtered'},
                    {v:selList.length,  l:'Selected', hi:true},
                  ].map(({v,l,hi})=>(
                    <div key={l} className={`acg-stat${hi?' hi':''}`} style={hi?{color:theme.ac}:{}}>
                      <div className="acg-stat-v" style={hi?{color:theme.ac}:{}}>{v}</div>
                      <div className="acg-stat-l">{l}</div>
                    </div>
                  ))}
                </div>
                <button className="acg-dl-btn" onClick={handleDlAll} disabled={genning}
                  style={{background:theme.hg}}>
                  <Download size={15}/> Download PDF ({selList.length})
                </button>
              </div>
            )}

          </div>
        </aside>

        {sideOpen && <div className="acg-overlay" onClick={()=>setSideOpen(false)}/>}

        {/* ── MAIN ── */}
        <main className="acg-main">
          {initLoad && (
            <div className="acg-state">
              <Loader size={48} className="acg-spin acg-state-ico"/>
              <h3>Initialising…</h3>
            </div>
          )}

          {!initLoad && !all.length && !stuLoad && (
            <div className="acg-state">
              <div className="acg-empty-icon" style={{background:theme.hg}}><FileText size={40}/></div>
              <h3>Admit Card Generator</h3>
              <p>Configure exam details, add subjects, then load students to generate admit cards.</p>
              <div className="acg-howto">
                {[
                  ['01','Program',    'Choose HSC / Degree / Honours'],
                  ['02','Exam Config','Set exam name, year & center'],
                  ['03','Subjects',   'Add subjects with dates & times'],
                  ['04','Upload',     'Add college logo & controller sign'],
                  ['05','Generate',   'Load students, select & download PDF'],
                ].map(([n,t,d])=>(
                  <div key={n} className="acg-howto-card">
                    <div className="acg-howto-n" style={{color:theme.ac}}>{n}</div>
                    <div className="acg-howto-t">{t}</div>
                    <div className="acg-howto-d">{d}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stuLoad && (
            <div className="acg-state">
              <Loader size={48} className="acg-spin acg-state-ico"/>
              <h3>Loading students…</h3>
            </div>
          )}

          {!stuLoad && all.length>0 && (
            <div className="acg-cards-area">
              <div className="acg-toolbar">
                <div className="acg-toolbar-l">
                  <span className="acg-toolbar-count">
                    {filtered.length} students{sel.size>0 && ` · ${sel.size} selected`}
                  </span>
                  <span className="acg-prog-tag" style={{background:theme.vb,color:theme.vc,borderColor:theme.vbr}}>{program}</span>
                  {examConfig.name && (
                    <span className="acg-prog-tag" style={{background:'#f0f9ff',color:'#0369a1',borderColor:'#bae6fd'}}>
                      {examConfig.name}
                    </span>
                  )}
                </div>
                <div className="acg-toolbar-r">
                  <button className="acg-tb" onClick={toggleAll}>
                    {allSel?<><CheckSquare size={12}/> Deselect All</>:<><Square size={12}/> Select All</>}
                  </button>
                  {selList.length>0 && (
                    <button className="acg-tb amber" onClick={handleDlAll} disabled={genning}>
                      <Download size={12}/> PDF ({selList.length})
                    </button>
                  )}
                </div>
              </div>

              <div className="acg-card-list">
                {filtered.map(student=>{
                  const isSel = sel.has(student._id);
                  const isPrev = prevId===student._id;
                  const nm   = student.userId?.name||'—';
                  const cls  = student.class?.name||student.class||'—';
                  const ph   = student.userId?.profileImage||null;
                  const actv = student.userId?.isActive;
                  return (
                    <div key={student._id}
                      className={`acg-row${isSel?' sel':''}${isPrev?' open':''}`}
                      style={isSel?{borderColor:theme.ac,background:theme.vb+'55'}
                        :isPrev?{borderColor:theme.ac+'88'}:{}}>
                      <div className="acg-row-head">
                        <div className="acg-row-l">
                          <button className={`acg-chk${isSel?' on':''}`}
                            onClick={()=>toggleOne(student._id)}
                            style={isSel?{color:theme.ac}:{}}>
                            {isSel?<CheckSquare size={15}/>:<Square size={15}/>}
                          </button>
                          <div className="acg-ava">
                            {ph?<img src={ph} alt="" crossOrigin="anonymous"/>:<User size={14}/>}
                            <div className={`acg-dot${actv?' active':''}`}/>
                          </div>
                          <div className="acg-stu-text">
                            <p className="acg-stu-name">{nm}</p>
                            <p className="acg-stu-meta">
                              {cls}{student.section&&` · ${student.section}`}
                              {student.rollNumber&&` · Roll ${student.rollNumber}`}
                            </p>
                          </div>
                        </div>
                        <div className="acg-row-r">
                          <span className={`acg-status${actv?' active':''}`}>{actv?'Active':'Inactive'}</span>
                          <button
                            className={`acg-row-btn${isPrev?' on':''}`}
                            onClick={()=>togglePrev(student._id)}
                            style={isPrev?{background:theme.vb,borderColor:theme.ac,color:theme.vc}:{}}>
                            {isPrev?<EyeOff size={13}/>:<Eye size={13}/>}
                            <span>{isPrev?'Close':'Preview'}</span>
                          </button>
                          <button className="acg-row-btn amber" onClick={()=>dlOne(student)}>
                            <Download size={13}/><span>PDF</span>
                          </button>
                        </div>
                      </div>

                      {isPrev && (
                        <div className="acg-drawer">
                          <div className="acg-preview-wrap">
                            <div className="acg-preview-scaler">
                              <AdmitCard
                                student={student} logoUrl={logoUrl} signUrl={signUrl}
                                examConfig={examConfig} subjects={subjects}
                                program={program} settings={settings}/>
                            </div>
                          </div>
                          <p className="acg-preview-note">PDF will look exactly like this preview</p>
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

      {/* PDF POOL (off-screen, full A4 width for capture) */}
      <div className="acg-pdf-pool" aria-hidden="true">
        {selList.map(s=>(
          <div key={s._id} id={`ac-pdf-${s._id}`} className="acg-pdf-slot">
            <AdmitCard
              student={s} logoUrl={logoUrl} signUrl={signUrl}
              examConfig={examConfig} subjects={subjects}
              program={program} settings={settings}/>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdmitCardGenerator;