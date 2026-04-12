// ============================================================
// FILE PATH: src/pages/ResultCardGenerator.jsx
// npm install html2canvas jspdf
// ============================================================
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Download, Users, User, Loader, Award,
  Upload, X, Search, CheckSquare, Square, Eye, EyeOff,
  RefreshCw, Filter, ChevronDown, ChevronUp, CheckCircle,
  Plus, Trash2, Calendar, BookOpen, GraduationCap, Edit3,
  Save, BarChart2, FileSpreadsheet, Hash, AlignLeft,
  Target, ShieldCheck
} from 'lucide-react';
import studentService  from '../services/studentService';
import classService    from '../services/classService';
import websiteService  from '../services/websiteService';
import markService     from '../services/markService';
import './ResultCardGenerator.css';

// ─────────────────────────────────────────────────────────
//  COLLEGE INFO
// ─────────────────────────────────────────────────────────
const COLLEGE = {
  nameBn  : 'মালখানগর কলেজ',
  nameEn  : 'MALKHANAGAR COLLEGE',
  address : 'Sirajdikhan, Munshiganj',
  eiin    : '134590',
  phone   : '01309-134590',
  email   : 'MalkhannagarCollege@gmail.com',
  affil   : 'Affiliated to National University, Bangladesh',
};

// ─────────────────────────────────────────────────────────
//  THEMES
// ─────────────────────────────────────────────────────────
const THEMES = {
  HSC: {
    hg:'linear-gradient(135deg,#5a0408 0%,#84070f 55%,#c0392b 100%)',
    ac:'#e74c3c', nc:'#5a0408', th:'#5a0408',
    vb:'#fef2f2', vc:'#84070f', vbr:'#fecaca',
    stg:'linear-gradient(90deg,#84070f,#e74c3c,#f39c12,#84070f)',
    sealBg:'#fff0f0',
  },
  Degree: {
    hg:'linear-gradient(135deg,#064E3B 0%,#065F46 55%,#059669 100%)',
    ac:'#059669', nc:'#064E3B', th:'#065F46',
    vb:'#ECFDF5', vc:'#065F46', vbr:'#A7F3D0',
    stg:'linear-gradient(90deg,#065F46,#059669,#D97706,#065F46)',
    sealBg:'#f0fdf4',
  },
  Honours: {
    hg:'linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 55%,#3b82f6 100%)',
    ac:'#3b82f6', nc:'#1e3a8a', th:'#1d4ed8',
    vb:'#eff6ff', vc:'#1e3a8a', vbr:'#bfdbfe',
    stg:'linear-gradient(90deg,#1d4ed8,#3b82f6,#60a5fa,#1d4ed8)',
    sealBg:'#f0f7ff',
  },
};
const getT = p => THEMES[p] || THEMES.Degree;
const safeFile = v => (v||'').toString().replace(/\s+/g,'_').replace(/[^\w.-]/g,'');

// ─────────────────────────────────────────────────────────
//  GRADE CALCULATION  (Bangladesh National University)
// ─────────────────────────────────────────────────────────
const calcGrade = (obtained, fullMarks, passMarks) => {
  const obt = parseInt(obtained, 10);
  const fm  = parseInt(fullMarks, 10)  || 100;
  const pm  = parseInt(passMarks,  10) || 33;
  if (isNaN(obt) || obtained === '' || obtained === null || obtained === undefined)
    return { grade:'—', lgrade:'—', gpa:0, status:'absent', pct:0 };
  if (obt < pm)
    return { grade:'F', lgrade:'F (Fail)', gpa:0, status:'fail', pct:((obt/fm)*100).toFixed(1) };
  const pct = (obt/fm)*100;
  if (pct >= 80) return { grade:'A+', lgrade:'A+ (Excellent)', gpa:5.0, status:'pass', pct:pct.toFixed(1) };
  if (pct >= 70) return { grade:'A',  lgrade:'A (Very Good)',  gpa:4.0, status:'pass', pct:pct.toFixed(1) };
  if (pct >= 60) return { grade:'A-', lgrade:'A- (Good)',      gpa:3.5, status:'pass', pct:pct.toFixed(1) };
  if (pct >= 50) return { grade:'B',  lgrade:'B (Satisfactory)', gpa:3.0, status:'pass', pct:pct.toFixed(1) };
  if (pct >= 40) return { grade:'C',  lgrade:'C (Average)',    gpa:2.0, status:'pass', pct:pct.toFixed(1) };
  return             { grade:'D',  lgrade:'D (Below Average)', gpa:1.0, status:'pass', pct:pct.toFixed(1) };
};

const computeTotal = (subjects, marks) => {
  let totalObt = 0, totalFull = 0, totalGPA = 0, subCount = 0, hasFail = false;
  for (const sub of subjects) {
    const obt = marks?.[sub.code];
    if (obt === '' || obt === null || obt === undefined) continue;
    const { gpa, status } = calcGrade(obt, sub.fullMarks, sub.passMarks);
    totalObt  += parseInt(obt, 10) || 0;
    totalFull += parseInt(sub.fullMarks, 10) || 100;
    totalGPA  += gpa;
    subCount++;
    if (status === 'fail') hasFail = true;
  }
  const gpa = subCount > 0 ? (totalGPA / subCount).toFixed(2) : '0.00';
  const pct = totalFull > 0 ? ((totalObt/totalFull)*100).toFixed(2) : '0.00';
  const result = subCount === 0 ? 'NOT ENTERED'
    : hasFail ? 'FAIL'
    : subCount < subjects.length ? 'INCOMPLETE'
    : 'PASS';
  const division = !hasFail && subCount > 0
    ? parseFloat(gpa) >= 4.5 ? 'First Division (Topper)'
    : parseFloat(gpa) >= 3.0 ? 'First Division'
    : parseFloat(gpa) >= 2.25 ? 'Second Division'
    : 'Third Division'
    : '—';
  return { totalObt, totalFull, gpa, pct, result, division, subCount };
};
// ─────────────────────────────────────────────────────────
//  EXCEL EXPORT — CLASS MARK SHEET (3 sheets)
// ─────────────────────────────────────────────────────────
const exportClassExcel = async ({ students, subjects, studentMarks, examConfig, program, className, section, toast }) => {
  try {
    let XLSX;
    try { XLSX = await import('xlsx'); }
    catch { toast.error('xlsx not found. Run: npm install xlsx'); return false; }

    const sorted = [...students].sort((a, b) => {
      const ra = parseInt(a.rollNumber, 10) || 0, rb = parseInt(b.rollNumber, 10) || 0;
      return ra !== rb ? ra - rb : (a.userId?.name || '').localeCompare(b.userId?.name || '');
    });

    const rows = sorted.map((s, idx) => {
      const marks = studentMarks[s._id] || {}, total = computeTotal(subjects, marks);
      const row = {
        'Serial': idx + 1, 'Roll No.': s.rollNumber || '—',
        'Reg. No.': s.registrationNumber || s.studentId || '—',
        'Student Name': s.userId?.name || '—',
        'Class': s.class?.name || (typeof s.class === 'string' ? s.class : '') || '—',
        'Section': s.section || '—',
      };
      subjects.forEach(sub => {
        const obt = marks[sub.code];
        const { grade, status } = calcGrade(obt, sub.fullMarks, sub.passMarks);
        row[`${sub.name} (${sub.code})`] = (obt !== '' && obt != null) ? parseInt(obt, 10) || 0 : 'Absent';
        row[`${sub.name} Grade`] = (obt !== '' && obt != null) ? grade : '—';
      });
      row['Total Obtained'] = total.totalObt;
      row['Total Full'] = total.totalFull;
      row['Percentage'] = `${total.pct}%`;
      row['GPA'] = total.gpa;
      row['Division'] = total.division;
      row['Result'] = total.result;
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 8 }, { wch: 10 }, { wch: 16 }, { wch: 26 }, { wch: 14 }, { wch: 10 },
      ...subjects.flatMap(() => [{ wch: 22 }, { wch: 10 }]),
      { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 8 }, { wch: 24 }, { wch: 12 },
    ];
    ws['!freeze'] = { xSplit: 4, ySplit: 1 };

    const wb = XLSX.utils.book_new();
    wb.Props = { Title: `${className || 'Class'} — ${examConfig.name || 'Result'}`, Author: COLLEGE.nameEn, CreatedDate: new Date() };
    XLSX.utils.book_append_sheet(wb, ws, 'Mark Sheet');

    // Summary sheet
    const passCount = sorted.filter(s => computeTotal(subjects, studentMarks[s._id] || {}).result === 'PASS').length;
    const failCount = sorted.filter(s => computeTotal(subjects, studentMarks[s._id] || {}).result === 'FAIL').length;
    const avgGPA = sorted.length > 0
      ? (sorted.reduce((acc, s) => acc + parseFloat(computeTotal(subjects, studentMarks[s._id] || {}).gpa || 0), 0) / sorted.length).toFixed(2)
      : '0.00';
    const sumRows = [
      { Field: 'College', Value: COLLEGE.nameEn }, { Field: 'Program', Value: program || '—' },
      { Field: 'Class', Value: className || '—' }, { Field: 'Section', Value: section || 'All' },
      { Field: 'Exam', Value: examConfig.name || '—' }, { Field: 'Year', Value: examConfig.year || '—' },
      { Field: 'Session', Value: examConfig.session || '—' }, { Field: '', Value: '' },
      { Field: 'Total Students', Value: sorted.length }, { Field: 'PASS', Value: passCount },
      { Field: 'FAIL', Value: failCount },
      { Field: 'Pass Rate', Value: sorted.length > 0 ? `${((passCount / sorted.length) * 100).toFixed(1)}%` : '—' },
      { Field: 'Class Avg. GPA', Value: avgGPA }, { Field: '', Value: '' },
      { Field: 'Generated On', Value: new Date().toLocaleString('en-GB') },
    ];
    const wsSumm = XLSX.utils.json_to_sheet(sumRows);
    wsSumm['!cols'] = [{ wch: 20 }, { wch: 36 }];
    XLSX.utils.book_append_sheet(wb, wsSumm, 'Summary');

    // Subject Analysis sheet
    const subRows = subjects.map(sub => {
      let passed = 0, failed = 0, absent = 0, totalObt = 0, count = 0;
      sorted.forEach(s => {
        const obt = (studentMarks[s._id] || {})[sub.code];
        if (obt === '' || obt === null || obt === undefined) { absent++; return; }
        const { status } = calcGrade(obt, sub.fullMarks, sub.passMarks);
        totalObt += parseInt(obt, 10) || 0; count++;
        if (status === 'pass') passed++; else failed++;
      });
      return {
        'Subject Code': sub.code, 'Subject Name': sub.name,
        'Full Marks': sub.fullMarks, 'Pass Marks': sub.passMarks,
        'Appeared': count, 'Passed': passed, 'Failed': failed, 'Absent': absent,
        'Avg. Marks': count > 0 ? (totalObt / count).toFixed(1) : '—',
        'Pass Rate': count > 0 ? `${((passed / count) * 100).toFixed(1)}%` : '—',
      };
    });
    const wsSub = XLSX.utils.json_to_sheet(subRows);
    wsSub['!cols'] = [{ wch: 14 }, { wch: 26 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsSub, 'Subject Analysis');

    const fileName = [safeFile(className || 'Class'), safeFile(section || 'AllSec'), safeFile(program || ''), safeFile(examConfig.year || new Date().getFullYear()), 'MarkSheet'].join('_') + '.xlsx';
    XLSX.writeFile(wb, fileName);
    return fileName;
  } catch (err) { console.error('Excel error:', err); throw err; }
};

// ─────────────────────────────────────────────────────────
//  EXCEL EXPORT — INDIVIDUAL STUDENT MARK SHEET
// ─────────────────────────────────────────────────────────
const exportStudentExcel = async ({ student, subjects, marks, examConfig, program, toast }) => {
  try {
    let XLSX;
    try { XLSX = await import('xlsx'); }
    catch { toast.error('xlsx not found. Run: npm install xlsx'); return false; }

    const total = computeTotal(subjects, marks);
    const subRows = subjects.map((sub, i) => {
      const obt = marks?.[sub.code];
      const { grade, gpa, status } = calcGrade(obt, sub.fullMarks, sub.passMarks);
      return {
        'S.No': i + 1, 'Subject Code': sub.code || '—', 'Subject Name': sub.name || '—',
        'Full Marks': sub.fullMarks || 100, 'Pass Marks': sub.passMarks || 33,
        'Marks Obtained': status === 'absent' ? 'Absent' : (obt !== '' && obt != null ? parseInt(obt, 10) || 0 : '—'),
        'Grade': grade, 'Grade Point': status === 'absent' ? '—' : gpa.toFixed(1),
        'Remarks': status === 'fail' ? 'FAIL' : status === 'absent' ? 'Absent' : 'Pass',
      };
    });
    subRows.push({
      'S.No': '—', 'Subject Code': '—', 'Subject Name': 'GRAND TOTAL',
      'Full Marks': total.totalFull, 'Pass Marks': '—',
      'Marks Obtained': total.totalObt, 'Grade': '—', 'Grade Point': total.gpa, 'Remarks': total.result,
    });

    const wb = XLSX.utils.book_new();
    wb.Props = { Title: `Mark Sheet — ${student.userId?.name || ''}`, Author: COLLEGE.nameEn, CreatedDate: new Date() };

    const infoRows = [
      { Field: 'RESULT MARK SHEET', Value: COLLEGE.nameEn },
      { Field: '', Value: '' },
      { Field: 'Name', Value: student.userId?.name || '—' },
      { Field: 'Roll No.', Value: student.rollNumber || '—' },
      { Field: 'Registration', Value: student.registrationNumber || student.studentId || '—' },
      { Field: 'Class', Value: student.class?.name || (typeof student.class === 'string' ? student.class : '') || '—' },
      { Field: 'Section', Value: student.section || '—' },
      { Field: 'Session', Value: examConfig.session || student.session || '—' },
      { Field: 'Exam', Value: examConfig.name || '—' },
      { Field: 'Year', Value: examConfig.year || '—' },
      { Field: 'Program', Value: program || '—' },
      { Field: '', Value: '' },
      { Field: 'Result', Value: total.result },
      { Field: 'Division', Value: total.division },
      { Field: 'Total Marks', Value: `${total.totalObt} / ${total.totalFull}` },
      { Field: 'Percentage', Value: `${total.pct}%` },
      { Field: 'GPA', Value: `${total.gpa} / 5.00` },
      { Field: '', Value: '' },
      { Field: 'Generated', Value: new Date().toLocaleDateString('en-GB') },
    ];
    const wsInfo = XLSX.utils.json_to_sheet(infoRows);
    wsInfo['!cols'] = [{ wch: 16 }, { wch: 36 }];
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Student Info');

    const wsMark = XLSX.utils.json_to_sheet(subRows);
    wsMark['!cols'] = [{ wch: 7 }, { wch: 14 }, { wch: 28 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 9 }, { wch: 13 }, { wch: 12 }];
    wsMark['!freeze'] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(wb, wsMark, 'Mark Sheet');

    const fileName = `MarkSheet_${safeFile(student.userId?.name || '')}_Roll${safeFile(student.rollNumber || '')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    return fileName;
  } catch (err) { console.error('Student Excel error:', err); throw err; }
};



// ─────────────────────────────────────────────────────────
//  RESULT CARD COMPONENT  (794px wide = A4)
// ─────────────────────────────────────────────────────────
export const ResultCard = React.memo(({ student, logoUrl, signUrl, examConfig, subjects, marks, program, settings, srNo }) => {
  const t = getT(program);
  const name       = student.userId?.name || '—';
  const rollNo     = student.rollNumber || '—';
  const regNo      = student.registrationNumber || student.studentId || '—';
  const cls        = student.class?.name || (typeof student.class==='string'?student.class:'') || '—';
  const section    = student.section || '';
  const session    = examConfig.session || student.session || '—';
  const fatherName = student.fatherName || student.guardianName || '—';
  const motherName = student.motherName || '—';
  const total      = computeTotal(subjects, marks);

  return (
    <div className="result-card">  

      {/* ── COLLEGE SEAL + NAME ── */}
      <div className="rc-college-header">
        <div className="rc-seal-wrap">
          {logoUrl
            ? <img src={logoUrl} alt="logo" crossOrigin="anonymous" className="rc-seal-img"
                onError={e=>{e.target.style.display='none';}} />
            : <div className="rc-seal-fb" style={{ borderColor: t.ac, color: t.nc }}>
                <span>{COLLEGE.nameBn[0]}</span>
              </div>
          }
        </div>
        <div className="rc-college-text">
          <p className="rc-cname" style={{ color: t.nc }}>𝖬𝖠𝖫𝖪𝖧𝖠𝖭𝖠𝖦𝖠𝖱 𝖢𝖮𝖫𝖫𝖤𝖦𝖤</p>
          <div className="rc-caddr">{COLLEGE.address} &nbsp;|&nbsp; EIIN: {COLLEGE.eiin}</div>
        </div>
      </div>

      {/* ── STRIPE ── */}
      
      {/* <div className="rc-sign-row" style={{ borderTopColor: t.ac+'55' }} /> */}

      {/* ── RESULT TITLE ── */}
      <div className="rc-title-block">
        {/* <p className="rc-main-title">RESULT-cum-MARKS CERTIFICATE</p> */}
        <p className="rc-sub-title" style={{ color: t.nc }}>
          {program === 'HSC'     ? 'HSC PASS COURSE'
           : program === 'Degree'   ? 'DEGREE PASS COURSE'
           : 'HONOURS PASS COURSE'}
        </p>
        <p className="rc-exam-detail">
          {examConfig.name || 'Annual Examination'} &nbsp;·&nbsp; {examConfig.year || new Date().getFullYear()}
        </p>
      </div>

      {/* ── STUDENT INFO ── */}
      <div className="rc-student-info">
        {[
          ['Name',           name],
          ["Father's Name",  fatherName],
          
          ['Class / Course', `${cls}${section?' — '+section:''}`],
          ['Roll No.',       rollNo],
          ['Session',        session],
        ].map(([l,v])=>(
          <div key={l} className="rc-si-row">
            <span className="rc-si-label">{l}</span>
            <span className="rc-si-sep">:</span>
            <span className="rc-si-val">{v}</span>
          </div>
        ))}
        
      </div>
      

      {/* ── MARKS TABLE ── */}
      <div className="rc-table-wrap">
        <table className="rc-marks-table">
          <thead>
            <tr style={{ background: t.th }}>
              <th className="rc-th rc-th-sno">S.No</th>
              <th className="rc-th rc-th-code">Code</th>
              <th className="rc-th rc-th-subject">Subject / Paper</th>
              <th className="rc-th rc-th-full">Full Marks</th>
              <th className="rc-th rc-th-pass">Pass Marks</th>
              <th className="rc-th rc-th-obt">Marks Obtained</th>
              <th className="rc-th rc-th-grade">Grade</th>
              <th className="rc-th rc-th-gpa">Grade Point</th>
              <th className="rc-th rc-th-rmk">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan={9} className="rc-no-sub">No subjects configured</td>
              </tr>
            ) : subjects.map((sub, i) => {
              const obt = marks?.[sub.code];
              const { grade, gpa, status } = calcGrade(obt, sub.fullMarks, sub.passMarks);
              const isFail = status === 'fail';
              const isAbsent = status === 'absent';
              return (
                <tr key={i} className={i%2===0 ? 'rc-tr-even' : 'rc-tr-odd'}>
                  <td className="rc-td rc-td-c">{i+1}</td>
                  <td className="rc-td rc-td-c rc-mono">{sub.code||'—'}</td>
                  <td className="rc-td">{sub.name||'—'}</td>
                  <td className="rc-td rc-td-c">{sub.fullMarks||'100'}</td>
                  <td className="rc-td rc-td-c">{sub.passMarks||'33'}</td>
                  <td className={`rc-td rc-td-c rc-obt-cell${isFail?' rc-fail':isAbsent?' rc-absent':''}`}>
                    {isAbsent ? 'Absent' : (obt !== '' && obt !== null && obt !== undefined ? obt : '—')}
                  </td>
                  <td className={`rc-td rc-td-c rc-grade-cell${isFail?' rc-fail-grade':status==='pass'?' rc-pass-grade':''}`}>
                    {grade}
                  </td>
                  <td className="rc-td rc-td-c">{isAbsent ? '—' : gpa.toFixed(1)}</td>
                  <td className={`rc-td rc-td-c${isFail?' rc-fail-rmk':''}`}>
                    {isFail ? 'FAIL' : isAbsent ? 'Absent' : 'Pass'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="rc-total-row" style={{ background: t.th+'18', borderTop:`2px solid ${t.ac}` }}>
              <td className="rc-td" colSpan={3} style={{ fontWeight:800, color:t.nc, textAlign:'right' }}>Grand Total</td>
              <td className="rc-td rc-td-c" style={{ fontWeight:800 }}>{total.totalFull}</td>
              <td className="rc-td" />
              <td className="rc-td rc-td-c" style={{ fontWeight:900, color:t.nc, fontSize:14 }}>{total.totalObt}</td>
              <td className="rc-td" colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── RESULT SUMMARY ── */}
      <div className="rc-summary">
        <div className="rc-summary-left">
          <div className="rc-result-row">
            <span className="rc-rl">Result</span>
            <span className="rc-rsep">:</span>
            <span className={`rc-result-badge${total.result==='PASS'?' pass':total.result==='FAIL'?' fail':' pending'}`}>
              {total.result}
            </span>
          </div>
          <div className="rc-result-row">
            <span className="rc-rl">Division</span>
            <span className="rc-rsep">:</span>
            <span className="rc-rv">{total.division}</span>
          </div>
          <div className="rc-result-row">
            <span className="rc-rl">Percentage</span>
            <span className="rc-rsep">:</span>
            <span className="rc-rv">{total.pct}%</span>
          </div>
          <div className="rc-result-row">
            <span className="rc-rl">GPA (Grade Point Avg.)</span>
            <span className="rc-rsep">:</span>
            <span className="rc-rv rc-gpa-val" style={{ color:t.nc }}>{total.gpa} / 5.00</span>
          </div>
        </div>

        {/* Grade legend */}
        <div className="rc-grade-legend">
          <p className="rc-legend-title">Grade</p>
          {[
            ['A+','80-100','5.00'],['A','70-79','4.00'],['A-','60-69','3.50'],
            ['B','50-59','3.00'],['C','40-49','2.00'],['D','33-39','1.00'],['F','<33','0.00'],
          ].map(([g,r,gp])=>(
            <div key={g} className="rc-legend-row">
              <span className="rc-leg-grade" style={g==='F'?{color:'#dc2626'}:{color:t.nc}}>{g}</span>
              <span className="rc-leg-range">{r}</span>
              <span className="rc-leg-gp">GPA: {gp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── REMARKS ── */}
      

      {/* ── SIGNATURE ROW ── */}
      <div className="rc-sign-row" style={{ borderTopColor: t.ac+'55' }}>
        {/* <div className="rc-sign-block">
          <div className="rc-sign-blank" />
          <div className="rc-sign-rule" style={{ background: t.ac }} />
          <p className="rc-sign-label">Class Teacher</p>
        </div> */}
        <div className="rc-sign-block">
          <div className="rc-sign-blank" />
          <div className="rc-sign-rule" style={{ background: t.ac }} />
          <p className="rc-sign-label">Executor</p>
        </div>
        <div className="rc-sign-block">
          {signUrl
            ? <img src={signUrl} alt="sign" className="rc-sign-img" />
            : <div className="rc-sign-blank" />
          }
          <div className="rc-sign-rule" style={{ background: t.ac }} />
          <p className="rc-sign-label">Principal</p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="rc-footer" style={{ background: t.hg }}>
        <p className="rc-footer-text">
          {COLLEGE.nameEn} &nbsp;|
          ☎ {COLLEGE.phone} &nbsp;|&nbsp; {COLLEGE.email}
        </p>
      </div>
      
    </div>
  );
});

// ─────────────────────────────────────────────────────────
//  PROGRESS OVERLAY
// ─────────────────────────────────────────────────────────
const ProgressOverlay = ({ progress, current, total }) => (
  <div className="rcg-pg-overlay">
    <div className="rcg-pg-box">
      <svg viewBox="0 0 80 80" width="76" height="76">
        <circle cx="40" cy="40" r="32" fill="none" stroke="#E5E7EB" strokeWidth="7"/>
        <circle cx="40" cy="40" r="32" fill="none" stroke="#059669" strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${2*Math.PI*32}`}
          strokeDashoffset={`${2*Math.PI*32*(1-progress/100)}`}
          transform="rotate(-90 40 40)"
          style={{transition:'stroke-dashoffset .3s'}}/>
        <text x="40" y="45" textAnchor="middle" fontSize="13" fontWeight="800" fill="#065F46">{progress}%</text>
      </svg>
      <p className="rcg-pg-title">Generating PDF…</p>
      <p className="rcg-pg-sub">{current} of {total}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
//  PANEL
// ─────────────────────────────────────────────────────────
const Panel = ({ title, icon, children, badge, defaultOpen=true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rcg-panel">
      <button className="rcg-panel-head" onClick={()=>setOpen(o=>!o)}>
        <span className="rcg-panel-hl">{icon}{title}
          {badge!=null && <span className="rcg-panel-badge">{badge}</span>}
        </span>
        {open ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
      </button>
      {open && <div className="rcg-panel-body">{children}</div>}
    </section>
  );
};

// ─────────────────────────────────────────────────────────
//  PROGRAM SELECTOR
// ─────────────────────────────────────────────────────────
const ProgramSelector = ({ value, onChange }) => (
  <div className="rcg-prog-sel">
    {[
      {k:'HSC',    label:'HSC',     color:'#84070f'},
      {k:'Degree', label:'Degree',  color:'#065F46'},
      {k:'Honours',label:'Honours', color:'#1d4ed8'},
    ].map(o=>(
      <button key={o.k}
        className={`rcg-prog-btn${value===o.k?' on':''}`}
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
    <div className="rcg-upfield">
      <div className="rcg-uplbl">{label}
        {val && <span className="rcg-upok"><CheckCircle size={10}/> Set</span>}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{display:'none'}} onChange={onChange}/>
      <div style={{display:'flex',gap:6}}>
        <button className="rcg-upbtn" onClick={()=>ref.current?.click()}>
          <Upload size={11}/>{val?'Change':'Upload'}
        </button>
        {val && <button className="rcg-updel" onClick={onRm}><X size={11}/></button>}
      </div>
      {val && <div className="rcg-upthumb-wrap">
        <img src={val} alt="" className={`rcg-upthumb${isSig?' sig':''}`}/>
      </div>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  MARKS ENTRY FORM (inline per student)
// ─────────────────────────────────────────────────────────
const MarksEntryForm = ({ student, subjects, marks, onSave, onExcelDl, theme }) => {
  const [local, setLocal] = useState({ ...marks });

  const update = (code, val) => setLocal(p => ({ ...p, [code]: val }));
  const total  = computeTotal(subjects, local);

  return (
    <div className="marks-form">
      <div className="marks-form-header" style={{ borderColor: theme.ac }}>
        <BarChart2 size={14} style={{ color: theme.nc }} />
        <span style={{ color: theme.nc }}>Enter Marks — {student.userId?.name}</span>
        <span className="marks-form-roll">Roll: {student.rollNumber || '—'}</span>
      </div>
      <div className="marks-subjects-grid">
        {subjects.map((sub, i) => {
          const val = local[sub.code];
          const { grade, status } = calcGrade(val, sub.fullMarks, sub.passMarks);
          return (
            <div key={i} className={`marks-sub-row${status==='fail'?' fail-row':''}`}>
              <div className="marks-sub-info">
                <span className="marks-sub-code">{sub.code}</span>
                <span className="marks-sub-name">{sub.name}</span>
                <span className="marks-sub-max">/{sub.fullMarks||100}</span>
              </div>
              <div className="marks-sub-input-wrap">
                <input
                  className={`marks-inp${status==='fail'?' marks-inp-fail':status==='pass'?' marks-inp-pass':''}`}
                  type="number" min="0" max={sub.fullMarks||100}
                  placeholder="Marks"
                  value={val !== undefined && val !== null ? val : ''}
                  onChange={e => update(sub.code, e.target.value)}
                />
                {val !== undefined && val !== null && val !== '' && (
                  <span className={`marks-grade-chip${status==='fail'?' fail':''}`}
                    style={status==='pass'?{background:theme.vb,color:theme.nc}:{}}>
                    {grade}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="marks-form-footer">
        <div className="marks-totals">
          <span>Total: <strong>{total.totalObt}/{total.totalFull}</strong></span>
          <span>PCT: <strong>{total.pct}%</strong></span>
          <span>GPA: <strong style={{ color: theme.nc }}>{total.gpa}</strong></span>
          <span className={`marks-result${total.result==='PASS'?' pass':total.result==='FAIL'?' fail':''}`}>
            {total.result}
          </span>
        </div>
        <div className="marks-footer-btns">
          <button className="marks-excel-btn" onClick={()=>onExcelDl(student, local)} title="Download Excel mark sheet">
            <FileSpreadsheet size={13}/> Excel
          </button>
          <button className="marks-save-btn" style={{ background: theme.hg }}
            onClick={() => onSave(student._id, local)}>
            <Save size={13}/> Save Marks
          </button>
        </div>
      </div>
    </div>
  );
};

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

  const [examConfig, setExamConfig] = useState({
    name   : 'Annual Examination 2025',
    year   : '2025',
    session: '2024-2025',
  });

  const [subjects, setSubjects] = useState([
    { code:'BAN',  name:'Bangla',   fullMarks:'100', passMarks:'33' },
    { code:'ENG',  name:'English',  fullMarks:'100', passMarks:'33' },
    { code:'MAT',  name:'Mathematics', fullMarks:'100', passMarks:'33' },
    { code:'ICT',  name:'ICT',      fullMarks:'100', passMarks:'33' },
  ]);

  // Marks: { [studentId]: { [subjectCode]: value } }
  const [studentMarks, setStudentMarks] = useState({});

  const [fCls,    setFCls]    = useState('');
  const [fSec,    setFSec]    = useState('');
  const [q,       setQ]       = useState('');
  const [fResult, setFResult] = useState('');

  const [sel,      setSel]      = useState(new Set());
  const [prevId,   setPrevId]   = useState(null);
  const [marksId,  setMarksId]  = useState(null);  // which student has marks form open

  const [initLoad, setInitLoad] = useState(true);
  const [stuLoad,  setStuLoad]  = useState(false);
  const [genning,  setGenning]  = useState(false);
  const [genPct,   setGenPct]   = useState(0);
  const [genCur,   setGenCur]   = useState(0);
  const [genTot,   setGenTot]   = useState(0);
  const [sideOpen,     setSideOpen]     = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [dbSaving, setDbSaving] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());

  const currentClassName = useMemo(()=>{
    const sc = classes.find(c=>c._id===fCls||c.name===fCls);
    return sc?.name||fCls||'';
  },[classes,fCls]);

  const theme = getT(program);

  const filtered = useMemo(()=>{
    const ql = q.toLowerCase();
    return all.filter(s => {
      const cls = s.class?.name||(typeof s.class==='string'?s.class:'')||'';
      const nm  = s.userId?.name||'';
      const tot = computeTotal(subjects, studentMarks[s._id]);
      return (
        (!fCls    || cls===fCls) &&
        (!fSec    || s.section===fSec) &&
        (!ql      || nm.toLowerCase().includes(ql) || (s.rollNumber||'').toString().includes(ql)) &&
        (!fResult || (fResult==='pass' && tot.result==='PASS') ||
                     (fResult==='fail' && tot.result==='FAIL') ||
                     (fResult==='pending' && (tot.result==='NOT ENTERED'||tot.result==='INCOMPLETE')))
      );
    });
  },[all,fCls,fSec,q,fResult,studentMarks,subjects]);

  const selList = useMemo(()=>all.filter(s=>sel.has(s._id)),[all,sel]);
  const allSel  = filtered.length>0 && filtered.every(s=>sel.has(s._id));
  const uniCls  = useMemo(()=>[...new Map(classes.map(c=>[c.name,c])).values()],[classes]);

  const marksCount = useMemo(()=>{
    let filled=0, total=all.length;
    for(const s of all){
      const m = studentMarks[s._id];
      if(m && subjects.some(sub=>m[sub.code]!==undefined&&m[sub.code]!=='')) filled++;
    }
    return {filled,total};
  },[all,studentMarks,subjects]);

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
    setStuLoad(true); setSel(new Set()); setPrevId(null); setMarksId(null);
    try{
      const p = {};
      const sc = classes.find(c=>c._id===fCls||c.name===fCls);
      if(sc)   p.class   = sc.name;
      if(fSec) p.section = fSec;
      const res  = await studentService.getAllStudents(p);
      const list = res?.data||res?.students||(Array.isArray(res)?res:[]);
      setAll(list);
      // preserve existing marks on reload
      toast[list.length?'success':'error'](list.length?`${list.length} students loaded`:'No students found');
      if(list.length) setSideOpen(false);
    }catch{ toast.error('Failed to load students'); }
    finally{ setStuLoad(false); }
  },[classes,fCls,fSec]);

  const toggleOne = useCallback(id=>{
    setSel(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  },[]);

  const toggleAll = ()=>{
    const ids = filtered.map(s=>s._id);
    setSel(p=>{ const n=new Set(p); if(allSel) ids.forEach(id=>n.delete(id)); else ids.forEach(id=>n.add(id)); return n; });
  };

  const togglePrev  = id => { setPrevId(p=>p===id?null:id); setMarksId(null); };
  const toggleMarks = id => { setMarksId(p=>p===id?null:id); setPrevId(null); };

  const saveMarks = async (sid, marksData) => {
    // ── 1. Instant local save ─────────────────────────────────
    setStudentMarks(p => ({ ...p, [sid]: marksData }));
    setMarksId(null);

    // ── 2. Find student ──────────────────────────────────────
    const student = all.find(s => s._id === sid);
    if (!student) {
      toast.success('Marks saved locally (student not found for DB sync)');
      return;
    }

    // ── 3. Build payload matching backend schema ──────────────
    // Student.class is a String in this project (not ObjectId)
    const studentClassName = typeof student.class === 'string'
      ? student.class
      : (student.class?.name || currentClassName || '');

    const subjectMarks = subjects.map(sub => {
      const raw = marksData[sub.code];
      // marksObtained must be Number or null — never string/undefined
      let obtained = null;
      if (raw !== undefined && raw !== null && raw !== '') {
        const parsed = parseInt(raw, 10);
        obtained = isNaN(parsed) ? null : parsed;
      }
      return {
        code         : String(sub.code  || '').trim(),
        name         : String(sub.name  || '').trim(),
        fullMarks    : parseInt(sub.fullMarks,  10) || 100,
        passMarks    : parseInt(sub.passMarks,  10) || 33,
        marksObtained: obtained,
      };
    });

    const payload = {
      studentId  : sid,
      examName   : String(examConfig.name    || 'Annual Examination').trim(),
      examYear   : String(examConfig.year    || new Date().getFullYear()).trim(),
      session    : String(examConfig.session || '').trim(),
      program    : program || 'Degree',
      className  : studentClassName.trim(),
      section    : String(student.section || fSec || '').trim(),
      subjects   : subjectMarks,
      isPublished: false,
    };

    // ── 4. Send to backend ───────────────────────────────────
    try {
      await markService.saveMarks(payload);
      setSavedIds(p => new Set([...p, sid]));
      toast.success('✅ Marks saved to database!');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Unknown error';
      console.error('[saveMarks] Backend error:', msg, '| Payload:', payload);
      toast.error(`Saved locally. DB error: ${msg}`);
    }
  };

  const setExam = (k,v) => setExamConfig(p=>({...p,[k]:v}));

  const addSubject    = ()    => setSubjects(p=>[...p,{code:'',name:'',fullMarks:'100',passMarks:'33'}]);
  const removeSubject = i     => setSubjects(p=>p.filter((_,idx)=>idx!==i));
  const updateSubject = (i,f,v) => setSubjects(p=>p.map((s,idx)=>idx===i?{...s,[f]:v}:s));

  const captureEl = async id => {
    const h2c = (await import('html2canvas')).default;
    const el  = document.getElementById(id);
    if(!el) return null;
    el.style.left='0px'; el.style.top='0px'; el.style.zIndex='9998';
    await new Promise(r=>setTimeout(r,120));
    const canvas = await h2c(el,{
      scale:2, useCORS:true, allowTaint:true,
      backgroundColor:'#fff', logging:false,
      width:el.offsetWidth, height:el.offsetHeight,
    });
    el.style.left='-9999px'; el.style.top='-9999px'; el.style.zIndex='-1';
    return canvas;
  };

  const dlOne = async (student, idx) => {
    try{
      const {jsPDF} = await import('jspdf');
      const canvas  = await captureEl(`rc-pdf-${student._id}`);
      if(!canvas){ toast.error('Render failed'); return; }
      const pdf  = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
      const imgW = 210;
      const imgH = Math.round((canvas.height/canvas.width)*210);
      pdf.addImage(canvas.toDataURL('image/jpeg',.95),'JPEG',0,0,imgW,Math.min(imgH,297));
      pdf.save(`Result_${safeFile(student.userId?.name||'')}_Roll${safeFile(student.rollNumber||student.studentId||'')}.pdf`);
    }catch(err){ console.error(err); toast.error('PDF error'); }
  };

  const handleDlAll = async () => {
    if(!selList.length){ toast.error('Select at least one student'); return; }
    setGenning(true); setGenPct(0); setGenCur(0); setGenTot(selList.length);
    for(let i=0;i<selList.length;i++){
      setGenCur(i+1);
      setGenPct(Math.round(((i+1)/selList.length)*100));
      await dlOne(selList[i], i);
      await new Promise(r=>setTimeout(r,320));
    }
    setGenning(false);
    toast.success(`✅ ${selList.length} Result Cards downloaded!`);
  };

  // Select all who have PASS result
  const selectPassed = () => {
    const ids = filtered
      .filter(s => computeTotal(subjects, studentMarks[s._id]).result === 'PASS')
      .map(s=>s._id);
    setSel(new Set(ids));
  };

  // Class Excel export
  const handleClassExcel = async () => {
    const studentsToExport = filtered.length > 0 ? filtered : all;
    if (!studentsToExport.length) { toast.error('No students loaded'); return; }
    setExcelLoading(true);
    try {
      const fn = await exportClassExcel({
        students: studentsToExport, subjects, studentMarks, examConfig,
        program, className: currentClassName, section: fSec, toast,
      });
      if (fn) toast.success(`✅ Excel saved: ${fn}`);
    } catch (err) { console.error(err); toast.error('Excel export failed'); }
    finally { setExcelLoading(false); }
  };

  const handleStudentExcel = async (student, marksOverride) => {
    try {
      const fn = await exportStudentExcel({
        student, subjects, marks: marksOverride || studentMarks[student._id] || {},
        examConfig, program, toast,
      });
      if (fn) toast.success(`✅ Mark sheet: ${fn}`);
    } catch (err) { console.error(err); toast.error('Excel failed'); }
  };


  // ── Save student marks to backend ──
  const saveStudentToBackend = async (student, marksData) => {
    try {
      const subjectMarks = subjects.map(sub => ({
        code: sub.code, name: sub.name,
        fullMarks: parseInt(sub.fullMarks, 10) || 100,
        passMarks: parseInt(sub.passMarks, 10) || 33,
        marksObtained: (marksData[sub.code] !== undefined && marksData[sub.code] !== '')
          ? parseInt(marksData[sub.code], 10) : null,
      }));
      await markService.saveMarks({
        studentId: student._id,
        examName: examConfig.name || 'Annual Examination',
        examYear: examConfig.year || String(new Date().getFullYear()),
        session: examConfig.session || '',
        program,
        className: student.class?.name || (typeof student.class==='string'?student.class:'') || currentClassName,
        section: student.section || fSec || '',
        subjects: subjectMarks,
        isPublished: false,
      });
      setSavedIds(p => new Set([...p, student._id]));
      return true;
    } catch (err) { console.error('Save to DB error:', err); return false; }
  };

  const handleSaveAllToDb = async () => {
    const withMarks = all.filter(s => {
      const m = studentMarks[s._id];
      return m && subjects.some(sub => m[sub.code] !== undefined && m[sub.code] !== '');
    });
    if (!withMarks.length) { toast.error('কোনো marks enter করা হয়নি'); return; }

    setDbSaving(true);
    let saved = 0;
    for (const student of withMarks) {
      try {
        await saveMarks(student._id, studentMarks[student._id] || {});
        saved++;
      } catch (_) {}
    }
    setDbSaving(false);
    toast.success(`✅ ${saved} জন শিক্ষার্থীর marks সংরক্ষিত!`);
  };

  // ─────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="rcg-root">
      {genning && <ProgressOverlay progress={genPct} current={genCur} total={genTot}/>}

      {/* TOP BAR */}
      <header className="rcg-topbar">
        <div className="rcg-topbar-l">
          <button className="rcg-btn-back" onClick={()=>navigate('/dashboard/students')}>
            <ArrowLeft size={15}/><span>Students</span>
          </button>
          <div className="rcg-page-heading">
            <div className="rcg-heading-icon" style={{background:theme.hg}}><Award size={17}/></div>
            <div>
              <h1 className="rcg-heading-title">Result Card Generator</h1>
            </div>
          </div>
          {program && <span className="rcg-prog-badge" style={{background:theme.vb,color:theme.vc,borderColor:theme.vbr}}>{program}</span>}
          {all.length>0 && (
            <span className="rcg-marks-chip">
              <BarChart2 size={11}/> Marks: {marksCount.filled}/{marksCount.total}
            </span>
          )}
        </div>
        <div className="rcg-topbar-r">
          {selList.length>0 && (
            <span className="rcg-sel-chip" style={{background:theme.vb,borderColor:theme.vbr,color:theme.vc}}>
              <CheckCircle size={12}/>{selList.length} selected
            </span>
          )}
          {selList.length>0 && <>
            <button className="rcg-tbtn ghost" onClick={()=>setSel(new Set())}><X size={13}/><span>Clear</span></button>
            <button className="rcg-tbtn amber" onClick={handleDlAll} disabled={genning}>
              <Download size={14}/><span>PDF ({selList.length})</span>
            </button>
          </>}
          {all.length > 0 && (
            <button className="rcg-tbtn excel" onClick={handleClassExcel} disabled={excelLoading}
              title="Download class mark sheet as Excel">
              {excelLoading ? <Loader size={13} className="rcg-spin"/> : <FileSpreadsheet size={13}/>}
              <span>{excelLoading ? '…' : 'Excel'}</span>
            </button>
          )}
          {marksCount.filled > 0 && (
            <button className="rcg-tbtn db-save" onClick={handleSaveAllToDb} disabled={dbSaving}
              title="Save all marks to database">
              {dbSaving ? <Loader size={13} className="rcg-spin"/> : <span>💾</span>}
              <span>{dbSaving ? 'Saving…' : 'Save DB'}</span>
            </button>
          )}
          <button className="rcg-tbtn ghost rcg-sidebar-toggle" onClick={()=>setSideOpen(o=>!o)}>
            <Filter size={14}/>
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="rcg-body">

        {/* ── SIDEBAR ── */}
        <aside className={`rcg-sidebar${sideOpen?' open':''}`}>
          <div className="rcg-sb-header">
            <span className="rcg-sb-title"><Filter size={13}/> Options</span>
            <button className="rcg-sb-close" onClick={()=>setSideOpen(false)}><X size={16}/></button>
          </div>
          <div className="rcg-sb-scroll">

            <Panel title="Program / Course" icon={<GraduationCap size={12}/>}>
              <ProgramSelector value={program} onChange={setProgram}/>
            </Panel>

            <Panel title="Exam Configuration" icon={<Calendar size={12}/>}>
              {[
                ['name',    'Exam Name',     'Annual Examination 2025'],
                ['year',    'Academic Year', '2025'],
                ['session', 'Session',       '2024-2025'],
              ].map(([k,lbl,ph])=>(
                <div key={k} className="rcg-fg">
                  <label>{lbl}</label>
                  <input className="rcg-inp" type="text" placeholder={ph}
                    value={examConfig[k]} onChange={e=>setExam(k,e.target.value)}/>
                </div>
              ))}
            </Panel>

            <Panel title="Subject Configuration" icon={<BookOpen size={12}/>} badge={subjects.length}>
              <div className="rcg-sub-editor">
                {subjects.map((sub, i) => (
                  <div key={i} className="rcg-sub-card">
                    <div className="rcg-sub-card-hdr">
                      <div className="rcg-sub-card-num" style={{background:theme.hg}}>{i+1}</div>
                      <span className="rcg-sub-card-label">{sub.name || `Subject ${i+1}`}</span>
                      <button className="rcg-sub-card-del" onClick={()=>removeSubject(i)} title="Remove">
                        <Trash2 size={12}/>
                      </button>
                    </div>
                    <div className="rcg-sub-card-fields">
                      <div className="rcg-sub-field-group">
                        <label className="rcg-sub-field-lbl"><Hash size={10}/> Subject Code</label>
                        <input className="rcg-sub-field-inp" placeholder="e.g. BAN101"
                          value={sub.code} onChange={e=>updateSubject(i,'code',e.target.value)}/>
                      </div>
                      <div className="rcg-sub-field-group">
                        <label className="rcg-sub-field-lbl"><AlignLeft size={10}/> Subject Name</label>
                        <input className="rcg-sub-field-inp" placeholder="e.g. Bangla (1st Paper)"
                          value={sub.name} onChange={e=>updateSubject(i,'name',e.target.value)}/>
                      </div>
                      <div className="rcg-sub-2col">
                        <div className="rcg-sub-field-group">
                          <label className="rcg-sub-field-lbl"><Target size={10}/> Full Marks</label>
                          <input className="rcg-sub-field-inp" type="number" placeholder="100"
                            value={sub.fullMarks} onChange={e=>updateSubject(i,'fullMarks',e.target.value)}/>
                        </div>
                        <div className="rcg-sub-field-group">
                          <label className="rcg-sub-field-lbl"><ShieldCheck size={10}/> Pass Marks</label>
                          <input className="rcg-sub-field-inp" type="number" placeholder="33"
                            value={sub.passMarks} onChange={e=>updateSubject(i,'passMarks',e.target.value)}/>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="rcg-sub-add" style={{background:theme.hg}} onClick={addSubject}>
                  <Plus size={13}/> Add Subject
                </button>
              </div>
            </Panel>

            <Panel title="Upload Assets" icon={<Upload size={12}/>}>
              <UpField label="College Logo" val={customLogo}
                onUp={b64=>{setCustomLogo(b64);setLogoUrl(b64);}}
                onRm={()=>{setCustomLogo(null);setLogoUrl(settings?.logo||'/logo.png');}}/>
              <UpField label="Principal Signature (PNG)" val={signUrl}
                onUp={setSignUrl} onRm={()=>setSignUrl(null)} isSig/>
            </Panel>

            {/* ✅ Excel class download block */}
            {all.length > 0 && (
              <div className="rcg-excel-block">
                <div className="rcg-excel-block-hdr">
                  <FileSpreadsheet size={16} style={{color:'#16a34a'}}/>
                  <div>
                    <p className="rcg-excel-block-title">Class Mark Sheet (Excel)</p>
                    <p className="rcg-excel-block-sub">
                      {filtered.length} students · রোল অনুযায়ী সাজানো
                      {currentClassName && ` · ${currentClassName}`}{fSec && ` · ${fSec}`}
                    </p>
                  </div>
                </div>
                <button className="rcg-excel-block-btn" onClick={handleClassExcel} disabled={excelLoading}>
                  {excelLoading
                    ? <><Loader size={13} className="rcg-spin"/> Generating…</>
                    : <><FileSpreadsheet size={13}/> Download Class Excel</>}
                </button>
                <p className="rcg-excel-block-hint">3 sheets: Mark Sheet · Summary · Subject Analysis</p>
              </div>
            )}

            <Panel title="Filter Students" icon={<Filter size={12}/>}>
              <div className="rcg-sf-wrap">
                <Search size={12} className="rcg-sf-ico"/>
                <input className="rcg-sf-inp" type="text" placeholder="Name / Roll…"
                  value={q} onChange={e=>setQ(e.target.value)}/>
                {q && <button className="rcg-sf-clr" onClick={()=>setQ('')}><X size={11}/></button>}
              </div>
              <div className="rcg-2col">
                <div className="rcg-fg">
                  <label>Class</label>
                  <select className="rcg-sel" value={fCls} onChange={e=>setFCls(e.target.value)}>
                    <option value="">All Classes</option>
                    {uniCls.map(c=><option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="rcg-fg">
                  <label>Section</label>
                  <select className="rcg-sel" value={fSec} onChange={e=>setFSec(e.target.value)}
                    disabled={!fCls||!sections.length}>
                    <option value="">All</option>
                    {sections.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="rcg-fg">
                <label>Result Filter</label>
                <select className="rcg-sel" value={fResult} onChange={e=>setFResult(e.target.value)}>
                  <option value="">All Results</option>
                  <option value="pass">PASS only</option>
                  <option value="fail">FAIL only</option>
                  <option value="pending">Pending / Incomplete</option>
                </select>
              </div>
              <button className="rcg-load-btn" onClick={fetchStudents}
                disabled={stuLoad||initLoad} style={{background:theme.hg}}>
                {stuLoad
                  ? <><Loader size={13} className="rcg-spin"/> Loading…</>
                  : <><RefreshCw size={13}/> Load Students</>
                }
              </button>
            </Panel>

            {all.length>0 && (
              <>
                {/* Stats */}
                <div className="rcg-marks-summary">
                  {[
                    {l:'Total', v:all.length, c:'#1e3a8a'},
                    {l:'PASS',  v:all.filter(s=>computeTotal(subjects,studentMarks[s._id]).result==='PASS').length, c:'#065F46'},
                    {l:'FAIL',  v:all.filter(s=>computeTotal(subjects,studentMarks[s._id]).result==='FAIL').length, c:'#dc2626'},
                    {l:'Pending',v:all.filter(s=>{const r=computeTotal(subjects,studentMarks[s._id]).result;return r==='NOT ENTERED'||r==='INCOMPLETE';}).length, c:'#D97706'},
                  ].map(({l,v,c})=>(
                    <div key={l} className="rcg-ms-item">
                      <div className="rcg-ms-v" style={{color:c}}>{v}</div>
                      <div className="rcg-ms-l">{l}</div>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="rcg-quick-actions">
                  <button className="rcg-qa-btn pass" onClick={selectPassed}>
                    <CheckCircle size={11}/> Select PASS
                  </button>
                  <button className="rcg-qa-btn clear" onClick={()=>setSel(new Set())}>
                    <X size={11}/> Clear All
                  </button>
                </div>
              </>
            )}

            {selList.length>0 && (
              <div className="rcg-action-block">
                <button className="rcg-dl-btn" onClick={handleDlAll} disabled={genning}
                  style={{background:theme.hg}}>
                  <Download size={15}/> Download PDF ({selList.length})
                </button>
              </div>
            )}

          </div>
        </aside>

        {sideOpen && <div className="rcg-overlay" onClick={()=>setSideOpen(false)}/>}

        {/* ── MAIN ── */}
        <main className="rcg-main">
          {initLoad && (
            <div className="rcg-state">
              <Loader size={48} className="rcg-spin rcg-state-ico"/>
              <h3>Initialising…</h3>
            </div>
          )}

          {!initLoad && !all.length && !stuLoad && (
            <div className="rcg-state">
              <div className="rcg-empty-icon" style={{background:theme.hg}}><Award size={40}/></div>
              <h3>Result Card Generator</h3>
              <p>Configure subjects & exam, load students, enter marks, then generate result cards.</p>
              <div className="rcg-howto">
                {[
                  ['01','Program',   'HSC / Degree / Honours'],
                  ['02','Subjects',  'Configure subject list with marks'],
                  ['03','Load',      'Filter & load students'],
                  ['04','Marks',     'Enter marks per student'],
                  ['05','Generate',  'Select students & download PDF'],
                ].map(([n,t,d])=>(
                  <div key={n} className="rcg-howto-card">
                    <div className="rcg-howto-n" style={{color:theme.ac}}>{n}</div>
                    <div className="rcg-howto-t">{t}</div>
                    <div className="rcg-howto-d">{d}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stuLoad && (
            <div className="rcg-state">
              <Loader size={48} className="rcg-spin rcg-state-ico"/>
              <h3>Loading students…</h3>
            </div>
          )}

          {!stuLoad && all.length>0 && (
            <div className="rcg-cards-area">
              <div className="rcg-toolbar">
                <div className="rcg-toolbar-l">
                  <span className="rcg-toolbar-count">
                    {filtered.length} students{sel.size>0 && ` · ${sel.size} selected`}
                  </span>
                  <span className="rcg-prog-tag" style={{background:theme.vb,color:theme.vc,borderColor:theme.vbr}}>{program}</span>
                  {examConfig.name && (
                    <span className="rcg-prog-tag" style={{background:'#f0f9ff',color:'#0369a1',borderColor:'#bae6fd'}}>
                      {examConfig.name}
                    </span>
                  )}
                </div>
                <div className="rcg-toolbar-r">
                  <button className="rcg-tb" onClick={toggleAll}>
                    {allSel?<><CheckSquare size={12}/> Deselect All</>:<><Square size={12}/> Select All</>}
                  </button>
                  {filtered.some(s=>computeTotal(subjects,studentMarks[s._id]).result==='PASS') && (
                    <button className="rcg-tb" onClick={selectPassed}>
                      <CheckCircle size={12}/> Select PASS
                    </button>
                  )}
                  {selList.length>0 && (
                    <button className="rcg-tb amber" onClick={handleDlAll} disabled={genning}>
                      <Download size={12}/> PDF ({selList.length})
                    </button>
                  )}
                </div>
              </div>

              {currentClassName && (
                <div className="rcg-excel-bar">
                  <FileSpreadsheet size={13} style={{color:'#16a34a'}}/>
                  <span>
                    <strong>{currentClassName}{fSec ? ` · ${fSec}` : ''}</strong>
                    {' '}— {filtered.length} students. Excel: Mark Sheet + Summary + Subject Analysis
                  </span>
                  <button className="rcg-excel-bar-btn" onClick={handleClassExcel} disabled={excelLoading}>
                    {excelLoading ? <Loader size={11} className="rcg-spin"/> : <Download size={11}/>}
                    {excelLoading ? 'Generating…' : 'Download Excel'}
                  </button>
                </div>
              )}

              <div className="rcg-card-list">
                {filtered.map((student, idx) => {
                  const isSel  = sel.has(student._id);
                  const isPrev = prevId===student._id;
                  const isMark = marksId===student._id;
                  const nm     = student.userId?.name||'—';
                  const cls    = student.class?.name||student.class||'—';
                  const ph     = student.userId?.profileImage||null;
                  const actv   = student.userId?.isActive;
                  const marks  = studentMarks[student._id] || {};
                  const total  = computeTotal(subjects, marks);
                  const hasMarks = subjects.some(s=>marks[s.code]!==undefined&&marks[s.code]!=='');

                  return (
                    <div key={student._id}
                      className={`rcg-row${isSel?' sel':''}${isPrev||isMark?' open':''}`}
                      style={isSel?{borderColor:theme.ac,background:theme.vb+'44'}
                        :(isPrev||isMark)?{borderColor:theme.ac+'88'}:{}}>
                      <div className="rcg-row-head">
                        <div className="rcg-row-l">
                          <button className={`rcg-chk${isSel?' on':''}`}
                            onClick={()=>toggleOne(student._id)}
                            style={isSel?{color:theme.ac}:{}}>
                            {isSel?<CheckSquare size={15}/>:<Square size={15}/>}
                          </button>
                          <div className="rcg-ava">
                            {ph?<img src={ph} alt="" crossOrigin="anonymous"/>:<User size={14}/>}
                            <div className={`rcg-dot${actv?' active':''}`}/>
                          </div>
                          <div className="rcg-stu-text">
                            <p className="rcg-stu-name">{nm}</p>
                            <p className="rcg-stu-meta">
                              {cls}{student.section&&` · ${student.section}`}
                              {student.rollNumber&&` · Roll ${student.rollNumber}`}
                            </p>
                          </div>
                        </div>
                        <div className="rcg-row-r">
                          {/* Result badge */}
                          {hasMarks ? (
                            <span className={`rcg-result-tag ${total.result==='PASS'?'pass':total.result==='FAIL'?'fail':'pending'}`}>
                              {total.result} {total.result==='PASS'&&`· ${total.pct}%`}
                            </span>
                          ) : (
                            <span className="rcg-result-tag pending">No Marks</span>
                          )}
                          {hasMarks && (
                            <button className="rcg-row-btn excel-sm"
                              onClick={()=>handleStudentExcel(student, marks)}
                              title="Download mark sheet Excel">
                              <FileSpreadsheet size={12}/><span>Excel</span>
                            </button>
                          )}
                          <button
                            className={`rcg-row-btn${isMark?' on':''}`}
                            onClick={()=>toggleMarks(student._id)}
                            style={isMark?{background:theme.vb,borderColor:theme.ac,color:theme.vc}:{borderColor:'#d97706',color:'#d97706'}}>
                            <Edit3 size={12}/><span>{isMark?'Close':'Marks'}</span>
                          </button>
                          <button
                            className={`rcg-row-btn${isPrev?' on':''}`}
                            onClick={()=>togglePrev(student._id)}
                            style={isPrev?{background:theme.vb,borderColor:theme.ac,color:theme.vc}:{}}>
                            {isPrev?<EyeOff size={12}/>:<Eye size={12}/>}
                            <span>{isPrev?'Close':'Preview'}</span>
                          </button>
                          <button className="rcg-row-btn amber" onClick={()=>dlOne(student, idx)}>
                            <Download size={12}/><span>PDF</span>
                          </button>
                        </div>
                      </div>

                      {/* MARKS ENTRY FORM */}
                      {isMark && (
                        <div className="rcg-marks-drawer">
                          <MarksEntryForm
                            student={student} subjects={subjects}
                            marks={marks} onSave={saveMarks}
                            onExcelDl={(s, m) => handleStudentExcel(s, m)}
                            theme={theme}/>
                        </div>
                      )}

                      {/* PREVIEW */}
                      {isPrev && (
                        <div className="rcg-drawer">
                          <div className="rcg-preview-wrap">
                            <div className="rcg-preview-scaler">
                              <ResultCard
                                student={student} logoUrl={logoUrl} signUrl={signUrl}
                                examConfig={examConfig} subjects={subjects}
                                marks={marks} program={program} settings={settings}
                                srNo={filtered.indexOf(student)+1}/>
                            </div>
                          </div>
                          <p className="rcg-preview-note">PDF will look exactly like this preview</p>
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
      <div className="rcg-pdf-pool" aria-hidden="true">
        {selList.map((s, idx) => (
          <div key={s._id} id={`rc-pdf-${s._id}`} className="rcg-pdf-slot">
            <ResultCard
              student={s} logoUrl={logoUrl} signUrl={signUrl}
              examConfig={examConfig} subjects={subjects}
              marks={studentMarks[s._id] || {}}
              program={program} settings={settings}
              srNo={idx+1}/>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultCardGenerator;