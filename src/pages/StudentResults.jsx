//
// FILE PATH: src/pages/StudentResults.jsx
// Student dashboard — published results with CQ/MCQ/Practical
// breakdown, Paper1+Paper2, pass chips, GPA note on fail
// ============================================================
import React, { useState, useEffect } from 'react';
import markService from '../services/markService';
import {
  Award, BookOpen, BarChart2, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Clock, GraduationCap, Loader,
  AlertCircle, TrendingUp
} from 'lucide-react';
import './StudentResults.css';

// ─────────────────────────────────────────────────────────
const gradeColor = g => {
  if (g==='A+') return { bg:'#d1fae5', tx:'#065f46', bd:'#6ee7b7' };
  if (g==='A')  return { bg:'#dcfce7', tx:'#166534', bd:'#86efac' };
  if (g==='A-') return { bg:'#ecfdf5', tx:'#15803d', bd:'#bbf7d0' };
  if (g==='B')  return { bg:'#eff6ff', tx:'#1d4ed8', bd:'#bfdbfe' };
  if (g==='C')  return { bg:'#fefce8', tx:'#854d0e', bd:'#fef08a' };
  if (g==='D')  return { bg:'#fff7ed', tx:'#9a3412', bd:'#fed7aa' };
  if (g==='F')  return { bg:'#fef2f2', tx:'#dc2626', bd:'#fecaca' };
  return           { bg:'#f8fafc',   tx:'#64748b', bd:'#e2e8f0' };
};

const ResultIcon = ({ result }) => {
  if (result==='PASS') return <CheckCircle size={14} style={{color:'#16a34a'}}/>;
  if (result==='FAIL') return <XCircle     size={14} style={{color:'#dc2626'}}/>;
  return                      <Clock       size={14} style={{color:'#d97706'}}/>;
};

// ─────────────────────────────────────────────────────────
//  GPA DONUT
// ─────────────────────────────────────────────────────────
const GpaDonut = ({ gpa }) => {
  const pct  = Math.min((gpa/5)*100, 100);
  const r    = 36;
  const circ = 2*Math.PI*r;
  const dash = circ*(1-pct/100);
  const color= gpa>=4.5?'#16a34a':gpa>=3.5?'#1d4ed8':gpa>=2?'#d97706':'#dc2626';
  return (
    <svg width="90" height="90" viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8"/>
      <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash}
        transform="rotate(-90 45 45)" style={{transition:'stroke-dashoffset 1.2s ease'}}/>
      <text x="45" y="41" textAnchor="middle" fontSize="14" fontWeight="900" fill={color}>{gpa.toFixed(2)}</text>
      <text x="45" y="55" textAnchor="middle" fontSize="9"  fill="#94a3b8">/ 5.00</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────
//  PASS CHIP
// ─────────────────────────────────────────────────────────
const PassChip = ({ passed }) => {
  if (passed===null||passed===undefined) return null;
  return (
    <span style={{
      fontSize:10, fontWeight:800, padding:'1px 6px', borderRadius:4, marginLeft:4,
      background: passed?'#d1fae5':'#fee2e2',
      color:      passed?'#065f46':'#dc2626',
      border:     `1px solid ${passed?'#6ee7b7':'#fca5a5'}`,
    }}>
      {passed?'✓ Pass':'✗ Fail'}
    </span>
  );
};

// ─────────────────────────────────────────────────────────
//  SUBJECT DETAIL ROW
// ─────────────────────────────────────────────────────────
const SubjectDetail = ({ sub, index }) => {
  const gc    = gradeColor(sub.grade);
  const isFail  = sub.status==='fail';
  const isAbsent= sub.status==='absent';
  const isPair  = Boolean(sub.isPair);
  const papers  = isPair ? 2 : 1;

  const cqFull  = (Number(sub.cqFM)||70) * papers;
  const mcqFull = sub.hasMCQ && sub.mcqTotal!=null ? (Number(sub.mcqFM)||30)*papers : null;
  const pracFull= sub.hasPractical && sub.practicalTotal!=null ? (Number(sub.practicalFM)||25)*papers : null;

  return (
    <div className={`sr-sub-det${isFail?' sr-sub-fail':isAbsent?' sr-sub-absent':''}`}>
      {/* Header */}
      <div className="sr-sub-det-hd">
        <span className="sr-sub-ser">{String(index+1).padStart(2,'0')}</span>
        <span className="sr-sub-code">{sub.code}</span>
        <span className="sr-sub-nm">{sub.name}</span>
        <span className="sr-sub-type">{sub.subjectType==='science'?'🔬':'📚'}</span>
        <span className="sr-sub-pair-tag">{isPair?'P1+P2':'Single'}</span>
        <span className="sr-sub-grade" style={{background:gc.bg,color:gc.tx,borderColor:gc.bd}}>{sub.grade}</span>
        <span className="sr-sub-gp">GP <strong>{sub.gradePoint?.toFixed(1)}</strong></span>
        {isFail   && <span className="sr-fail-tag">FAIL</span>}
        {isAbsent && <span className="sr-absent-tag">Absent</span>}
      </div>

      {/* Breakdown */}
      {!isAbsent && (
        <div className="sr-breakdown">

          {/* CQ */}
          <div className="sr-comp">
            <span className="sr-comp-lbl">✍️ CQ</span>
            <span className="sr-comp-marks">
              {isPair ? (
                <>P1: <strong>{sub.cqP1??'—'}</strong> + P2: <strong>{sub.cqP2??'—'}</strong> = <strong>{sub.cqTotal??'—'}</strong></>
              ) : (
                <><strong>{sub.cqP1??'—'}</strong></>
              )}
              <span className="sr-comp-full">/ {cqFull}</span>
              <span className="sr-comp-pass">Pass: {sub.cqPM||'—'}</span>
            </span>
            <PassChip passed={sub.cqPassed}/>
          </div>

          {/* MCQ */}
          {sub.hasMCQ && sub.mcqTotal!=null && (
            <div className="sr-comp">
              <span className="sr-comp-lbl">📝 MCQ</span>
              <span className="sr-comp-marks">
                {isPair ? (
                  <>P1: <strong>{sub.mcqP1??'—'}</strong> + P2: <strong>{sub.mcqP2??'—'}</strong> = <strong>{sub.mcqTotal}</strong></>
                ) : (
                  <><strong>{sub.mcqP1??'—'}</strong></>
                )}
                <span className="sr-comp-full">/ {mcqFull}</span>
                <span className="sr-comp-pass">Pass: {sub.mcqPM||'—'}</span>
              </span>
              <PassChip passed={sub.mcqPassed}/>
            </div>
          )}
          {sub.hasMCQ && sub.mcqTotal==null && (
            <div className="sr-comp sr-comp-skipped">
              <span className="sr-comp-lbl">📝 MCQ</span>
              <span style={{fontSize:11,color:'#94a3b8'}}>Not entered — skipped (CQ-only grade)</span>
            </div>
          )}

          {/* Practical */}
          {sub.hasPractical && sub.practicalTotal!=null && (
            <div className="sr-comp">
              <span className="sr-comp-lbl">🔬 Practical</span>
              <span className="sr-comp-marks">
                {isPair ? (
                  <>P1: <strong>{sub.practicalP1??'—'}</strong> + P2: <strong>{sub.practicalP2??'—'}</strong> = <strong>{sub.practicalTotal}</strong></>
                ) : (
                  <><strong>{sub.practicalP1??'—'}</strong></>
                )}
                <span className="sr-comp-full">/ {pracFull}</span>
                <span className="sr-comp-pass">Pass: {sub.practicalPM||'—'}</span>
              </span>
              <PassChip passed={sub.practicalPassed}/>
            </div>
          )}

          {/* Subject total */}
          <div className="sr-sub-total">
            <span>Subject Total:</span>
            <strong>{sub.totalObtained??'—'} / {sub.totalFull??'—'}</strong>
            <span style={{color:'#64748b',fontSize:11}}>({sub.percentage?.toFixed(1)}%)</span>
          </div>

        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  EXAM CARD
// ─────────────────────────────────────────────────────────
const ExamCard = ({ mark, index }) => {
  const [open, setOpen] = useState(index===0);

  const rs = mark.result==='PASS'
    ? { bg:'#d1fae5', tx:'#065f46', bd:'#6ee7b7' }
    : mark.result==='FAIL'
    ? { bg:'#fee2e2', tx:'#dc2626', bd:'#fca5a5' }
    : { bg:'#fffbeb', tx:'#92400e', bd:'#fde68a' };

  return (
    <div className={`sr-exam-card${mark.result==='PASS'?' sr-pass':mark.result==='FAIL'?' sr-fail':''}`}>

      {/* Header */}
      <button className="sr-exam-hdr" onClick={()=>setOpen(o=>!o)}>
        <div className="sr-exam-hdr-l">
          <div className="sr-exam-num">{String(index).padStart(2,'0')}</div>
          <div>
            <p className="sr-exam-name">{mark.examName}</p>
            <p className="sr-exam-meta">
              {mark.program}{mark.className&&` · ${mark.className}`}
              {mark.section&&` · ${mark.section}`}
              {mark.session&&` · ${mark.session}`}
              {mark.examYear&&` · ${mark.examYear}`}
            </p>
          </div>
        </div>
        <div className="sr-exam-hdr-r">
          <span className="sr-result-tag" style={{background:rs.bg,color:rs.tx,borderColor:rs.bd}}>
            <ResultIcon result={mark.result}/> {mark.result}
          </span>
          {open?<ChevronUp size={16}/>:<ChevronDown size={16}/>}
        </div>
      </button>

      {/* Summary strip */}
      <div className="sr-summary-row">
        <div className="sr-sum-item">
          {mark.result==='FAIL' ? (
            <>
              <span className="sr-sum-val" style={{color:'#dc2626',fontSize:13}}>—</span>
              <span className="sr-sum-lbl">GPA (Fail)</span>
            </>
          ) : (
            <>
              <span className="sr-sum-val sr-gpa-val"
                style={{color:mark.gpa>=3.5?'#1d4ed8':mark.gpa>=2?'#d97706':'#dc2626'}}>
                {mark.gpa?.toFixed(2)}
              </span>
              <span className="sr-sum-lbl">GPA</span>
            </>
          )}
        </div>
        <div className="sr-sum-sep"/>
        <div className="sr-sum-item">
          <span className="sr-sum-val">{mark.percentage?.toFixed(1)}%</span>
          <span className="sr-sum-lbl">Percentage</span>
        </div>
        <div className="sr-sum-sep"/>
        <div className="sr-sum-item">
          <span className="sr-sum-val">{mark.totalObtained}/{mark.totalFull}</span>
          <span className="sr-sum-lbl">Total Marks</span>
        </div>
        <div className="sr-sum-sep"/>
        <div className="sr-sum-item">
          <span className="sr-sum-val">{mark.division}</span>
          <span className="sr-sum-lbl">Division</span>
        </div>
      </div>

      {/* Expandable subject detail */}
      {open && (
        <div className="sr-subjects-block">
          <p className="sr-subjects-title"><BookOpen size={12}/> Subject-wise Result</p>

          {mark.result==='FAIL' && (
            <div className="sr-fail-notice">
              ⚠️ এক বা একাধিক বিষয়ে ফেল — সামগ্রিক GPA প্রদান করা হয়নি।
              CQ, MCQ ও Practical প্রতিটিতে আলাদাভাবে পাশ করতে হবে।
            </div>
          )}

          <div className="sr-subjects-list">
            {mark.subjects?.map((sub,i) => (
              <SubjectDetail key={i} sub={sub} index={i}/>
            ))}
          </div>

          {/* Grand total */}
          <div className="sr-total-row">
            <span className="sr-total-label">Grand Total</span>
            <span className="sr-total-val">{mark.totalObtained} / {mark.totalFull}</span>
            <span className="sr-total-pct">{mark.percentage?.toFixed(2)}%</span>
            {mark.result!=='FAIL' && (
              <span className="sr-total-gpa">
                GPA <strong>{mark.gpa?.toFixed(2)}</strong> / 5.00
              </span>
            )}
          </div>

          {mark.remarks && (
            <div className="sr-remarks"><AlertCircle size={12}/> {mark.remarks}</div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────
const StudentResults = () => {
  const [marks,   setMarks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    markService.getMyMarks()
      .then(res => setMarks(res.data || []))
      .catch(() => setError('ফলাফল লোড করতে সমস্যা হয়েছে।'))
      .finally(() => setLoading(false));
  }, []);

  const bestGPA   = marks.length ? Math.max(...marks.map(m=>m.gpa||0)) : 0;
  const totalPass = marks.filter(m=>m.result==='PASS').length;
  const totalFail = marks.filter(m=>m.result==='FAIL').length;

  const GRADES = [
    ['A+','>79%','5.00'],['A','>69%','4.00'],['A-','>59%','3.50'],
    ['B','>49%','3.00'],['C','>39%','2.00'],['D','>32%','1.00'],['F','≤32%','0.00'],
  ];

  if (loading) return (
    <div className="sr-loading"><Loader size={38} className="sr-spin"/><p>ফলাফল লোড হচ্ছে…</p></div>
  );
  if (error) return (
    <div className="sr-error"><AlertCircle size={38}/><p>{error}</p></div>
  );
  if (!marks.length) return (
    <div className="sr-empty">
      <div className="sr-empty-icon"><Award size={44}/></div>
      <h3>কোনো প্রকাশিত ফলাফল নেই</h3>
      <p>আপনার পরীক্ষার ফলাফল প্রকাশিত হলে এখানে দেখা যাবে।</p>
    </div>
  );

  return (
    <div className="sr-page">

      {/* Heading */}
      <div className="sr-page-hdr">
        <div className="sr-page-icon"><Award size={20}/></div>
        <div>
          <h1 className="sr-page-title">আমার ফলাফল</h1>
          <p className="sr-page-sub">My Exam Results</p>
        </div>
      </div>

      {/* Hero */}
      <div className="sr-hero">
        <div className="sr-hero-donut">
          <GpaDonut gpa={bestGPA}/>
          <div>
            <p className="sr-hero-donut-label">সর্বোচ্চ GPA</p>
            <p className="sr-hero-donut-div">{marks.find(m=>m.gpa===bestGPA)?.division||'—'}</p>
          </div>
        </div>
        <div className="sr-hero-stats">
          <div className="sr-hero-stat blue">
            <BookOpen size={16}/>
            <span className="sr-hs-val">{marks.length}</span>
            <span className="sr-hs-lbl">মোট পরীক্ষা</span>
          </div>
          <div className="sr-hero-stat green">
            <CheckCircle size={16}/>
            <span className="sr-hs-val">{totalPass}</span>
            <span className="sr-hs-lbl">উত্তীর্ণ</span>
          </div>
          {totalFail>0 && (
            <div className="sr-hero-stat red">
              <XCircle size={16}/>
              <span className="sr-hs-val">{totalFail}</span>
              <span className="sr-hs-lbl">অকৃতকার্য</span>
            </div>
          )}
          <div className="sr-hero-stat amber">
            <TrendingUp size={16}/>
            <span className="sr-hs-val">{marks.length?Math.max(...marks.map(m=>m.percentage||0)).toFixed(1)+'%':'—'}</span>
            <span className="sr-hs-lbl">সর্বোচ্চ %</span>
          </div>
        </div>
      </div>

      {/* Grade legend */}
      <div className="sr-legend">
        <p className="sr-legend-title"><GraduationCap size={12}/> গ্রেড পয়েন্ট সারণী</p>
        <div className="sr-legend-row">
          {GRADES.map(([g,r,p])=>{
            const c=gradeColor(g);
            return (
              <div key={g} className="sr-legend-chip" style={{background:c.bg,borderColor:c.bd}}>
                <span style={{color:c.tx,fontWeight:900,fontSize:13}}>{g}</span>
                <span className="sr-legend-range">{r}</span>
                <span className="sr-legend-gp">GPA {p}</span>
              </div>
            );
          })}
        </div>
        <div className="sr-legend-rules">
          ★ CQ, MCQ ও Practical প্রত্যেকটিতে <strong>আলাদাভাবে</strong> পাশ করতে হবে।
          &nbsp; MCQ ফাঁকা রাখলে শুধু CQ দিয়ে গ্রেড আসবে।
          &nbsp; যেকোনো বিষয়ে F → সামগ্রিক <strong>GPA প্রদান করা হয় না</strong>।
        </div>
      </div>

      {/* Results list */}
      <div className="sr-results-section">
        <h2 className="sr-section-title"><BarChart2 size={15}/> পরীক্ষার ফলাফলের তালিকা</h2>
        <div className="sr-exams-list">
          {marks.map((mark,i) => (
            <ExamCard key={mark._id} mark={mark} index={i+1}/>
          ))}
        </div>
      </div>

    </div>
  );
};

export default StudentResults;