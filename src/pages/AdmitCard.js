import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getAdmitCardData } from '../services/markService';
import api from '../services/api';
import './AdmitCard.css';

const EXAM_LABEL = {
  '1st_term': '1st Term Examination', '2nd_term': '2nd Term Examination',
  '3rd_term': '3rd Term Examination', 'half_yearly': 'Half Yearly Examination',
  'annual': 'Annual Examination', 'test': 'Test Examination', 'mock': 'Mock Test'
};

export default function AdmitCard() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const classId = params.get('classId');
  const examType = params.get('examType');
  const examYear = params.get('examYear');
  const studentIdFilter = params.get('studentId');

  const [admitCards, setAdmitCards] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const printRef = useRef(null);

  useEffect(() => {
    loadData();
  }, [classId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [admitRes, settingsRes] = await Promise.all([
        getAdmitCardData(classId, { examType, examYear, studentId: studentIdFilter }),
        api.get('/settings').catch(() => ({ data: { data: null } }))
      ]);
      setAdmitCards(admitRes.data.data || []);
      setSchoolInfo(settingsRes.data.data);
      setSelectedIds((admitRes.data.data || []).map(a => a.student._id));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedCards = admitCards.filter(a => selectedIds.includes(a.student._id));

  if (loading) return <div className="admit-loading">Loading Admit Cards...</div>;

  return (
    <div className="admit-page">
      {/* Control bar - hidden on print */}
      <div className="admit-controls no-print">
        <div>
          <h2>🎫 Admit Card Generator</h2>
          <p>{selectedCards.length} of {admitCards.length} cards selected</p>
        </div>
        <div className="admit-ctrl-btns">
          <button onClick={() => setSelectedIds(admitCards.map(a => a.student._id))}>✅ Select All</button>
          <button onClick={() => setSelectedIds([])}>❌ Deselect All</button>
          <button className="print-btn" onClick={handlePrint}>🖨️ Print Selected</button>
        </div>
      </div>

      {/* Student selector - hidden on print */}
      <div className="admit-selector no-print">
        {admitCards.map(card => (
          <label key={card.student._id} className={`admit-select-item ${selectedIds.includes(card.student._id) ? 'selected' : ''}`}>
            <input
              type="checkbox"
              checked={selectedIds.includes(card.student._id)}
              onChange={() => toggleSelect(card.student._id)}
            />
            <span>{card.student.rollNumber}. {card.student.name}</span>
          </label>
        ))}
      </div>

      {/* Print Area */}
      <div ref={printRef} className="admit-print-area">
        {selectedCards.map((card, idx) => (
          <AdmitCardSingle
            key={card.student._id}
            card={card}
            schoolInfo={schoolInfo}
            examLabel={EXAM_LABEL[examType] || examType}
            examYear={examYear}
            isLast={idx === selectedCards.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function AdmitCardSingle({ card, schoolInfo, examLabel, examYear, isLast }) {
  const logoUrl = '/logo.png';
  const schoolName = schoolInfo?.schoolName || 'School / College';
  const schoolAddress = schoolInfo?.address || '';
  const schoolPhone = schoolInfo?.phone || '';

  return (
    <div className={`admit-card-wrapper ${!isLast ? 'page-break' : ''}`}>
      <div className="admit-card">
        {/* Watermark logo */}
        <div className="admit-watermark">
          <img src={logoUrl} alt="watermark" />
        </div>

        {/* Header */}
        <div className="admit-header">
          <img src={logoUrl} alt="logo" className="admit-logo" />
          <div className="admit-school-info">
            <h1 className="admit-school-name">{schoolName}</h1>
            {schoolAddress && <p>{schoolAddress}</p>}
            {schoolPhone && <p>Phone: {schoolPhone}</p>}
            <div className="admit-title-band">
              <h2>ADMIT CARD</h2>
              <span>{examLabel} — {examYear}</span>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="admit-student-section">
          <div className="admit-student-details">
            <div className="admit-row">
              <label>Student Name:</label>
              <span className="admit-val">{card.student.name}</span>
            </div>
            <div className="admit-row">
              <label>Roll Number:</label>
              <span className="admit-val">{card.student.rollNumber || 'N/A'}</span>
            </div>
            <div className="admit-row">
              <label>Student ID:</label>
              <span className="admit-val">{card.student.studentId || 'N/A'}</span>
            </div>
            <div className="admit-row">
              <label>Class:</label>
              <span className="admit-val">{card.class.name} {card.class.section && `(${card.class.section})`}</span>
            </div>
            <div className="admit-row">
              <label>Date of Birth:</label>
              <span className="admit-val">
                {card.student.dateOfBirth
                  ? new Date(card.student.dateOfBirth).toLocaleDateString('en-BD')
                  : 'N/A'}
              </span>
            </div>
            <div className="admit-row">
              <label>Exam Year:</label>
              <span className="admit-val">{examYear}</span>
            </div>
          </div>
          <div className="admit-photo-box">
            {card.student.profileImage
              ? <img src={card.student.profileImage} alt="Student" className="admit-photo" />
              : <div className="admit-photo-placeholder">Photo</div>
            }
          </div>
        </div>

        {/* Subjects */}
        <div className="admit-subjects-section">
          <h3>Examination Schedule</h3>
          <table className="admit-subjects-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Subject</th>
                <th>Code</th>
                <th>Theory</th>
                <th>Practical</th>
                <th>Date</th>
                <th>Time</th>
                <th>Venue</th>
              </tr>
            </thead>
            <tbody>
              {card.subjects.map((sub, i) => (
                <tr key={sub._id}>
                  <td>{i + 1}</td>
                  <td className="sub-name-cell">{sub.name}</td>
                  <td>{sub.code || '-'}</td>
                  <td>✓</td>
                  <td>{sub.hasPractical ? '✓' : '-'}</td>
                  <td className="date-blank">_____________</td>
                  <td className="time-blank">_____________</td>
                  <td className="venue-blank">_____________</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Instructions */}
        <div className="admit-instructions">
          <h4>Instructions:</h4>
          <ol>
            <li>This admit card must be presented at the examination hall.</li>
            <li>Students must arrive 15 minutes before the exam begins.</li>
            <li>Mobile phones and electronic devices are strictly prohibited.</li>
            <li>Students must sit in their assigned seats as per roll number.</li>
            <li>Any form of malpractice will result in cancellation of the examination.</li>
          </ol>
        </div>

        {/* Signatures */}
        <div className="admit-signatures">
          <div className="admit-sig-box">
            <div className="sig-line"></div>
            <p>Student Signature</p>
          </div>
          <div className="admit-sig-box center-seal">
            <div className="seal-circle">SEAL</div>
          </div>
          <div className="admit-sig-box">
            <div className="sig-line"></div>
            <p>Principal / Controller of Examinations</p>
          </div>
        </div>

        {/* Bottom border */}
        <div className="admit-footer-band">
          <span>This is a computer-generated admit card</span>
          <span>{schoolName} — {examYear}</span>
        </div>
      </div>
    </div>
  );
}
