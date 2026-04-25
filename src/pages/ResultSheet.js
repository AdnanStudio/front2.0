//new....

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getResultSheetData } from '../services/markService';
import api from '../services/api';
import './ResultSheet.css';

const EXAM_LABEL = {
  '1st_term': '1st Term Examination', '2nd_term': '2nd Term Examination',
  '3rd_term': '3rd Term Examination', 'half_yearly': 'Half Yearly Examination',
  'annual': 'Annual Examination', 'test': 'Test Examination', 'mock': 'Mock Test'
};

const gradePoint = (grade) => {
  const map = { 'A+': '5.00', 'A': '4.00', 'A-': '3.50', 'B': '3.00', 'C': '2.00', 'D': '1.00', 'F': '0.00' };
  return map[grade] || '0.00';
};

const gradeColor = (grade) => {
  const map = { 'A+': '#166534', 'A': '#15803d', 'A-': '#4d7c0f', 'B': '#854d0e', 'C': '#c2410c', 'D': '#b91c1c', 'F': '#dc2626' };
  return map[grade] || '#374151';
};

export default function ResultSheet() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const classId = params.get('classId');
  const examType = params.get('examType');
  const examYear = params.get('examYear');
  const studentIdFilter = params.get('studentId');

  const [markSheets, setMarkSheets] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    loadData();
  }, [classId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resultsRes, settingsRes] = await Promise.all([
        getResultSheetData(classId, { examType, examYear, studentId: studentIdFilter }),
        api.get('/settings').catch(() => ({ data: { data: null } }))
      ]);
      const sheets = resultsRes.data.data || [];
      setMarkSheets(sheets);
      setSchoolInfo(settingsRes.data.data);
      setSelectedIds(sheets.map(s => s._id));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handlePrint = () => window.print();

  const selectedSheets = markSheets.filter(s => selectedIds.includes(s._id));

  if (loading) return <div className="rs-loading">Loading Result Sheets...</div>;

  return (
    <div className="rs-page">
      {/* Controls */}
      <div className="rs-controls no-print">
        <div>
          <h2>📄 Result Sheet / Marksheet Generator</h2>
          <p>{selectedSheets.length} of {markSheets.length} sheets selected</p>
        </div>
        <div className="rs-ctrl-btns">
          <button onClick={() => setSelectedIds(markSheets.map(s => s._id))}>✅ Select All</button>
          <button onClick={() => setSelectedIds([])}>❌ Deselect All</button>
          <button className="print-btn" onClick={handlePrint}>🖨️ Print Selected</button>
        </div>
      </div>

      {/* Student selector */}
      <div className="rs-selector no-print">
        {markSheets.map(sheet => (
          <label key={sheet._id} className={`rs-select-item ${selectedIds.includes(sheet._id) ? 'selected' : ''}`}>
            <input
              type="checkbox"
              checked={selectedIds.includes(sheet._id)}
              onChange={() => toggleSelect(sheet._id)}
            />
            <span>
              {sheet.student?.rollNumber}. {sheet.student?.userId?.name}
              <span className={`rs-result-chip ${sheet.result?.toLowerCase().replace(' ', '-')}`}>{sheet.result}</span>
            </span>
          </label>
        ))}
      </div>

      {/* Print area */}
      <div className="rs-print-area">
        {selectedSheets.map((sheet, idx) => (
          <ResultSheetSingle
            key={sheet._id}
            sheet={sheet}
            schoolInfo={schoolInfo}
            examLabel={EXAM_LABEL[examType] || examType}
            examYear={examYear}
            isLast={idx === selectedSheets.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function ResultSheetSingle({ sheet, schoolInfo, examLabel, examYear, isLast }) {
  const logoUrl = '/logo.png';
  const schoolName = schoolInfo?.schoolName || 'School / College';
  const schoolAddress = schoolInfo?.address || '';
  const schoolPhone = schoolInfo?.phone || '';
  const student = sheet.student;
  const studentName = student?.userId?.name || 'N/A';
  const studentRoll = student?.rollNumber || 'N/A';
  const studentId = student?.studentId || 'N/A';
  const studentDOB = student?.userId?.dateOfBirth
    ? new Date(student.userId.dateOfBirth).toLocaleDateString('en-BD') : 'N/A';
  const className = sheet.class?.name || 'N/A';
  const classSection = sheet.class?.section || '';

  return (
    <div className={`rs-wrapper ${!isLast ? 'page-break' : ''}`}>
      <div className="rs-sheet">
        {/* Watermark */}
        <div className="rs-watermark">
          <img src={logoUrl} alt="" />
        </div>

        {/* Header */}
        <div className="rs-header">
          <img src={logoUrl} alt="logo" className="rs-logo" />
          <div className="rs-school-block">
            <h1 className="rs-school-name">{schoolName}</h1>
            {schoolAddress && <p className="rs-school-addr">{schoolAddress}</p>}
            {schoolPhone && <p className="rs-school-addr">Phone: {schoolPhone}</p>}
          </div>
          <img src={logoUrl} alt="logo" className="rs-logo" />
        </div>

        {/* Title Band */}
        <div className="rs-title-band">
          <div className="rs-title-main">RESULT SHEET / MARKSHEET</div>
          <div className="rs-title-sub">{examLabel} — {examYear}</div>
        </div>

        {/* Student Info + Photo */}
        <div className="rs-student-row">
          <div className="rs-info-grid">
            <div className="rs-info-item">
              <label>Student Name:</label>
              <span>{studentName}</span>
            </div>
            <div className="rs-info-item">
              <label>Roll Number:</label>
              <span>{studentRoll}</span>
            </div>
            <div className="rs-info-item">
              <label>Student ID:</label>
              <span>{studentId}</span>
            </div>
            <div className="rs-info-item">
              <label>Class:</label>
              <span>{className} {classSection && `(${classSection})`}</span>
            </div>
            <div className="rs-info-item">
              <label>Date of Birth:</label>
              <span>{studentDOB}</span>
            </div>
            <div className="rs-info-item">
              <label>Position:</label>
              <span>#{sheet.position || 'N/A'}</span>
            </div>
          </div>
          <div className="rs-photo-box">
            {student?.userId?.profileImage
              ? <img src={student.userId.profileImage} alt="Student" className="rs-photo" />
              : <div className="rs-photo-ph">Photo</div>
            }
          </div>
        </div>

        {/* Marks Table */}
        <table className="rs-marks-table">
          <thead>
            <tr>
              <th rowSpan="2">#</th>
              <th rowSpan="2">Subject</th>
              <th rowSpan="2">Code</th>
              <th colSpan="2">Theory</th>
              <th colSpan="2">Practical</th>
              <th colSpan="2">MCQ</th>
              <th colSpan="2">Total</th>
              <th rowSpan="2">Grade</th>
              <th rowSpan="2">GP</th>
              <th rowSpan="2">Remarks</th>
            </tr>
            <tr>
              <th>Full</th><th>Obt.</th>
              <th>Full</th><th>Obt.</th>
              <th>Full</th><th>Obt.</th>
              <th>Full</th><th>Obt.</th>
            </tr>
          </thead>
          <tbody>
            {sheet.subjects?.map((s, i) => (
              <tr key={s._id} className={s.isAbsent ? 'rs-absent-row' : s.grade === 'F' ? 'rs-fail-row' : ''}>
                <td>{i + 1}</td>
                <td className="rs-sub-name">{s.subjectName || s.subject?.name}</td>
                <td>{s.subjectCode || s.subject?.code || '-'}</td>
                <td>{s.theoryFullMarks}</td>
                <td className="rs-obt-cell">{s.isAbsent ? 'AB' : s.theoryObtained}</td>
                <td>{s.practicalFullMarks > 0 ? s.practicalFullMarks : '-'}</td>
                <td className="rs-obt-cell">{s.isAbsent ? '-' : s.practicalFullMarks > 0 ? s.practicalObtained : '-'}</td>
                <td>{s.mcqFullMarks > 0 ? s.mcqFullMarks : '-'}</td>
                <td className="rs-obt-cell">{s.isAbsent ? '-' : s.mcqFullMarks > 0 ? s.mcqObtained : '-'}</td>
                <td>{s.isAbsent ? s.totalFullMarks : s.totalFullMarks}</td>
                <td className="rs-total-obt">{s.isAbsent ? 'AB' : s.totalObtained}</td>
                <td className="rs-grade-cell" style={{ color: gradeColor(s.grade), fontWeight: 'bold' }}>
                  {s.isAbsent ? 'AB' : s.grade}
                </td>
                <td>{s.isAbsent ? '0.00' : s.gradePoint?.toFixed(2)}</td>
                <td className="rs-remarks-cell">{s.remarks || (s.isAbsent ? 'Absent' : '')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="rs-total-row">
              <td colSpan="3"><strong>Grand Total</strong></td>
              <td colSpan="2"><strong>{sheet.totalFullMarks}</strong></td>
              <td colSpan="2">—</td>
              <td colSpan="2">—</td>
              <td><strong>{sheet.totalFullMarks}</strong></td>
              <td><strong>{sheet.totalObtained}</strong></td>
              <td style={{ color: gradeColor(sheet.grade), fontWeight: 'bold' }}>{sheet.grade}</td>
              <td><strong>{sheet.gpa?.toFixed(2)}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        {/* Summary Band */}
        <div className="rs-summary-band">
          <div className="rs-sum-item">
            <span className="rs-sum-label">Total Marks Obtained</span>
            <span className="rs-sum-val">{sheet.totalObtained} / {sheet.totalFullMarks}</span>
          </div>
          <div className="rs-sum-item">
            <span className="rs-sum-label">Percentage</span>
            <span className="rs-sum-val">{sheet.percentage}%</span>
          </div>
          <div className="rs-sum-item">
            <span className="rs-sum-label">GPA</span>
            <span className="rs-sum-val" style={{ color: gradeColor(sheet.grade) }}>{sheet.gpa?.toFixed(2)}</span>
          </div>
          <div className="rs-sum-item">
            <span className="rs-sum-label">Grade</span>
            <span className="rs-sum-val" style={{ color: gradeColor(sheet.grade), fontWeight: 800, fontSize: '1.1em' }}>
              {sheet.grade}
            </span>
          </div>
          <div className="rs-sum-item">
            <span className="rs-sum-label">Result</span>
            <span className={`rs-result-final ${sheet.result?.toLowerCase().replace(' ', '-')}`}>
              {sheet.result}
            </span>
          </div>
          <div className="rs-sum-item">
            <span className="rs-sum-label">Position</span>
            <span className="rs-sum-val">#{sheet.position || 'N/A'}</span>
          </div>
        </div>

        {/* Grade Scale */}
        <div className="rs-grade-scale">
          <h4>Grade Scale:</h4>
          <table className="rs-grade-table">
            <tbody>
              <tr>
                {[['A+','80-100','5.00'],['A','70-79','4.00'],['A-','60-69','3.50'],['B','50-59','3.00'],['C','40-49','2.00'],['D','33-39','1.00'],['F','<33','0.00']].map(([g, r, p]) => (
                  <td key={g} style={{ color: gradeColor(g) }}>
                    <strong>{g}</strong><br/><span>{r}</span><br/><span>GP: {p}</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="rs-signatures">
          <div className="rs-sig-box">
            <div className="rs-sig-line"></div>
            <p>Class Teacher</p>
          </div>
          <div className="rs-sig-box">
            <div className="rs-sig-line"></div>
            <p>Controller of Examinations</p>
          </div>
          <div className="rs-sig-seal">
            <div className="rs-seal-circle">OFFICIAL<br/>SEAL</div>
          </div>
          <div className="rs-sig-box">
            <div className="rs-sig-line"></div>
            <p>Principal</p>
          </div>
        </div>

        {/* Footer */}
        <div className="rs-footer">
          <span>Published on: {sheet.publishedAt ? new Date(sheet.publishedAt).toLocaleDateString('en-BD') : 'N/A'}</span>
          <span>This is a computer-generated result sheet — {schoolName} {examYear}</span>
        </div>
      </div>
    </div>
  );
}
