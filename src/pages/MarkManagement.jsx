// ============================================================
// FILE PATH: src/pages/MarkManagement.jsx
// ============================================================
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Award, Users, BarChart2, Search, Filter, RefreshCw,
  Eye, Trash2, Globe, EyeOff, X, Loader, User,
  GraduationCap, Star, CheckCircle, XCircle, Clock,
  ChevronDown, ChevronUp, LayoutGrid, List,
  ChevronLeft, ChevronRight, BookOpen, TrendingUp, Medal
} from 'lucide-react';
import markService  from '../services/markService';
import classService from '../services/classService';
import './MarkManagement.css';

// ── Grade color ────────────────────────────────────────────────
const gColor = g => {
  if (g==='A+') return { bg:'#d1fae5', tx:'#065f46', bd:'#6ee7b7' };
  if (g==='A')  return { bg:'#dcfce7', tx:'#166534', bd:'#86efac' };
  if (g==='A-') return { bg:'#ecfdf5', tx:'#15803d', bd:'#bbf7d0' };
  if (g==='B')  return { bg:'#eff6ff', tx:'#1d4ed8', bd:'#bfdbfe' };
  if (g==='C')  return { bg:'#fefce8', tx:'#854d0e', bd:'#fef08a' };
  if (g==='D')  return { bg:'#fff7ed', tx:'#9a3412', bd:'#fed7aa' };
  if (g==='F')  return { bg:'#fef2f2', tx:'#dc2626', bd:'#fecaca' };
  return           { bg:'#f8fafc',   tx:'#64748b', bd:'#e2e8f0' };
};
const rClass = r => r==='PASS'?'pass':r==='FAIL'?'fail':r==='INCOMPLETE'?'inc':'pend';

const PER_PAGE = 20;

// ── Grade pill ─────────────────────────────────────────────────
const GPill = ({ grade }) => {
  const c = gColor(grade);
  return (
    <span className="mm-gpill" style={{ background:c.bg, color:c.tx, borderColor:c.bd }}>
      {grade}
    </span>
  );
};

// ── Student detail modal ───────────────────────────────────────
const DetailModal = ({ mark, onClose, onTogglePublish }) => {
  if (!mark) return null;
  const name  = mark.student?.userId?.name  || '—';
  const photo = mark.student?.userId?.profileImage || null;
  const roll  = mark.student?.rollNumber    || '—';
  const reg   = mark.student?.registrationNumber || mark.student?.studentId || '—';
  const cls   = mark.student?.class?.name   || mark.className || '—';

  return (
    <div className="mm-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e=>e.stopPropagation()}>
        <div className="mm-modal-hdr">
          <h2>Result Detail</h2>
          <button className="mm-modal-x" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="mm-modal-body">

          {/* Student */}
          <div className="mm-modal-stu">
            <div className="mm-modal-ava">
              {photo ? <img src={photo} alt={name} crossOrigin="anonymous"/> : <User size={28}/>}
            </div>
            <div>
              <p className="mm-modal-name">{name}</p>
              <p className="mm-modal-meta">Roll: {roll} · Reg: {reg} · {cls}{mark.section?` · ${mark.section}`:''}</p>
              <div className="mm-modal-badges">
                <span className={`mm-rbadge ${rClass(mark.result)}`}>{mark.result}</span>
                <span className="mm-prog-badge">{mark.program}</span>
                {mark.isPublished && <span className="mm-pub-tag">Published</span>}
              </div>
            </div>
          </div>

          {/* Summary grid */}
          <div className="mm-modal-grid">
            {[
              ['Exam',       mark.examName],
              ['Year',       mark.examYear],
              ['Session',    mark.session || '—'],
              ['GPA',        `${mark.gpa?.toFixed(2)} / 5.00`],
              ['Percentage', `${mark.percentage?.toFixed(2)}%`],
              ['Total Marks',`${mark.totalObtained} / ${mark.totalFull}`],
              ['Division',   mark.division],
              ['Published',  mark.isPublished ? 'Yes' : 'No'],
            ].map(([l,v]) => (
              <div key={l} className="mm-modal-row">
                <span className="mm-modal-lbl">{l}</span>
                <span className="mm-modal-val">{v}</span>
              </div>
            ))}
          </div>

          {/* Subject table */}
          <div className="mm-modal-table-wrap">
            <p className="mm-modal-section-title"><BookOpen size={13}/> Subject-wise Marks</p>
            <table className="mm-modal-table">
              <thead>
                <tr>
                  <th>#</th><th>Code</th><th>Subject</th>
                  <th>Full</th><th>Pass</th><th>Obtained</th>
                  <th>Grade</th><th>GPA</th>
                </tr>
              </thead>
              <tbody>
                {mark.subjects?.map((sub, i) => {
                  const c = gColor(sub.grade);
                  return (
                    <tr key={i} className={sub.status==='fail' ? 'mm-fail-row' : ''}>
                      <td className="mm-tc">{i+1}</td>
                      <td className="mm-tc mm-mono">{sub.code}</td>
                      <td>{sub.name}</td>
                      <td className="mm-tc">{sub.fullMarks}</td>
                      <td className="mm-tc">{sub.passMarks}</td>
                      <td className="mm-tc" style={{fontWeight:800, color: sub.status==='fail'?'#dc2626':'#065f46'}}>
                        {sub.marksObtained??'Absent'}
                      </td>
                      <td className="mm-tc">
                        <span style={{background:c.bg, color:c.tx, padding:'2px 8px', borderRadius:6, fontSize:11, fontWeight:800}}>
                          {sub.grade}
                        </span>
                      </td>
                      <td className="mm-tc">{sub.gradePoint?.toFixed(1)}</td>
                    </tr>
                  );
                })}
                <tr className="mm-total-tr">
                  <td colSpan={3} style={{textAlign:'right', fontWeight:800, color:'#065f46'}}>Grand Total</td>
                  <td className="mm-tc" style={{fontWeight:800}}>{mark.totalFull}</td>
                  <td/>
                  <td className="mm-tc" style={{fontWeight:900, fontSize:15, color:'#065f46'}}>{mark.totalObtained}</td>
                  <td colSpan={2}/>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="mm-modal-actions">
            <button
              className={`mm-pub-btn${mark.isPublished?' published':''}`}
              onClick={() => { onTogglePublish(mark); onClose(); }}>
              {mark.isPublished ? <><EyeOff size={14}/> Unpublish</> : <><Globe size={14}/> Publish Result</>}
            </button>
            <button className="mm-close-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Expandable table row ───────────────────────────────────────
const MarkRow = ({ mark, idx, onView, onPublish, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const name  = mark.student?.userId?.name || '—';
  const photo = mark.student?.userId?.profileImage || null;
  const roll  = mark.student?.rollNumber || '—';
  const cls   = mark.student?.class?.name || mark.className || '—';

  return (
    <>
      <tr className={`mm-tr${mark.isPublished?' pub-row':''}`} onClick={() => setExpanded(e=>!e)}>
        <td className="mm-td mm-tc mm-serial">{idx}</td>
        <td className="mm-td">
          <div className="mm-stu-cell">
            <div className="mm-stu-ava">
              {photo ? <img src={photo} alt={name} crossOrigin="anonymous"/> : <User size={13}/>}
            </div>
            <div>
              <div className="mm-stu-name">{name}</div>
              <div className="mm-stu-meta">Roll: {roll} · {cls}{mark.section?` · ${mark.section}`:''}</div>
            </div>
          </div>
        </td>
        <td className="mm-td mm-tc"><span className="mm-prog-badge">{mark.program}</span></td>
        <td className="mm-td mm-tc mm-big">{mark.totalObtained}/{mark.totalFull}</td>
        <td className="mm-td mm-tc">
          <div className="mm-gpa-cell">
            <span className="mm-gpa-big">{mark.gpa?.toFixed(2)}</span>
            <span className="mm-gpa-small">/5.00</span>
          </div>
        </td>
        <td className="mm-td mm-tc mm-pct">{mark.percentage?.toFixed(1)}%</td>
        <td className="mm-td mm-tc"><span className={`mm-rbadge ${rClass(mark.result)}`}>{mark.result}</span></td>
        <td className="mm-td mm-tc">
          <span className={`mm-pub-dot ${mark.isPublished?'on':'off'}`}/>
        </td>
        <td className="mm-td mm-tc mm-actions" onClick={e=>e.stopPropagation()}>
          <button className="mm-act view"   onClick={()=>onView(mark)}    title="View"><Eye size={13}/></button>
          <button className="mm-act pub"    onClick={()=>onPublish(mark)} title={mark.isPublished?'Unpublish':'Publish'}>
            {mark.isPublished?<EyeOff size={13}/>:<Globe size={13}/>}
          </button>
          <button className="mm-act del"    onClick={()=>onDelete(mark._id)} title="Delete"><Trash2 size={13}/></button>
        </td>
      </tr>

      {expanded && (
        <tr className="mm-exp-tr">
          <td colSpan={9}>
            <div className="mm-exp-body">
              <div className="mm-exp-meta">
                <span><b>Exam:</b> {mark.examName}</span>
                <span><b>Year:</b> {mark.examYear}</span>
                <span><b>Session:</b> {mark.session||'—'}</span>
                <span><b>Division:</b> {mark.division}</span>
                {mark.publishedAt && <span><b>Published:</b> {new Date(mark.publishedAt).toLocaleDateString('en-GB')}</span>}
              </div>
              <div className="mm-exp-subjects">
                {mark.subjects?.map((sub,i) => {
                  const c = gColor(sub.grade);
                  return (
                    <div key={i} className="mm-sub-chip" style={{borderColor:c.bd}}>
                      <span className="mm-sc-code">{sub.code}</span>
                      <span className="mm-sc-name">{sub.name}</span>
                      <span className="mm-sc-marks" style={{color:sub.status==='fail'?'#dc2626':'#065f46'}}>
                        {sub.marksObtained??'Absent'}/{sub.fullMarks}
                      </span>
                      <GPill grade={sub.grade}/>
                      <span className="mm-sc-gpa">GPA: {sub.gradePoint?.toFixed(1)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ── Card view ──────────────────────────────────────────────────
const MarkCard = ({ mark, onView, onPublish, onDelete }) => {
  const name  = mark.student?.userId?.name || '—';
  const photo = mark.student?.userId?.profileImage || null;
  const roll  = mark.student?.rollNumber || '—';
  const cls   = mark.student?.class?.name || mark.className || '—';

  return (
    <div className={`mm-card${mark.isPublished?' pub':''}`}>
      <div className="mm-card-top">
        <div className="mm-card-ava">
          {photo ? <img src={photo} alt={name} crossOrigin="anonymous"/> : <User size={18}/>}
        </div>
        <div className="mm-card-info">
          <p className="mm-card-name">{name}</p>
          <p className="mm-card-meta">Roll: {roll} · {cls}</p>
        </div>
        <span className={`mm-rbadge ${rClass(mark.result)}`}>{mark.result}</span>
      </div>
      <div className="mm-card-stats">
        <div className="mm-cst"><span className="mm-cst-v">{mark.gpa?.toFixed(2)}</span><span className="mm-cst-l">GPA</span></div>
        <div className="mm-cst"><span className="mm-cst-v">{mark.percentage?.toFixed(1)}%</span><span className="mm-cst-l">Percent</span></div>
        <div className="mm-cst"><span className="mm-cst-v">{mark.totalObtained}/{mark.totalFull}</span><span className="mm-cst-l">Marks</span></div>
      </div>
      <div className="mm-card-grades">
        {mark.subjects?.slice(0,5).map((sub,i) => <GPill key={i} grade={sub.grade}/>)}
        {mark.subjects?.length > 5 && <span className="mm-grade-more">+{mark.subjects.length-5}</span>}
      </div>
      <div className="mm-card-footer">
        <span className="mm-card-exam">{mark.examName}</span>
        <div className="mm-card-acts">
          <button className="mm-act view"  onClick={()=>onView(mark)}><Eye size={13}/></button>
          <button className="mm-act pub"   onClick={()=>onPublish(mark)}>
            {mark.isPublished?<EyeOff size={13}/>:<Globe size={13}/>}
          </button>
          <button className="mm-act del"   onClick={()=>onDelete(mark._id)}><Trash2 size={13}/></button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
const MarkManagement = () => {
  const [marks,       setMarks]       = useState([]);
  const [classes,     setClasses]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [pubLoading,  setPubLoading]  = useState(false);
  const [viewMark,    setViewMark]    = useState(null);
  const [viewMode,    setViewMode]    = useState('table');
  const [page,        setPage]        = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);

  // filters
  const [fClass,   setFClass]   = useState('');
  const [fSection, setFSection] = useState('');
  const [fProgram, setFProgram] = useState('');
  const [fExam,    setFExam]    = useState('');
  const [fResult,  setFResult]  = useState('');
  const [fPub,     setFPub]     = useState('');
  const [fSearch,  setFSearch]  = useState('');

  // class stats
  const [stats, setStats] = useState(null);

  const totalPages = Math.ceil(totalCount / PER_PAGE);

  const uniCls = useMemo(()=>[...new Map(classes.map(c=>[c.name,c])).values()],[classes]);

  const sections = useMemo(()=>{
    if (!fClass) return [];
    const sc = classes.find(c=>c._id===fClass||c.name===fClass);
    if (!sc) return [];
    return [...new Set(classes.filter(c=>c.name===sc.name).map(c=>c.section).filter(Boolean))].sort();
  },[fClass,classes]);

  const currentClass = useMemo(()=>{
    const sc = classes.find(c=>c._id===fClass||c.name===fClass);
    return sc?.name || fClass || '';
  },[classes,fClass]);

  // Load classes on mount
  useEffect(()=>{
    classService.getAllClasses()
      .then(r=>setClasses(r.data||[]))
      .catch(()=>{});
  },[]);

  // Build query params
  const buildParams = useCallback(()=>({
    ...(currentClass  && { className: currentClass }),
    ...(fSection      && { section:   fSection }),
    ...(fProgram      && { program:   fProgram }),
    ...(fExam         && { examName:  fExam }),
    ...(fResult       && { result:    fResult }),
    ...(fPub !== ''   && { isPublished: fPub }),
    page, limit: PER_PAGE,
  }),[currentClass,fSection,fProgram,fExam,fResult,fPub,page]);

  // Fetch marks from backend
  const fetchMarks = useCallback(async()=>{
    setLoading(true);
    try {
      const res = await markService.getAllMarks(buildParams());
      setMarks(res.data || []);
      setTotalCount(res.total || 0);
    } catch {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  },[buildParams]);

  // Fetch class stats
  const fetchStats = useCallback(async()=>{
    if (!currentClass) { setStats(null); return; }
    try {
      const res = await markService.getClassStats({
        className: currentClass,
        ...(fSection && { section: fSection }),
        ...(fExam    && { examName: fExam }),
        ...(fProgram && { program:  fProgram }),
      });
      setStats(res.data);
    } catch { setStats(null); }
  },[currentClass,fSection,fExam,fProgram]);

  // Fetch on page change
  useEffect(()=>{ fetchMarks(); },[page]); // eslint-disable-line

  const handleSearch = e => {
    e?.preventDefault();
    setPage(1);
    fetchMarks();
    fetchStats();
  };

  const clearFilters = () => {
    setFClass(''); setFSection(''); setFProgram(''); setFExam('');
    setFResult(''); setFPub(''); setFSearch('');
    setStats(null); setPage(1);
  };

  // Publish toggle
  const handlePublish = async mark => {
    try {
      const res = await markService.togglePublish(mark._id);
      setMarks(p => p.map(m => m._id===mark._id ? {...m, isPublished: res.data?.isPublished} : m));
      toast.success(res.message || 'Updated');
    } catch { toast.error('Failed'); }
  };

  // Publish entire class
  const handlePublishClass = async () => {
    if (!currentClass || !fExam) { toast.error('Select a class and exam first'); return; }
    setPubLoading(true);
    try {
      const res = await markService.publishClassResults({
        className: currentClass, section: fSection, examName: fExam, publish: true,
      });
      toast.success(res.message || 'Published!');
      fetchMarks();
    } catch { toast.error('Publish failed'); }
    finally { setPubLoading(false); }
  };

  // Delete
  const handleDelete = async id => {
    if (!window.confirm('এই result record মুছে ফেলবেন?')) return;
    try {
      await markService.deleteMark(id);
      setMarks(p => p.filter(m => m._id!==id));
      setTotalCount(c => c-1);
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  // Client-side search filter
  const displayed = useMemo(()=>{
    if (!fSearch.trim()) return marks;
    const q = fSearch.toLowerCase();
    return marks.filter(m =>
      (m.student?.userId?.name||'').toLowerCase().includes(q) ||
      (m.student?.rollNumber||'').toString().includes(q) ||
      (m.student?.registrationNumber||'').toLowerCase().includes(q)
    );
  },[marks,fSearch]);

  // Summary counts from loaded data
  const passCount    = marks.filter(m=>m.result==='PASS').length;
  const failCount    = marks.filter(m=>m.result==='FAIL').length;
  const avgGPA       = marks.length>0
    ? (marks.reduce((a,m)=>a+(m.gpa||0),0)/marks.length).toFixed(2) : '—';
  const pubCount     = marks.filter(m=>m.isPublished).length;

  return (
    <div className="mm-page">

      {/* ── HEADER ── */}
      <div className="mm-hdr">
        <div className="mm-hdr-l">
          <div className="mm-hdr-icon"><Award size={22}/></div>
          <div>
            <h1 className="mm-hdr-title">Mark Management</h1>
            <p className="mm-hdr-sub">পরীক্ষার ফলাফল পরিচালনা ও প্রকাশ</p>
          </div>
        </div>
        <div className="mm-hdr-r">
          {currentClass && fExam && (
            <button className="mm-btn pub" onClick={handlePublishClass} disabled={pubLoading}>
              {pubLoading ? <Loader size={14} className="mm-spin"/> : <Globe size={14}/>}
              Publish Class Results
            </button>
          )}
          <div className="mm-view-toggle">
            <button className={`mm-vt${viewMode==='table'?' on':''}`} onClick={()=>setViewMode('table')} title="Table"><List size={15}/></button>
            <button className={`mm-vt${viewMode==='card' ?' on':''}`} onClick={()=>setViewMode('card')}  title="Cards"><LayoutGrid size={15}/></button>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="mm-stats-row">
        {[
          { icon:<Users size={18}/>,       label:'Total Results', value:totalCount, color:'#1d4ed8', bg:'#eff6ff' },
          { icon:<CheckCircle size={18}/>, label:'PASS',          value:passCount,  color:'#16a34a', bg:'#dcfce7' },
          { icon:<XCircle size={18}/>,     label:'FAIL',          value:failCount,  color:'#dc2626', bg:'#fee2e2' },
          { icon:<Star size={18}/>,         label:'Avg. GPA',     value:avgGPA,     color:'#d97706', bg:'#fffbeb' },
          { icon:<Globe size={18}/>,        label:'Published',    value:pubCount,   color:'#059669', bg:'#ecfdf5' },
        ].map(({ icon, label, value, color, bg }) => (
          <div key={label} className="mm-stat" style={{ borderTopColor: color }}>
            <div className="mm-stat-ico" style={{ background: bg, color }}>{icon}</div>
            <div>
              <div className="mm-stat-val">{value}</div>
              <div className="mm-stat-lbl">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div className="mm-filter-card">
        <form onSubmit={handleSearch}>
          <div className="mm-filter-row">
            {/* Class */}
            <div className="mm-fg">
              <label>Class / শ্রেণি</label>
              <select className="mm-sel" value={fClass} onChange={e=>{setFClass(e.target.value);setFSection('');}}>
                <option value="">— All Classes —</option>
                {uniCls.map(c=><option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {/* Section */}
            <div className="mm-fg">
              <label>Section / শাখা</label>
              <select className="mm-sel" value={fSection} onChange={e=>setFSection(e.target.value)} disabled={!fClass}>
                <option value="">— All —</option>
                {sections.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Program */}
            <div className="mm-fg">
              <label>Program</label>
              <select className="mm-sel" value={fProgram} onChange={e=>setFProgram(e.target.value)}>
                <option value="">— All —</option>
                <option value="HSC">HSC</option>
                <option value="Degree">Degree</option>
                <option value="Honours">Honours</option>
              </select>
            </div>

            {/* Exam */}
            <div className="mm-fg">
              <label>Exam Name</label>
              <input className="mm-inp" type="text" placeholder="e.g. Annual Examination 2025"
                value={fExam} onChange={e=>setFExam(e.target.value)}/>
            </div>

            {/* Result */}
            <div className="mm-fg">
              <label>Result</label>
              <select className="mm-sel" value={fResult} onChange={e=>setFResult(e.target.value)}>
                <option value="">— All —</option>
                <option value="PASS">PASS</option>
                <option value="FAIL">FAIL</option>
                <option value="INCOMPLETE">INCOMPLETE</option>
              </select>
            </div>

            {/* Published */}
            <div className="mm-fg">
              <label>Published</label>
              <select className="mm-sel" value={fPub} onChange={e=>setFPub(e.target.value)}>
                <option value="">— All —</option>
                <option value="true">Published</option>
                <option value="false">Unpublished</option>
              </select>
            </div>
          </div>

          <div className="mm-filter-row mm-filter-row2">
            {/* Search */}
            <div className="mm-fg mm-fg-search">
              <label>Search</label>
              <div className="mm-search-wrap">
                <Search size={13} className="mm-search-ico"/>
                <input className="mm-search-inp" type="text"
                  placeholder="Name / Roll No / Reg No…"
                  value={fSearch} onChange={e=>setFSearch(e.target.value)}/>
                {fSearch && <button type="button" className="mm-search-clr" onClick={()=>setFSearch('')}><X size={11}/></button>}
              </div>
            </div>

            <div className="mm-filter-btns">
              <button type="submit" className="mm-btn primary">
                <Search size={13}/> Search
              </button>
              <button type="button" className="mm-btn ghost" onClick={clearFilters}>
                <X size={13}/> Clear
              </button>
              <button type="button" className="mm-btn ghost icon-only"
                onClick={()=>{ fetchMarks(); fetchStats(); }} title="Refresh">
                <RefreshCw size={14}/>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── CLASS STATS BAR ── */}
      {stats && (
        <div className="mm-class-bar">
          <div className="mm-class-bar-title">
            <BarChart2 size={14}/> {currentClass}{fSection?` · ${fSection}`:''} — Class Analysis
          </div>
          <div className="mm-class-bar-items">
            {[
              { l:'Total',    v: stats.total,      c:'#fff' },
              { l:'PASS',     v: stats.passed,     c:'#86efac' },
              { l:'FAIL',     v: stats.failed,     c:'#fca5a5' },
              { l:'Pass Rate',v:`${stats.passRate}%`, c:'#fde68a' },
              { l:'Avg GPA',  v: stats.avgGPA,     c:'#c4b5fd' },
              { l:'Avg %',    v:`${stats.avgPct}%`,c:'#7dd3fc' },
            ].map(({l,v,c})=>(
              <div key={l} className="mm-class-item">
                <span className="mm-class-v" style={{color:c}}>{v}</span>
                <span className="mm-class-l">{l}</span>
              </div>
            ))}
          </div>
          {currentClass && fExam && (
            <button className="mm-pub-class-btn" onClick={handlePublishClass} disabled={pubLoading}>
              <Globe size={12}/> Publish All
            </button>
          )}
        </div>
      )}

      {/* ── CONTENT ── */}
      {loading ? (
        <div className="mm-loading">
          <Loader size={36} className="mm-spin"/>
          <p>Loading results…</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="mm-empty">
          <Award size={50} className="mm-empty-ico"/>
          <h3>কোনো ফলাফল পাওয়া যায়নি</h3>
          <p>উপরে Class ও Exam Name দিয়ে Search করুন।<br/>
            Result Card Generator থেকে marks save করলে এখানে দেখাবে।</p>
        </div>
      ) : (
        <>
          <div className="mm-content-hdr">
            <span className="mm-count">{displayed.length} results{totalCount!==displayed.length&&` of ${totalCount} total`}</span>
          </div>

          {/* TABLE */}
          {viewMode==='table' && (
            <div className="mm-table-wrap">
              <table className="mm-table">
                <thead>
                  <tr>
                    <th className="mm-th mm-tc">#</th>
                    <th className="mm-th">Student</th>
                    <th className="mm-th mm-tc">Program</th>
                    <th className="mm-th mm-tc">Marks</th>
                    <th className="mm-th mm-tc">GPA</th>
                    <th className="mm-th mm-tc">%</th>
                    <th className="mm-th mm-tc">Result</th>
                    <th className="mm-th mm-tc">Published</th>
                    <th className="mm-th mm-tc">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((mark,i) => (
                    <MarkRow
                      key={mark._id}
                      mark={mark}
                      idx={(page-1)*PER_PAGE+i+1}
                      onView={setViewMark}
                      onPublish={handlePublish}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CARDS */}
          {viewMode==='card' && (
            <div className="mm-cards-grid">
              {displayed.map(mark => (
                <MarkCard
                  key={mark._id}
                  mark={mark}
                  onView={setViewMark}
                  onPublish={handlePublish}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mm-pagination">
              <button className="mm-pg-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>
                <ChevronLeft size={15}/>
              </button>
              {Array.from({length:totalPages},(_,i)=>i+1)
                .filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1)
                .reduce((acc,p,i,arr)=>{ if(i>0&&arr[i-1]!==p-1)acc.push('…'); acc.push(p); return acc; },[])
                .map((p,i)=> p==='…'
                  ? <span key={i} className="mm-pg-dots">…</span>
                  : <button key={p} className={`mm-pg-btn${page===p?' active':''}`} onClick={()=>setPage(p)}>{p}</button>
                )
              }
              <button className="mm-pg-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>
                <ChevronRight size={15}/>
              </button>
              <span className="mm-pg-info">Page {page} / {totalPages}</span>
            </div>
          )}
        </>
      )}

      {/* DETAIL MODAL */}
      {viewMark && (
        <DetailModal
          mark={viewMark}
          onClose={()=>setViewMark(null)}
          onTogglePublish={m=>{ handlePublish(m); setViewMark(null); }}
        />
      )}
    </div>
  );
};

export default MarkManagement;