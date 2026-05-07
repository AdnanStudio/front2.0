/////
// FILE PATH: src/pages/ResultCardGenerator.jsx
// Mark logic: CQ(P1+P2) + MCQ(optional) + Practical(optional)
// Science: CQ=50/paper, MCQ=25/paper, Practical=25/paper
// Arts   : CQ=70/paper, MCQ=30/paper
// GP     : >79=5  >69=4  >59=3.5  >49=3  >39=2  >32=1  else=F
// npm install html2canvas jspdf xlsx
// ============================================================
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Download, Loader, Award, Upload, X,
  Search, CheckSquare, Square, Eye, EyeOff, RefreshCw,
  Filter, ChevronDown, ChevronUp, CheckCircle, Plus,
  Trash2, Calendar, BookOpen, GraduationCap, Edit3,
  Save, BarChart2, FileSpreadsheet, FlaskConical,
  Layers, ToggleLeft, ToggleRight
} from 'lucide-react';
import studentService from '../services/studentService';
import classService   from '../services/classService';
import websiteService from '../services/websiteService';
import markService    from '../services/markService';
import './ResultCardGenerator.css';

// ─────────────────────────────────────────────────────────
const COLLEGE = {
  nameEn : 'MALKHANAGAR COLLEGE',
  nameBn : 'মালখানগর কলেজ',
  address: 'Sirajdikhan, Munshiganj',
  eiin   : '134590',
  phone  : '01309-134590',
  email  : 'MalkhannagarCollege@gmail.com',
};

const THEMES = {
  HSC:     { hg:'linear-gradient(135deg,#5a0408,#84070f 55%,#c0392b)', nc:'#5a0408', th:'#5a0408', vb:'#fef2f2', ac:'#e74c3c' },
  Degree:  { hg:'linear-gradient(135deg,#064E3B,#065F46 55%,#059669)', nc:'#064E3B', th:'#065F46', vb:'#ECFDF5', ac:'#059669' },
  Honours: { hg:'linear-gradient(135deg,#1e3a8a,#1d4ed8 55%,#3b82f6)', nc:'#1e3a8a', th:'#1d4ed8', vb:'#eff6ff', ac:'#3b82f6' },
};
const getT     = p => THEMES[p] || THEMES.Degree;
const safeFile = v => (v||'').toString().replace(/\s+/g,'_').replace(/[^\w.-]/g,'');
const blank    = v => v === '' || v === null || v === undefined;

// ─────────────────────────────────────────────────────────
//  GRADE / GP LOGIC
// ─────────────────────────────────────────────────────────
function gpFromPct(pct) {
  if (pct > 79) return { grade:'A+', gp:5.0 };
  if (pct > 69) return { grade:'A',  gp:4.0 };
  if (pct > 59) return { grade:'A-', gp:3.5 };
  if (pct > 49) return { grade:'B',  gp:3.0 };
  if (pct > 39) return { grade:'C',  gp:2.0 };
  if (pct > 32) return { grade:'D',  gp:1.0 };
  return             { grade:'F',  gp:0   };
}

// entry = { cqP1, cqP2, mcqP1, mcqP2, pracP1, pracP2 }
// sub   = subject config object
function calcSubject(sub, entry) {
  const isPair = Boolean(sub.isPair);
  const papers = isPair ? 2 : 1;

  // --- CQ (required) ---
  const cqFMperPaper = Number(sub.cqFM) || 70;
  const cqFMtotal    = cqFMperPaper * papers;
  const cqPMtotal    = Number(sub.cqPM) || Math.ceil(cqFMtotal * 0.33);

  if (blank(entry?.cqP1)) {
    return {
      grade:'—', gp:0, status:'absent',
      cqTotal:null, mcqTotal:null, pracTotal:null,
      totalObt:0, totalFull:cqFMtotal, pct:0,
      cqPassed:null, mcqPassed:null, pracPassed:null,
    };
  }

  const cqP1N   = Number(entry.cqP1) || 0;
  const cqP2N   = (isPair && !blank(entry?.cqP2)) ? Number(entry.cqP2)||0 : 0;
  const cqTotal = cqP1N + cqP2N;
  const cqPassed= cqTotal >= cqPMtotal;

  // --- MCQ (optional) ---
  const mcqActive = sub.hasMCQ && !blank(entry?.mcqP1);
  const mcqFMtotal = mcqActive ? (Number(sub.mcqFM)||30)*papers : 0;
  const mcqPMtotal = mcqActive ? (Number(sub.mcqPM)||Math.ceil(mcqFMtotal*0.33)) : 0;
  let mcqTotal=0, mcqPassed=null;
  if (mcqActive) {
    const m1 = Number(entry.mcqP1)||0;
    const m2 = (isPair && !blank(entry?.mcqP2)) ? Number(entry.mcqP2)||0 : 0;
    mcqTotal  = m1+m2;
    mcqPassed = mcqTotal >= mcqPMtotal;
  }

  // --- Practical (optional) ---
  const pracActive = sub.hasPractical && !blank(entry?.pracP1);
  const pracFMtotal = pracActive ? (Number(sub.practicalFM)||25)*papers : 0;
  const pracPMtotal = pracActive ? (Number(sub.practicalPM)||Math.ceil(pracFMtotal*0.33)) : 0;
  let pracTotal=0, pracPassed=null;
  if (pracActive) {
    const p1 = Number(entry.pracP1)||0;
    const p2 = (isPair && !blank(entry?.pracP2)) ? Number(entry.pracP2)||0 : 0;
    pracTotal  = p1+p2;
    pracPassed = pracTotal >= pracPMtotal;
  }

  const totalObt  = cqTotal + mcqTotal + pracTotal;
  const totalFull = cqFMtotal + mcqFMtotal + pracFMtotal;
  const pct       = totalFull > 0 ? (totalObt/totalFull)*100 : 0;

  const anyFail = !cqPassed
    || (mcqPassed !== null && !mcqPassed)
    || (pracPassed !== null && !pracPassed);

  if (anyFail) {
    return {
      grade:'F', gp:0, status:'fail',
      cqTotal, mcqTotal: mcqActive?mcqTotal:null, pracTotal: pracActive?pracTotal:null,
      totalObt, totalFull, pct,
      cqPassed, mcqPassed, pracPassed,
      cqFMtotal, mcqFMtotal, pracFMtotal, cqPMtotal, mcqPMtotal, pracPMtotal,
    };
  }

  const { grade, gp } = gpFromPct(pct);
  return {
    grade, gp, status:'pass',
    cqTotal, mcqTotal: mcqActive?mcqTotal:null, pracTotal: pracActive?pracTotal:null,
    totalObt, totalFull, pct,
    cqPassed, mcqPassed, pracPassed,
    cqFMtotal, mcqFMtotal, pracFMtotal, cqPMtotal, mcqPMtotal, pracPMtotal,
  };
}

function computeTotal(subjects, studentMark) {
  let sumObt=0, sumFull=0, sumGP=0, counted=0, hasFail=false;
  for (const sub of subjects) {
    const r = calcSubject(sub, studentMark?.[sub.code]);
    if (r.status==='absent') continue;
    sumObt  += r.totalObt;
    sumFull += r.totalFull;
    sumGP   += r.gp;
    counted++;
    if (r.status==='fail') hasFail=true;
  }
  const gpa = counted>0 ? (sumGP/counted).toFixed(2) : '0.00';
  const pct = sumFull>0 ? ((sumObt/sumFull)*100).toFixed(2) : '0.00';
  const result = counted===0?'NOT ENTERED':hasFail?'FAIL':counted<subjects.length?'INCOMPLETE':'PASS';
  const division = !hasFail && counted>0
    ? parseFloat(gpa)>=4.5?'First Division (Distinction)':parseFloat(gpa)>=3.5?'First Division':parseFloat(gpa)>=2.5?'Second Division':'Third Division'
    : '—';
  return { sumObt, sumFull, gpa, pct, result, division, hasFail, counted };
}

// Convert DB subject array → local entry map
function buildEntryFromDB(subjects, savedSubs) {
  const out = {};
  for (const sub of subjects) {
    const s = savedSubs?.find(x => x.code === sub.code);
    if (!s) continue;
    out[sub.code] = {
      cqP1  : s.cqP1   ?? '', cqP2  : s.cqP2   ?? '',
      mcqP1 : s.mcqP1  ?? '', mcqP2 : s.mcqP2  ?? '',
      pracP1: s.practicalP1 ?? '', pracP2: s.practicalP2 ?? '',
    };
  }
  return out;
}

// ─────────────────────────────────────────────────────────
//  SUBJECT PRESETS
// ─────────────────────────────────────────────────────────
function makePreset(type, isPair) {
  const papers = isPair ? 2 : 1;
  if (type === 'science') {
    return {
      subjectType:'science', isPair,
      cqFM:50, cqPM: Math.ceil(50*papers*0.33),
      hasMCQ:true,  mcqFM:25, mcqPM: Math.ceil(25*papers*0.33),
      hasPractical:true, practicalFM:25, practicalPM: Math.ceil(25*papers*0.33),
    };
  }
  return {
    subjectType:'arts', isPair,
    cqFM:70, cqPM: Math.ceil(70*papers*0.33),
    hasMCQ:true,  mcqFM:30, mcqPM: Math.ceil(30*papers*0.33),
    hasPractical:false, practicalFM:25, practicalPM: Math.ceil(25*papers*0.33),
  };
}

const DEF_SUBS = [
  { code:'BAN', name:'Bangla',  ...makePreset('arts',true) },
  { code:'ENG', name:'English', ...makePreset('arts',true) },
  { code:'ICT', name:'ICT',     ...makePreset('science',true) },
  { code:'MAT', name:'Mathematics', ...makePreset('arts',true), hasMCQ:false },
];

// ─────────────────────────────────────────────────────────
//  SMALL UI COMPONENTS
// ─────────────────────────────────────────────────────────
const Panel = ({ title, icon, children, badge, defaultOpen=true }) => {
  const [open,setOpen] = useState(defaultOpen);
  return (
    <section className="rcg-panel">
      <button className="rcg-panel-head" onClick={()=>setOpen(o=>!o)}>
        <span className="rcg-panel-hl">{icon} {title}
          {badge!=null && <span className="rcg-panel-badge">{badge}</span>}
        </span>
        {open ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
      </button>
      {open && <div className="rcg-panel-body">{children}</div>}
    </section>
  );
};

const Tog = ({ on, onToggle, label, activeColor='#059669' }) => (
  <button
    onClick={onToggle}
    style={{
      display:'flex', alignItems:'center', gap:5, border:'none', background:'none',
      cursor:'pointer', fontSize:11, fontWeight:700,
      color: on ? activeColor : '#94a3b8', padding:'2px 4px',
    }}
  >
    {on ? <ToggleRight size={18} color={activeColor}/> : <ToggleLeft size={18} color="#d1d5db"/>}
    {label}
  </button>
);

const N = ({ value, onChange, max, placeholder, width=64 }) => (
  <input
    type="number" min="0" max={max}
    placeholder={placeholder}
    value={value ?? ''}
    onChange={e => onChange(e.target.value)}
    style={{
      width, padding:'3px 6px', border:'1px solid #d1d5db',
      borderRadius:4, fontSize:12, textAlign:'center',
    }}
  />
);

// ─────────────────────────────────────────────────────────
//  SUBJECT CONFIG ROW
// ─────────────────────────────────────────────────────────
const SubjectRow = ({ sub, idx, onChange, onRemove }) => {
  const set   = (f,v) => onChange(idx, {...sub,[f]:v});
  const setPre= (type, isPair) => onChange(idx, { code:sub.code, name:sub.name, ...makePreset(type, isPair) });
  const papers= sub.isPair ? 2 : 1;
  const cqFull  = (Number(sub.cqFM)||70)*papers;
  const mcqFull = (Number(sub.mcqFM)||30)*papers;
  const pracFull= (Number(sub.practicalFM)||25)*papers;
  const totalFM = cqFull + (sub.hasMCQ?mcqFull:0) + (sub.hasPractical?pracFull:0);

  return (
    <div className="sub-row-card">
      {/* ── Row 1: identity ── */}
      <div className="sub-row-1">
        <input className="sub-inp sub-code" placeholder="Code" value={sub.code} onChange={e=>set('code',e.target.value)}/>
        <input className="sub-inp sub-name" placeholder="Subject Name"  value={sub.name} onChange={e=>set('name',e.target.value)}/>
        <select className="sub-sel" value={sub.subjectType}
          onChange={e=>setPre(e.target.value, sub.isPair)}>
          <option value="arts">Arts / Commerce / BMT</option>
          <option value="science">Science</option>
          <option value="custom">Custom</option>
        </select>
        <button
          className={`pair-btn${sub.isPair?' active':''}`}
          onClick={()=>setPre(sub.subjectType, !sub.isPair)}
          title={sub.isPair?'Click for Single paper':'Click for Pair (P1+P2)'}
        >
          <Layers size={12}/>
          {sub.isPair ? 'Pair (P1+P2)' : 'Single (1 paper)'}
        </button>
        <button className="sub-del" onClick={()=>onRemove(idx)} title="Remove"><Trash2 size={13}/></button>
      </div>

      {/* ── Row 2: marks config ── */}
      <div className="sub-row-2">

        {/* CQ */}
        <div className="mark-section cq-s">
          <div className="mark-sec-title">✍️ CQ (Written)</div>
          <div className="mark-sec-fields">
            <div className="mf-item">
              <label>FM / paper</label>
              <N value={sub.cqFM} onChange={v=>set('cqFM',v)} placeholder="70"/>
              <span className="mf-total">= {cqFull}</span>
            </div>
            <div className="mf-item">
              <label>Pass (total)</label>
              <N value={sub.cqPM} onChange={v=>set('cqPM',v)} placeholder={Math.ceil(cqFull*0.33)}/>
            </div>
          </div>
        </div>

        {/* MCQ */}
        <div className={`mark-section mcq-s${sub.hasMCQ?'':' dimmed'}`}>
          <div className="mark-sec-title">
            <Tog on={sub.hasMCQ} onToggle={()=>set('hasMCQ',!sub.hasMCQ)} label="MCQ (Objective)" activeColor="#7c3aed"/>
          </div>
          {sub.hasMCQ ? (
            <div className="mark-sec-fields">
              <div className="mf-item">
                <label>FM / paper</label>
                <N value={sub.mcqFM} onChange={v=>set('mcqFM',v)} placeholder="30"/>
                <span className="mf-total">= {mcqFull}</span>
              </div>
              <div className="mf-item">
                <label>Pass (total)</label>
                <N value={sub.mcqPM} onChange={v=>set('mcqPM',v)} placeholder={Math.ceil(mcqFull*0.33)}/>
              </div>
            </div>
          ) : (
            <p className="mark-sec-hint">Leave MCQ blank → grade from CQ only</p>
          )}
        </div>

        {/* Practical */}
        <div className={`mark-section prac-s${sub.hasPractical?'':' dimmed'}`}>
          <div className="mark-sec-title">
            <Tog on={sub.hasPractical} onToggle={()=>set('hasPractical',!sub.hasPractical)} label="Practical" activeColor="#0891b2"/>
          </div>
          {sub.hasPractical ? (
            <div className="mark-sec-fields">
              <div className="mf-item">
                <label>FM / paper</label>
                <N value={sub.practicalFM} onChange={v=>set('practicalFM',v)} placeholder="25"/>
                <span className="mf-total">= {pracFull}</span>
              </div>
              <div className="mf-item">
                <label>Pass (total)</label>
                <N value={sub.practicalPM} onChange={v=>set('practicalPM',v)} placeholder={Math.ceil(pracFull*0.33)}/>
              </div>
            </div>
          ) : (
            <p className="mark-sec-hint">Not applicable</p>
          )}
        </div>

        {/* Total FM */}
        <div className="mark-section total-s">
          <div className="mark-sec-title">Total FM</div>
          <div className="total-fm-val">{totalFM}</div>
          <div className="total-fm-hint">({papers} paper{papers>1?'s':''})</div>
        </div>

      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  MARKS ENTRY FORM
// ─────────────────────────────────────────────────────────
const MarksEntryForm = ({ student, subjects, marks, onSave, theme }) => {
  const [local, setLocal] = useState(() => {
    const init = {};
    for (const sub of subjects) {
      init[sub.code] = marks?.[sub.code]
        ? { ...marks[sub.code] }
        : { cqP1:'', cqP2:'', mcqP1:'', mcqP2:'', pracP1:'', pracP2:'' };
    }
    return init;
  });

  const setField = (code, field, val) =>
    setLocal(p => ({ ...p, [code]: { ...p[code], [field]: val } }));

  const total = computeTotal(subjects, local);

  const chipStyle = (passed) => !passed===null ? {} : passed
    ? { background:'#d1fae5', color:'#065f46', border:'1px solid #6ee7b7' }
    : { background:'#fee2e2', color:'#dc2626', border:'1px solid #fca5a5' };

  return (
    <div className="met-form">
      <div className="met-form-head" style={{ borderColor: theme.ac }}>
        <BarChart2 size={14} color={theme.nc}/>
        <strong style={{ color:theme.nc }}>{student.userId?.name}</strong>
        <span className="met-roll">Roll: {student.rollNumber||'—'}</span>
      </div>

      {subjects.map((sub, si) => {
        const entry  = local[sub.code] || {};
        const res    = calcSubject(sub, entry);
        const isPair = Boolean(sub.isPair);
        const papers = isPair ? 2 : 1;
        const cqFull = (Number(sub.cqFM)||70)*papers;
        const mcqFull= (Number(sub.mcqFM)||30)*papers;
        const pracFull=(Number(sub.practicalFM)||25)*papers;

        return (
          <div key={si} className={`met-subject${res.status==='fail'?' met-fail':res.status==='pass'?' met-pass':''}`}>

            {/* Subject header */}
            <div className="met-sub-hd">
              <span className="met-sub-badge">{sub.code}</span>
              <span className="met-sub-nm">{sub.name}</span>
              <span className="met-sub-tag">{sub.subjectType==='science'?'🔬 Sci':'📚 Arts'}</span>
              <span className="met-sub-pair">{isPair?'Pair':'Single'}</span>
              {res.status !== 'absent' && (
                <span className="met-sub-live" style={res.status==='fail'?{color:'#dc2626'}:{color:theme.nc}}>
                  {res.grade} · GP {res.gp?.toFixed(1)} · {((res.pct||0)).toFixed(1)}%
                </span>
              )}
            </div>

            <div className="met-components">

              {/* CQ */}
              <div className="met-comp cq-comp">
                <div className="met-comp-hd">
                  <span className="met-comp-label">✍️ CQ</span>
                  <span className="met-comp-fm">Full: {cqFull} | Pass: {sub.cqPM||Math.ceil(cqFull*0.33)}</span>
                  {res.cqTotal !== null && (
                    <span className="met-comp-total" style={chipStyle(res.cqPassed)}>
                      {res.cqTotal}/{cqFull} {res.cqPassed?'✓':'✗'}
                    </span>
                  )}
                </div>
                <div className="met-inputs">
                  <div className="met-inp-wrap">
                    <label>Paper 1</label>
                    <input type="number" min="0" max={sub.cqFM}
                      className={`met-inp${res.cqPassed===false?' inp-fail':res.cqPassed===true?' inp-pass':''}`}
                      placeholder={`0–${sub.cqFM}`}
                      value={entry.cqP1??''} onChange={e=>setField(sub.code,'cqP1',e.target.value)}/>
                  </div>
                  {isPair && (
                    <div className="met-inp-wrap">
                      <label>Paper 2</label>
                      <input type="number" min="0" max={sub.cqFM}
                        className={`met-inp${res.cqPassed===false?' inp-fail':res.cqPassed===true?' inp-pass':''}`}
                        placeholder={`0–${sub.cqFM}`}
                        value={entry.cqP2??''} onChange={e=>setField(sub.code,'cqP2',e.target.value)}/>
                    </div>
                  )}
                </div>
              </div>

              {/* MCQ */}
              {sub.hasMCQ && (
                <div className="met-comp mcq-comp">
                  <div className="met-comp-hd">
                    <span className="met-comp-label">📝 MCQ</span>
                    <span className="met-comp-fm">Full: {mcqFull} | Pass: {sub.mcqPM||Math.ceil(mcqFull*0.33)}</span>
                    <span className="met-optional-tag">optional</span>
                    {res.mcqTotal !== null && (
                      <span className="met-comp-total" style={chipStyle(res.mcqPassed)}>
                        {res.mcqTotal}/{mcqFull} {res.mcqPassed?'✓':'✗'}
                      </span>
                    )}
                  </div>
                  <div className="met-inputs">
                    <div className="met-inp-wrap">
                      <label>Paper 1</label>
                      <input type="number" min="0" max={sub.mcqFM}
                        className={`met-inp${res.mcqPassed===false?' inp-fail':res.mcqPassed===true?' inp-pass':''}`}
                        placeholder={`0–${sub.mcqFM} (opt)`}
                        value={entry.mcqP1??''} onChange={e=>setField(sub.code,'mcqP1',e.target.value)}/>
                    </div>
                    {isPair && (
                      <div className="met-inp-wrap">
                        <label>Paper 2</label>
                        <input type="number" min="0" max={sub.mcqFM}
                          className={`met-inp${res.mcqPassed===false?' inp-fail':res.mcqPassed===true?' inp-pass':''}`}
                          placeholder={`0–${sub.mcqFM}`}
                          value={entry.mcqP2??''} onChange={e=>setField(sub.code,'mcqP2',e.target.value)}/>
                      </div>
                    )}
                  </div>
                  <p className="met-skip-note">Blank = skip MCQ → CQ-only grade</p>
                </div>
              )}

              {/* Practical */}
              {sub.hasPractical && (
                <div className="met-comp prac-comp">
                  <div className="met-comp-hd">
                    <span className="met-comp-label">🔬 Practical</span>
                    <span className="met-comp-fm">Full: {pracFull} | Pass: {sub.practicalPM||Math.ceil(pracFull*0.33)}</span>
                    <span className="met-optional-tag">optional</span>
                    {res.pracTotal !== null && (
                      <span className="met-comp-total" style={chipStyle(res.pracPassed)}>
                        {res.pracTotal}/{pracFull} {res.pracPassed?'✓':'✗'}
                      </span>
                    )}
                  </div>
                  <div className="met-inputs">
                    <div className="met-inp-wrap">
                      <label>Paper 1</label>
                      <input type="number" min="0" max={sub.practicalFM}
                        className={`met-inp${res.pracPassed===false?' inp-fail':res.pracPassed===true?' inp-pass':''}`}
                        placeholder={`0–${sub.practicalFM} (opt)`}
                        value={entry.pracP1??''} onChange={e=>setField(sub.code,'pracP1',e.target.value)}/>
                    </div>
                    {isPair && (
                      <div className="met-inp-wrap">
                        <label>Paper 2</label>
                        <input type="number" min="0" max={sub.practicalFM}
                          className={`met-inp${res.pracPassed===false?' inp-fail':res.pracPassed===true?' inp-pass':''}`}
                          placeholder={`0–${sub.practicalFM}`}
                          value={entry.pracP2??''} onChange={e=>setField(sub.code,'pracP2',e.target.value)}/>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div className="met-footer">
        <div className="met-totals">
          <span>Total: <b>{total.sumObt}/{total.sumFull}</b></span>
          <span>Pct: <b>{total.pct}%</b></span>
          <span>GPA: <b style={{ color: total.hasFail?'#dc2626':theme.nc }}>
            {total.hasFail ? 'FAIL (no GPA)' : total.gpa}
          </b></span>
          <span className={`met-result${total.result==='PASS'?' pass':total.result==='FAIL'?' fail':''}`}>
            {total.result}
          </span>
          {total.result==='PASS' && <span className="met-div">{total.division}</span>}
        </div>
        <button className="met-save-btn" style={{ background:theme.hg }}
          onClick={() => onSave(student._id, local)}>
          <Save size={13}/> Save Marks
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  RESULT CARD  (A4 printable)
// ─────────────────────────────────────────────────────────
export const ResultCard = React.memo(({ student, logoUrl, signUrl, examConfig, subjects, marks, program }) => {
  const t     = getT(program);
  const total = computeTotal(subjects, marks);
  const name  = student.userId?.name || '—';

  return (
    <div className="result-card">

      {/* College header */}
      <div className="rc-college-header">
        <div className="rc-seal-wrap">
          {logoUrl
            ? <img src={logoUrl} alt="logo" crossOrigin="anonymous" className="rc-seal-img"
                onError={e=>{e.target.style.display='none';}}/>
            : <div className="rc-seal-fb" style={{borderColor:t.ac,color:t.nc}}><span>M</span></div>
          }
        </div>
        <div className="rc-college-text">
          <p className="rc-cname" style={{color:t.nc}}>𝖬𝖠𝖫𝖪𝖧𝖠𝖭𝖠𝖦𝖠𝖱 𝖢𝖮𝖫𝖫𝖤𝖦𝖤</p>
          <div className="rc-caddr">{COLLEGE.address} &nbsp;|&nbsp; EIIN: {COLLEGE.eiin}</div>
        </div>
      </div>

      <div className="rc-title-block">
        <p className="rc-sub-title" style={{color:t.nc}}>
          {program==='HSC'?'HSC PASS COURSE':program==='Degree'?'DEGREE PASS COURSE':'HONOURS PASS COURSE'}
        </p>
        <p className="rc-exam-detail">
          {examConfig.name||'Annual Examination'} · {examConfig.year||new Date().getFullYear()}
        </p>
      </div>

      {/* Student info */}
      <div className="rc-student-info">
        {[
          ['Name',          name],
          ["Father's Name", student.fatherName||student.guardianName||'—'],
          ['Class / Course',`${student.class?.name||(typeof student.class==='string'?student.class:'')||'—'}${student.section?' — '+student.section:''}`],
          ['Roll No.',      student.rollNumber||'—'],
          ['Session',       examConfig.session||student.session||'—'],
        ].map(([l,v])=>(
          <div key={l} className="rc-si-row">
            <span className="rc-si-label">{l}</span>
            <span className="rc-si-sep">:</span>
            <span className="rc-si-val">{v}</span>
          </div>
        ))}
      </div>

      {/* Marks table */}
      <div className="rc-table-wrap">
        <table className="rc-marks-table">
          <thead>
            <tr style={{background:t.th}}>
              <th className="rc-th" rowSpan={2}>#</th>
              <th className="rc-th" rowSpan={2}>Code</th>
              <th className="rc-th" style={{textAlign:'left'}} rowSpan={2}>Subject</th>
              <th className="rc-th" colSpan={3}>CQ (Written)</th>
              <th className="rc-th" colSpan={3}>MCQ</th>
              <th className="rc-th" colSpan={3}>Practical</th>
              <th className="rc-th" rowSpan={2}>Total</th>
              <th className="rc-th" rowSpan={2}>Grade</th>
              <th className="rc-th" rowSpan={2}>GP</th>
              <th className="rc-th" rowSpan={2}>Status</th>
            </tr>
            <tr style={{background:t.th+'cc',fontSize:9}}>
              <th className="rc-th">P1</th><th className="rc-th">P2</th><th className="rc-th">Total</th>
              <th className="rc-th">P1</th><th className="rc-th">P2</th><th className="rc-th">Total</th>
              <th className="rc-th">P1</th><th className="rc-th">P2</th><th className="rc-th">Total</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, i) => {
              const entry  = marks?.[sub.code];
              const res    = calcSubject(sub, entry);
              const isPair = Boolean(sub.isPair);
              const na     = <span style={{color:'#94a3b8'}}>—</span>;

              return (
                <tr key={i} className={i%2===0?'rc-tr-even':'rc-tr-odd'}>
                  <td className="rc-td rc-td-c">{i+1}</td>
                  <td className="rc-td rc-td-c" style={{fontFamily:'monospace'}}>{sub.code}</td>
                  <td className="rc-td">{sub.name}</td>

                  {/* CQ */}
                  <td className="rc-td rc-td-c">{!blank(entry?.cqP1)?entry.cqP1:na}</td>
                  <td className="rc-td rc-td-c">{isPair&&!blank(entry?.cqP2)?entry.cqP2:na}</td>
                  <td className={`rc-td rc-td-c${res.cqPassed===false?' rc-fail-c':''}`}>
                    {res.cqTotal??na}
                  </td>

                  {/* MCQ */}
                  {sub.hasMCQ && res.mcqTotal!==null ? (
                    <>
                      <td className="rc-td rc-td-c">{!blank(entry?.mcqP1)?entry.mcqP1:na}</td>
                      <td className="rc-td rc-td-c">{isPair&&!blank(entry?.mcqP2)?entry.mcqP2:na}</td>
                      <td className={`rc-td rc-td-c${res.mcqPassed===false?' rc-fail-c':''}`}>{res.mcqTotal}</td>
                    </>
                  ) : (
                    <><td className="rc-td rc-td-c" style={{color:'#94a3b8'}}>—</td><td className="rc-td rc-td-c" style={{color:'#94a3b8'}}>—</td><td className="rc-td rc-td-c" style={{color:'#94a3b8'}}>—</td></>
                  )}

                  {/* Practical */}
                  {sub.hasPractical && res.pracTotal!==null ? (
                    <>
                      <td className="rc-td rc-td-c">{!blank(entry?.pracP1)?entry.pracP1:na}</td>
                      <td className="rc-td rc-td-c">{isPair&&!blank(entry?.pracP2)?entry.pracP2:na}</td>
                      <td className={`rc-td rc-td-c${res.pracPassed===false?' rc-fail-c':''}`}>{res.pracTotal}</td>
                    </>
                  ) : (
                    <><td className="rc-td rc-td-c" style={{color:'#94a3b8'}}>—</td><td className="rc-td rc-td-c" style={{color:'#94a3b8'}}>—</td><td className="rc-td rc-td-c" style={{color:'#94a3b8'}}>—</td></>
                  )}

                  {/* Result */}
                  <td className={`rc-td rc-td-c${res.status==='fail'?' rc-fail-c':''}`} style={{fontWeight:700}}>
                    {res.status==='absent'?'Absent':`${res.totalObt}/${res.totalFull}`}
                  </td>
                  <td className={`rc-td rc-td-c${res.status==='fail'?' rc-fail-grade':res.status==='pass'?' rc-pass-grade':''}`}>
                    {res.grade}
                  </td>
                  <td className="rc-td rc-td-c">{res.status==='absent'?'—':res.gp?.toFixed(1)}</td>
                  <td className={`rc-td rc-td-c${res.status==='fail'?' rc-fail-c':''}`}>
                    {res.status==='fail'?'FAIL':res.status==='absent'?'Absent':'Pass'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{background:t.th+'18',borderTop:`2px solid ${t.ac}`,fontWeight:800}}>
              <td className="rc-td" colSpan={3} style={{textAlign:'right',color:t.nc}}>Grand Total</td>
              <td className="rc-td" colSpan={9}/>
              <td className="rc-td rc-td-c" style={{color:t.nc,fontSize:13}}>{total.sumObt}/{total.sumFull}</td>
              <td className="rc-td" colSpan={3}/>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary */}
      <div className="rc-summary">
        <div className="rc-summary-left">
          {[
            ['Result', <span className={`rc-result-badge${total.result==='PASS'?' pass':total.result==='FAIL'?' fail':' pend'}`}>{total.result}</span>],
            ['Division', total.division],
            ['Percentage', `${total.pct}%`],
            ['GPA', total.hasFail
              ? <span style={{color:'#dc2626',fontWeight:800}}>Failed — GPA not awarded</span>
              : <span style={{color:t.nc,fontWeight:800}}>{total.gpa} / 5.00</span>],
          ].map(([l,v])=>(
            <div key={l} className="rc-result-row">
              <span className="rc-rl">{l}</span>
              <span className="rc-rsep">:</span>
              <span className="rc-rv">{v}</span>
            </div>
          ))}
        </div>
        <div className="rc-grade-legend">
          <p className="rc-legend-title">Grade Scale</p>
          {[['A+','>79%','5.00'],['A','>69%','4.00'],['A-','>59%','3.50'],
            ['B','>49%','3.00'],['C','>39%','2.00'],['D','>32%','1.00'],['F','≤32%','0'],
          ].map(([g,r,gp])=>(
            <div key={g} className="rc-legend-row">
              <span className="rc-leg-grade" style={g==='F'?{color:'#dc2626'}:{color:t.nc}}>{g}</span>
              <span className="rc-leg-range">{r}</span>
              <span className="rc-leg-gp">GP {gp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Signature row */}
      <div className="rc-sign-row" style={{borderTopColor:t.ac+'55'}}>
        <div className="rc-sign-block">
          <div className="rc-sign-blank"/>
          <div className="rc-sign-rule" style={{background:t.ac}}/>
          <p className="rc-sign-label">Executor</p>
        </div>
        <div className="rc-sign-block">
          {signUrl ? <img src={signUrl} alt="sign" className="rc-sign-img"/> : <div className="rc-sign-blank"/>}
          <div className="rc-sign-rule" style={{background:t.ac}}/>
          <p className="rc-sign-label">Principal</p>
        </div>
      </div>

      <div className="rc-footer" style={{background:t.hg}}>
        <p className="rc-footer-text">{COLLEGE.nameEn} | ☎ {COLLEGE.phone} | {COLLEGE.email}</p>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────
//  PROGRESS OVERLAY
// ─────────────────────────────────────────────────────────
const ProgressOverlay = ({ progress, current, total }) => (
  <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
    <div style={{background:'#fff',borderRadius:16,padding:'36px 48px',textAlign:'center'}}>
      <svg viewBox="0 0 80 80" width="76" height="76">
        <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" strokeWidth="7"/>
        <circle cx="40" cy="40" r="32" fill="none" stroke="#059669" strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${2*Math.PI*32}`}
          strokeDashoffset={`${2*Math.PI*32*(1-progress/100)}`}
          transform="rotate(-90 40 40)"
          style={{transition:'stroke-dashoffset .3s'}}/>
        <text x="40" y="45" textAnchor="middle" fontSize="13" fontWeight="800" fill="#065F46">{progress}%</text>
      </svg>
      <p style={{fontWeight:700,marginTop:8}}>Generating PDF…</p>
      <p style={{fontSize:12,color:'#64748b'}}>{current} of {total}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────
const ResultCardGenerator = () => {
  const navigate = useNavigate();

  const [all,        setAll]        = useState([]);
  const [classes,    setClasses]    = useState([]);
  const [sections,   setSections]   = useState([]);
  const [settings,   setSettings]   = useState(null);
  const [logoUrl,    setLogoUrl]    = useState('/logo.png');
  const [signUrl,    setSignUrl]    = useState(null);
  const [customLogo, setCustomLogo] = useState(null);
  const [program,    setProgram]    = useState('Degree');
  const [examConfig, setExamConfig] = useState({ name:'Annual Examination 2025', year:'2025', session:'2024-2025' });
  const [subjects,   setSubjects]   = useState(DEF_SUBS);
  const [studentMarks, setStudentMarks] = useState({});

  const [fCls,    setFCls]    = useState('');
  const [fSec,    setFSec]    = useState('');
  const [q,       setQ]       = useState('');
  const [fResult, setFResult] = useState('');
  const [sel,     setSel]     = useState(new Set());
  const [prevId,  setPrevId]  = useState(null);
  const [marksId, setMarksId] = useState(null);

  const [initLoad,     setInitLoad]     = useState(true);
  const [stuLoad,      setStuLoad]      = useState(false);
  const [genning,      setGenning]      = useState(false);
  const [genPct,       setGenPct]       = useState(0);
  const [genCur,       setGenCur]       = useState(0);
  const [genTot,       setGenTot]       = useState(0);
  const [sideOpen,     setSideOpen]     = useState(false);
  const [loadingMarks, setLoadingMarks] = useState(false);

  const logoRef = useRef(null);
  const signRef = useRef(null);
  const t = getT(program);

  // ── Initial load ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [cls, ws] = await Promise.all([
          classService.getAllClasses?.() || Promise.resolve({ data:[] }),
          websiteService.getWebsiteSettings?.() || Promise.resolve({ data:null }),
        ]);
        setClasses(cls?.data || []);
        const s = ws?.data?.[0] || ws?.data || null;
        setSettings(s);
        if (s?.logo) setLogoUrl(s.logo);
        if (s?.principalSignature) setSignUrl(s.principalSignature);
      } catch {}
      setInitLoad(false);
    })();
  }, []);

  // ── Load students ─────────────────────────────────────────
  useEffect(() => {
    if (!fCls) { setAll([]); setSections([]); return; }
    setStuLoad(true);
    studentService.getAllStudents({ class: fCls })
      .then(r => {
        const list = r?.data || [];
        setAll(list);
        setSections([...new Set(list.map(s=>s.section).filter(Boolean))].sort());
      })
      .catch(() => setAll([]))
      .finally(() => setStuLoad(false));
  }, [fCls]);

  // ── Load saved marks ──────────────────────────────────────
  const loadSavedMarks = useCallback(async () => {
    if (!fCls || !examConfig.name) return;
    setLoadingMarks(true);
    try {
      const res = await markService.getAllMarks({
        className: fCls, examName: examConfig.name, session: examConfig.session,
      });
      const saved = {};
      for (const m of (res?.data || [])) {
        const sid = m.student?._id || m.student;
        if (sid) saved[sid] = buildEntryFromDB(subjects, m.subjects);
      }
      setStudentMarks(prev => ({ ...prev, ...saved }));
    } catch {}
    setLoadingMarks(false);
  }, [fCls, examConfig.name, examConfig.session, subjects]);

  useEffect(() => { loadSavedMarks(); }, [fCls, examConfig.name]);

  // ── Filtered students ─────────────────────────────────────
  const filtered = useMemo(() => {
    let list = fSec ? all.filter(s => s.section===fSec) : all;
    if (q.trim()) {
      const lq = q.toLowerCase();
      list = list.filter(s => (s.userId?.name||'').toLowerCase().includes(lq) || String(s.rollNumber||'').includes(lq));
    }
    if (fResult) {
      list = list.filter(s => computeTotal(subjects, studentMarks[s._id]).result === fResult);
    }
    return list;
  }, [all, fSec, q, fResult, subjects, studentMarks]);

  // ── Save marks ────────────────────────────────────────────
  const handleSaveMarks = useCallback(async (studentId, localMarks) => {
    try {
      const student = all.find(s => s._id === studentId);
      if (!student) { toast.error('Student not found'); return; }

      const subjectsPayload = subjects.map(sub => {
        const e = localMarks[sub.code] || {};
        const isPair = Boolean(sub.isPair);
        const n = v => (!blank(v) ? Number(v) : null);
        return {
          code   : sub.code, name: sub.name,
          subjectType: sub.subjectType, isPair,
          cqFM   : Number(sub.cqFM)  || 70,
          cqPM   : Number(sub.cqPM)  || null,
          cqP1   : n(e.cqP1),
          cqP2   : isPair ? n(e.cqP2) : null,
          hasMCQ : sub.hasMCQ,
          mcqFM  : Number(sub.mcqFM)  || 30,
          mcqPM  : Number(sub.mcqPM)  || null,
          mcqP1  : sub.hasMCQ ? n(e.mcqP1)  : null,
          mcqP2  : sub.hasMCQ && isPair ? n(e.mcqP2) : null,
          hasPractical  : sub.hasPractical,
          practicalFM   : Number(sub.practicalFM)  || 25,
          practicalPM   : Number(sub.practicalPM)  || null,
          practicalP1   : sub.hasPractical ? n(e.pracP1) : null,
          practicalP2   : sub.hasPractical && isPair ? n(e.pracP2) : null,
        };
      });

      await markService.saveMarks({
        studentId, examName: examConfig.name, examYear: examConfig.year,
        session: examConfig.session, program, className: fCls,
        section: student.section || fSec || '',
        subjects: subjectsPayload,
      });

      setStudentMarks(prev => ({ ...prev, [studentId]: localMarks }));
      toast.success(`✓ Marks saved — ${student.userId?.name || 'Student'}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save marks');
    }
  }, [all, subjects, examConfig, program, fCls, fSec]);

  // ── PDF ───────────────────────────────────────────────────
  const generatePDF = useCallback(async (targetStudents) => {
    if (!targetStudents.length) { toast.error('No students selected'); return; }
    setGenning(true); setGenPct(0); setGenCur(0); setGenTot(targetStudents.length);
    try {
      const [h2c, { jsPDF }] = await Promise.all([
        import('html2canvas').then(m => m.default),
        import('jspdf'),
      ]);
      const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();

      for (let i=0; i<targetStudents.length; i++) {
        const s = targetStudents[i];
        const div = document.createElement('div');
        div.style.cssText = 'position:fixed;left:-9999px;top:0;background:#fff;width:794px';
        document.body.appendChild(div);
        const { createRoot } = await import('react-dom/client');
        const root = createRoot(div);
        await new Promise(res => {
          root.render(
            <ResultCard student={s} logoUrl={customLogo||logoUrl} signUrl={signUrl}
              examConfig={examConfig} subjects={subjects}
              marks={studentMarks[s._id]||{}} program={program}/>
          );
          setTimeout(res, 500);
        });
        const canvas = await h2c(div.firstChild, { scale:2, useCORS:true, backgroundColor:'#fff', logging:false });
        const img = canvas.toDataURL('image/jpeg', 0.92);
        const imgH = W * (canvas.height/canvas.width);
        if (i>0) pdf.addPage();
        pdf.addImage(img, 'JPEG', 0, imgH<=H?(H-imgH)/2:0, W, Math.min(imgH,H));
        root.unmount(); document.body.removeChild(div);
        setGenCur(i+1); setGenPct(Math.round(((i+1)/targetStudents.length)*100));
      }
      pdf.save(targetStudents.length===1
        ? `ResultCard_${safeFile(targetStudents[0].userId?.name||'')}.pdf`
        : `ResultCards_${safeFile(fCls)}.pdf`);
      toast.success(`PDF saved (${targetStudents.length} card${targetStudents.length>1?'s':''})`);
    } catch (err) { console.error(err); toast.error('PDF generation failed'); }
    setGenning(false);
  }, [customLogo, logoUrl, signUrl, examConfig, subjects, studentMarks, program, fCls]);

  // ── Subject CRUD ──────────────────────────────────────────
  const changeSubject = (idx, s) => setSubjects(p => p.map((x,i) => i===idx ? s : x));
  const addSubject    = () => setSubjects(p => [...p, { code:'', name:'', ...makePreset('arts',true) }]);
  const removeSubject = idx => setSubjects(p => p.filter((_,i) => i!==idx));

  // ── Select ────────────────────────────────────────────────
  const toggleSel = (id, shift) => {
    setSel(p => { const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
    setPrevId(id);
  };
  const allSel  = filtered.length>0 && filtered.every(s=>sel.has(s._id));
  const someSel = filtered.some(s=>sel.has(s._id));
  const selStudents = useMemo(() => all.filter(s=>sel.has(s._id)), [all,sel]);

  if (initLoad) return (
    <div className="rcg-loading-full"><Loader className="spin" size={28} color="#059669"/><p>Loading…</p></div>
  );

  return (
    <div className="rcg-root">
      {genning && <ProgressOverlay progress={genPct} current={genCur} total={genTot}/>}

      {/* TOP BAR */}
      <div className="rcg-topbar" style={{background:t.hg}}>
        <button className="rcg-back-btn" onClick={()=>navigate(-1)}><ArrowLeft size={16}/> Back</button>
        <span className="rcg-topbar-title"><Award size={18}/> Result Card Generator</span>
        <button className="rcg-settings-btn" onClick={()=>setSideOpen(o=>!o)}><Filter size={14}/> Settings</button>
      </div>

      <div className="rcg-body">
        {/* SIDEBAR */}
        <aside className={`rcg-sidebar${sideOpen?' open':''}`}>

          {/* Program */}
          <Panel title="Program" icon={<GraduationCap size={13}/>}>
            <div className="rcg-prog-sel">
              {[{k:'HSC',c:'#84070f'},{k:'Degree',c:'#065F46'},{k:'Honours',c:'#1d4ed8'}].map(o=>(
                <button key={o.k}
                  style={program===o.k?{background:o.c,borderColor:o.c,color:'#fff',padding:'6px 14px',borderRadius:7,border:'2px solid',fontWeight:700,cursor:'pointer'}
                    :{borderColor:o.c+'44',color:o.c,padding:'6px 14px',borderRadius:7,border:'2px solid',fontWeight:600,cursor:'pointer',background:'#fff'}}
                  onClick={()=>setProgram(o.k)}>{o.k}</button>
              ))}
            </div>
          </Panel>

          {/* Exam config */}
          <Panel title="Exam Info" icon={<Calendar size={13}/>}>
            {[['Exam Name','name'],['Year','year'],['Session','session']].map(([l,k])=>(
              <div key={k} className="rcg-field">
                <label className="rcg-label">{l}</label>
                <input className="rcg-inp" value={examConfig[k]}
                  onChange={e=>setExamConfig(p=>({...p,[k]:e.target.value}))}/>
              </div>
            ))}
          </Panel>

          {/* Subjects */}
          <Panel title="Subject Config" icon={<BookOpen size={13}/>} badge={subjects.length}>
            <div className="sub-cfg-info-box">
              <strong>Rules:</strong> CQ = required &nbsp;·&nbsp; MCQ = optional (blank → skip) &nbsp;·&nbsp; Practical = optional<br/>
              Each must pass <em>independently</em>. Any subject FAIL → no overall GPA.<br/>
              <strong>Science:</strong> CQ 50/paper · MCQ 25/paper · Practical 25/paper<br/>
              <strong>Arts/BMT:</strong> CQ 70/paper · MCQ 30/paper
            </div>
            <div className="sub-cfg-list">
              {subjects.map((sub,idx)=>(
                <SubjectRow key={idx} sub={sub} idx={idx} onChange={changeSubject} onRemove={removeSubject}/>
              ))}
            </div>
            <button className="rcg-add-sub-btn" onClick={addSubject}>
              <Plus size={12}/> Add Subject
            </button>
          </Panel>

          {/* Logo/Sign */}
          <Panel title="Logo & Signature" icon={<Upload size={13}/>} defaultOpen={false}>
            {[['College Logo',logoUrl||customLogo,setCustomLogo,logoRef,false],
              ['Principal Signature',signUrl,setSignUrl,signRef,true]].map(([l,val,setter,ref,sig])=>(
              <div key={l} className="rcg-upfield">
                <div className="rcg-uplbl">{l} {val && <CheckCircle size={10} color="#059669"/>}</div>
                <input ref={ref} type="file" accept="image/*" style={{display:'none'}}
                  onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setter(ev.target.result);r.readAsDataURL(f);e.target.value='';}}/>
                <div style={{display:'flex',gap:6}}>
                  <button className="rcg-upbtn" onClick={()=>ref.current?.click()}>
                    <Upload size={11}/> {val?'Change':'Upload'}
                  </button>
                  {val && <button className="rcg-updel" onClick={()=>setter(null)}><X size={11}/></button>}
                </div>
                {val && <img src={val} alt="" style={{maxWidth:'100%',maxHeight:56,marginTop:6,borderRadius:4,border:'1px solid #e2e8f0'}}/>}
              </div>
            ))}
          </Panel>
        </aside>

        {/* MAIN */}
        <main className="rcg-main">
          {/* Filter bar */}
          <div className="rcg-filter-bar">
            <select className="rcg-sel" value={fCls} onChange={e=>{setFCls(e.target.value);setFSec('');}}>
              <option value="">— Select Class —</option>
              {classes.map(c=><option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
            {sections.length>0 && (
              <select className="rcg-sel" value={fSec} onChange={e=>setFSec(e.target.value)}>
                <option value="">All Sections</option>
                {sections.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            )}
            <div className="rcg-search-wrap">
              <Search size={13}/>
              <input className="rcg-search-inp" placeholder="Name / Roll…" value={q} onChange={e=>setQ(e.target.value)}/>
            </div>
            <select className="rcg-sel" value={fResult} onChange={e=>setFResult(e.target.value)}>
              <option value="">All Results</option>
              {['PASS','FAIL','INCOMPLETE','NOT ENTERED'].map(r=><option key={r} value={r}>{r}</option>)}
            </select>
            <button className="rcg-load-marks-btn" onClick={loadSavedMarks} disabled={loadingMarks||!fCls}>
              <RefreshCw size={13} className={loadingMarks?'spin':''}/> Reload
            </button>
          </div>

          {/* Bulk bar */}
          {someSel && (
            <div className="rcg-bulk-bar">
              <span className="rcg-bulk-count">{sel.size} selected</span>
              <button className="rcg-bulk-pdf" style={{background:t.hg}}
                onClick={()=>generatePDF(selStudents)} disabled={genning}>
                <Download size={13}/> PDF ({sel.size})
              </button>
              <button className="rcg-bulk-clear" onClick={()=>setSel(new Set())}><X size={13}/> Clear</button>
            </div>
          )}

          {/* Student list */}
          {stuLoad ? (
            <div className="rcg-stu-loading"><Loader className="spin" size={22}/><p>Loading students…</p></div>
          ) : !fCls ? (
            <div className="rcg-empty"><GraduationCap size={40} color="#d1d5db"/><p>Select a class to get started</p></div>
          ) : filtered.length===0 ? (
            <div className="rcg-empty"><Search size={36} color="#d1d5db"/><p>No students found</p></div>
          ) : (
            <div className="rcg-student-list">
              <div className="rcg-sel-all-row">
                <button className="rcg-sel-all-btn"
                  onClick={()=>allSel?setSel(new Set()):setSel(new Set(filtered.map(s=>s._id)))}>
                  {allSel?<CheckSquare size={14}/>:<Square size={14}/>}
                  {allSel?'Deselect All':`Select All (${filtered.length})`}
                </button>
              </div>

              {filtered.map(s => {
                const total    = computeTotal(subjects, studentMarks[s._id]);
                const isSel    = sel.has(s._id);
                const marksOpen= marksId===s._id;
                const prevOpen = prevId===s._id;

                return (
                  <div key={s._id} className={`rcg-stu-card${isSel?' selected':''}`}>
                    <div className="rcg-stu-row">
                      <button className="rcg-stu-chk" onClick={e=>toggleSel(s._id,e.shiftKey)}>
                        {isSel?<CheckSquare size={16} color={t.nc}/>:<Square size={16} color="#9ca3af"/>}
                      </button>
                      <div className="rcg-stu-info">
                        <span className="rcg-stu-name">{s.userId?.name||'—'}</span>
                        <span className="rcg-stu-meta">Roll: {s.rollNumber||'—'} · {s.class||'—'}{s.section?` (${s.section})`:''}</span>
                      </div>
                      <div className="rcg-stu-result">
                        <span className={`rcg-result-badge${total.result==='PASS'?' pass':total.result==='FAIL'?' fail':' pend'}`}>
                          {total.result}
                        </span>
                        {total.result==='PASS' && (
                          <span style={{fontSize:11,color:t.nc,fontWeight:700}}>{total.gpa} GPA</span>
                        )}
                      </div>
                      <div className="rcg-stu-actions">
                        <button className="rcg-stu-marks-btn"
                          onClick={()=>setMarksId(id=>id===s._id?null:s._id)}>
                          {marksOpen?<><EyeOff size={13}/> Close</>:<><Edit3 size={13}/> Marks</>}
                        </button>
                        <button className="rcg-stu-preview-btn"
                          onClick={()=>setPrevId(id=>id===s._id?null:s._id)}>
                          {prevOpen?<><EyeOff size={13}/> Hide</>:<><Eye size={13}/> Preview</>}
                        </button>
                        <button className="rcg-stu-pdf-btn" style={{background:t.hg}}
                          onClick={()=>generatePDF([s])} disabled={genning}>
                          <Download size={13}/> PDF
                        </button>
                      </div>
                    </div>

                    {marksOpen && (
                      <MarksEntryForm student={s} subjects={subjects}
                        marks={studentMarks[s._id]||{}}
                        onSave={handleSaveMarks} theme={t}/>
                    )}

                    {prevOpen && (
                      <div className="rcg-preview-wrap">
                        <ResultCard student={s} logoUrl={customLogo||logoUrl} signUrl={signUrl}
                          examConfig={examConfig} subjects={subjects}
                          marks={studentMarks[s._id]||{}} program={program}/>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ResultCardGenerator;