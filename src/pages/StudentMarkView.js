///

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getStudentMarks } from '../services/markService';
import api from '../services/api';
import './StudentMarkView.css';

const gradeColor = (grade) => {
  const map = { 'A+': '#16a34a', 'A': '#22c55e', 'A-': '#84cc16', 'B': '#eab308', 'C': '#f97316', 'D': '#ef4444', 'F': '#dc2626' };
  return map[grade] || '#6b7280';
};

const EXAM_LABEL = {
  '1st_term': '1st Term', '2nd_term': '2nd Term', '3rd_term': '3rd Term',
  'half_yearly': 'Half Yearly', 'annual': 'Annual Exam', 'test': 'Test', 'mock': 'Mock Test'
};

export default function StudentMarkView() {
  const { user } = useSelector(state => state.auth);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMark, setSelectedMark] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    loadMarks();
  }, []);

  const loadMarks = async () => {
    setLoading(true);
    try {
      // Get student profile first
      const profileRes = await api.get('/students/profile');
      const student = profileRes.data.data;
      setStudentInfo(student);

      const r = await getStudentMarks(student._id);
      const allMarks = r.data.data || [];
      setMarks(allMarks);
      if (allMarks.length > 0) setSelectedMark(allMarks[0]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) return <div className="smark-loading">Loading your results...</div>;

  return (
    <div className="student-mark-page">
      <div className="smark-header">
        <h1>📊 My Academic Results</h1>
        <p>View your published examination results</p>
      </div>

      {marks.length === 0 ? (
        <div className="smark-empty">
          <span>📭</span>
          <p>No results published yet. Check back after your exams.</p>
        </div>
      ) : (
        <div className="smark-layout">
          {/* Sidebar: list of exams */}
          <div className="smark-sidebar">
            <h3>Examinations</h3>
            {marks.map(m => (
              <button
                key={m._id}
                className={`smark-exam-btn ${selectedMark?._id === m._id ? 'active' : ''}`}
                onClick={() => setSelectedMark(m)}
              >
                <div className="exam-btn-title">{EXAM_LABEL[m.examType] || m.examType}</div>
                <div className="exam-btn-year">{m.examYear}</div>
                <div className="exam-btn-gpa" style={{ color: gradeColor(m.grade) }}>
                  GPA: {m.gpa} ({m.grade})
                </div>
                <span className={`result-badge-small ${m.result?.toLowerCase().replace(' ', '-')}`}>
                  {m.result}
                </span>
              </button>
            ))}
          </div>

          {/* Main: selected result */}
          {selectedMark && (
            <div className="smark-main">
              {/* Summary */}
              <div className="smark-summary">
                <div className="smark-summary-item">
                  <div className="smi-label">Exam</div>
                  <div className="smi-val">{EXAM_LABEL[selectedMark.examType]}</div>
                </div>
                <div className="smark-summary-item">
                  <div className="smi-label">Year</div>
                  <div className="smi-val">{selectedMark.examYear}</div>
                </div>
                <div className="smark-summary-item">
                  <div className="smi-label">Total</div>
                  <div className="smi-val">{selectedMark.totalObtained}/{selectedMark.totalFullMarks}</div>
                </div>
                <div className="smark-summary-item">
                  <div className="smi-label">Percentage</div>
                  <div className="smi-val highlight">{selectedMark.percentage}%</div>
                </div>
                <div className="smark-summary-item">
                  <div className="smi-label">GPA</div>
                  <div className="smi-val" style={{ color: gradeColor(selectedMark.grade) }}>
                    {selectedMark.gpa}
                  </div>
                </div>
                <div className="smark-summary-item">
                  <div className="smi-label">Grade</div>
                  <div className="smi-val" style={{ color: gradeColor(selectedMark.grade), fontWeight: 800 }}>
                    {selectedMark.grade}
                  </div>
                </div>
                <div className="smark-summary-item">
                  <div className="smi-label">Position</div>
                  <div className="smi-val">#{selectedMark.position || 'N/A'}</div>
                </div>
                <div className="smark-summary-item">
                  <div className="smi-label">Result</div>
                  <div className={`smi-result ${selectedMark.result?.toLowerCase().replace(' ', '-')}`}>
                    {selectedMark.result}
                  </div>
                </div>
              </div>

              {/* Subject-wise marks */}
              <div className="smark-subjects">
                <h3>Subject-wise Results</h3>
                <table className="smark-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Subject</th>
                      <th>Theory</th>
                      <th>Practical</th>
                      <th>MCQ</th>
                      <th>Total</th>
                      <th>Grade</th>
                      <th>GP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMark.subjects?.map((s, i) => (
                      <tr key={s._id} className={s.isAbsent ? 'absent-row' : s.grade === 'F' ? 'fail-row' : ''}>
                        <td>{i + 1}</td>
                        <td className="subject-name-cell">
                          <strong>{s.subjectName || s.subject?.name}</strong>
                          {s.subjectCode && <span className="sub-code">{s.subjectCode}</span>}
                        </td>
                        <td>
                          {s.isAbsent ? '-' : `${s.theoryObtained}/${s.theoryFullMarks}`}
                        </td>
                        <td>
                          {s.isAbsent ? '-' : s.practicalFullMarks > 0 ? `${s.practicalObtained}/${s.practicalFullMarks}` : '-'}
                        </td>
                        <td>
                          {s.isAbsent ? '-' : s.mcqFullMarks > 0 ? `${s.mcqObtained}/${s.mcqFullMarks}` : '-'}
                        </td>
                        <td className="bold-cell">
                          {s.isAbsent ? <span className="absent-tag">ABSENT</span> : `${s.totalObtained}/${s.totalFullMarks}`}
                        </td>
                        <td>
                          <span className="grade-chip" style={{ background: gradeColor(s.grade) + '22', color: gradeColor(s.grade), fontWeight: 700 }}>
                            {s.isAbsent ? 'AB' : s.grade}
                          </span>
                        </td>
                        <td>{s.isAbsent ? '0' : s.gradePoint}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan="5" className="text-right"><strong>Grand Total</strong></td>
                      <td><strong>{selectedMark.totalObtained}/{selectedMark.totalFullMarks}</strong></td>
                      <td style={{ color: gradeColor(selectedMark.grade), fontWeight: 800 }}>{selectedMark.grade}</td>
                      <td><strong>{selectedMark.gpa}</strong></td>
                    </tr>
                  </tfoot>
                </table>

                {/* GPA visual bar */}
                <div className="gpa-visual">
                  <div className="gpa-bar-label">GPA Progress</div>
                  <div className="gpa-bar-bg">
                    <div
                      className="gpa-bar-fill"
                      style={{
                        width: `${(selectedMark.gpa / 5) * 100}%`,
                        background: gradeColor(selectedMark.grade)
                      }}
                    ></div>
                  </div>
                  <span className="gpa-bar-val" style={{ color: gradeColor(selectedMark.grade) }}>
                    {selectedMark.gpa}/5.00
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
