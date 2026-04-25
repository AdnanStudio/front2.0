//
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Marks.css';

const EXAM_TYPES = [
  { value: '1st_term',    label: '1st Term Exam' },
  { value: '2nd_term',    label: '2nd Term Exam' },
  { value: '3rd_term',    label: '3rd Term Exam' },
  { value: 'half_yearly', label: 'Half Yearly' },
  { value: 'annual',      label: 'Annual Exam' },
  { value: 'test',        label: 'Test Exam' },
  { value: 'mock',        label: 'Mock Test' },
];

const CY = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CY - i + 1);

const gradeColor = g => ({
  'A+': '#15803d', A: '#16a34a', 'A-': '#65a30d',
  B: '#ca8a04', C: '#ea580c', D: '#dc2626', F: '#991b1b',
}[g] || '#64748b');

const calcLive = (grid, studentId, subjects) => {
  let obtained = 0, full = 0;
  subjects.forEach(sub => {
    const key = String(sub._id);
    const m   = grid[studentId]?.[key] || {};
    const f   = parseFloat(m.theoryFullMarks) || sub.totalMarks || 100;
    full += f;
    if (!m.isAbsent) obtained += parseFloat(m.theoryObtained) || 0;
  });
  const pct = full > 0 ? (obtained / full) * 100 : 0;
  const g = pct>=80?'A+':pct>=70?'A':pct>=60?'A-':pct>=50?'B':pct>=40?'C':pct>=33?'D':'F';
  return { obtained, full, pct: pct.toFixed(1), grade: g };
};

export default function Marks() {
  const { user } = useSelector(s => s.auth);
  const isAdmin   = user?.role === 'admin';

  const [classes,  setClasses]  = useState([]);
  const [selClass, setSelClass] = useState('');
  const [selExam,  setSelExam]  = useState('annual');
  const [selYear,  setSelYear]  = useState(CY);
  const [tab,      setTab]      = useState('entry');

  const [classInfo, setClassInfo] = useState(null);
  const [grid,      setGrid]      = useState({});
  const [viewMarks, setViewMarks] = useState([]);
  const [stats,     setStats]     = useState(null);

  // Track load state per-tab independently
  const [entryLoading, setEntryLoading] = useState(false);
  const [viewLoading,  setViewLoading]  = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [saving,       setSaving]       = useState(false);

  // Track if data was already loaded for current filter combination
  const loadedRef = useRef({ entry: null, view: null, stats: null });

  const filterKey = `${selClass}|${selExam}|${selYear}`;

  // Load classes once on mount
  useEffect(() => {
    api.get('/classes')
      .then(r => setClasses(r.data?.data || []))
      .catch(() => {}); // silent - classes are secondary
  }, []);

  // Reset loaded cache when filters change
  useEffect(() => {
    loadedRef.current = { entry: null, view: null, stats: null };
    setClassInfo(null);
    setViewMarks([]);
    setStats(null);
    setGrid({});
  }, [selClass, selExam, selYear]);

  // ── Load entry data ──────────────────────────────────────────────────
  const loadEntry = useCallback(async (force = false) => {
    if (!selClass) return;
    if (!force && loadedRef.current.entry === filterKey) return; // already loaded
    setEntryLoading(true);
    try {
      const r = await api.get(`/marks/class/${selClass}/students`, {
        params: { examType: selExam, examYear: selYear },
      });
      const data = r.data?.data;
      if (!data) throw new Error('No data');
      setClassInfo(data);

      const newGrid = {};
      data.students.forEach(({ student, existingMark }) => {
        newGrid[student._id] = {};
        data.subjects.forEach(sub => {
          const key = String(sub._id);
          const ex  = existingMark?.subjects?.find(s =>
            s.subjectName?.toLowerCase() === sub.name?.toLowerCase()
          );
          newGrid[student._id][key] = {
            theoryFullMarks:    ex?.theoryFullMarks    ?? sub.totalMarks ?? 100,
            theoryObtained:     ex?.theoryObtained     ?? '',
            practicalFullMarks: ex?.practicalFullMarks ?? 0,
            practicalObtained:  ex?.practicalObtained  ?? '',
            mcqFullMarks:       ex?.mcqFullMarks       ?? 0,
            mcqObtained:        ex?.mcqObtained        ?? '',
            isAbsent:           ex?.isAbsent           ?? false,
          };
        });
      });
      setGrid(newGrid);
      loadedRef.current.entry = filterKey;
    } catch (e) {
      // Only show error toast if user explicitly clicked retry
      if (force) {
        toast.error(e.response?.data?.message || 'Failed to load class data');
      }
    }
    setEntryLoading(false);
  }, [selClass, selExam, selYear, filterKey]);

  const loadView = useCallback(async (force = false) => {
    if (!selClass) return;
    if (!force && loadedRef.current.view === filterKey) return;
    setViewLoading(true);
    try {
      const r = await api.get(`/marks/class/${selClass}`, {
        params: { examType: selExam, examYear: selYear },
      });
      setViewMarks(r.data?.data || []);
      loadedRef.current.view = filterKey;
    } catch {
      if (force) toast.error('Failed to load results');
    }
    setViewLoading(false);
  }, [selClass, selExam, selYear, filterKey]);

  const loadStats = useCallback(async (force = false) => {
    if (!selClass) return;
    if (!force && loadedRef.current.stats === filterKey) return;
    setStatsLoading(true);
    try {
      const r = await api.get(`/marks/stats/${selClass}`, {
        params: { examType: selExam, examYear: selYear },
      });
      setStats(r.data?.data || null);
      loadedRef.current.stats = filterKey;
    } catch {
      if (force) toast.error('Failed to load statistics');
    }
    setStatsLoading(false);
  }, [selClass, selExam, selYear, filterKey]);

  // Only load data for the ACTIVE tab (not all 3 at once)
  useEffect(() => {
    if (!selClass) return;
    if (tab === 'entry') loadEntry();
    if (tab === 'view')  loadView();
    if (tab === 'stats') loadStats();
  }, [tab, selClass, selExam, selYear]);

  // ── Mark input ───────────────────────────────────────────────────────
  const setMark = (studentId, subjectId, field, val) => {
    setGrid(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: {
          ...prev[studentId]?.[subjectId],
          [field]: field === 'isAbsent' ? val : (val === '' ? '' : parseFloat(val) || 0),
        },
      },
    }));
  };

  // ── Save all ─────────────────────────────────────────────────────────
  const handleSaveAll = async () => {
    if (!classInfo?.students?.length) return toast.error('No students to save');
    setSaving(true);
    try {
      const marksData = classInfo.students.map(({ student }) => ({
        studentId: student._id,
        subjects: classInfo.subjects.map(sub => {
          const key = String(sub._id);
          const m   = grid[student._id]?.[key] || {};
          return {
            subjectName:        sub.name,
            subjectCode:        sub.code || '',
            theoryFullMarks:    parseFloat(m.theoryFullMarks)    || 100,
            theoryObtained:     parseFloat(m.theoryObtained)     || 0,
            practicalFullMarks: parseFloat(m.practicalFullMarks) || 0,
            practicalObtained:  parseFloat(m.practicalObtained)  || 0,
            mcqFullMarks:       parseFloat(m.mcqFullMarks)       || 0,
            mcqObtained:        parseFloat(m.mcqObtained)        || 0,
            isAbsent:           m.isAbsent ?? false,
          };
        }),
      }));
      const r = await api.post('/marks/bulk', {
        classId:  selClass,
        examType: selExam,
        examYear: selYear,
        marksData,
      });
      toast.success(r.data?.message || '✅ Marks saved!');
      // Invalidate view/stats cache so they reload fresh
      loadedRef.current.view  = null;
      loadedRef.current.stats = null;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save marks');
    }
    setSaving(false);
  };

  // ── Publish ──────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!window.confirm('Publish results? Students will be notified.')) return;
    try {
      const r = await api.put('/marks/publish', {
        classId: selClass, examType: selExam, examYear: selYear,
      });
      toast.success(r.data?.message || 'Results published!');
      loadedRef.current.view  = null;
      loadedRef.current.stats = null;
      if (tab === 'view') loadView(true);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to publish');
    }
  };

  const handleUnpublish = async () => {
    if (!window.confirm('Unpublish results?')) return;
    try {
      await api.put('/marks/unpublish', {
        classId: selClass, examType: selExam, examYear: selYear,
      });
      toast.success('Results unpublished');
      loadedRef.current.view  = null;
      loadView(true);
    } catch {
      toast.error('Failed to unpublish');
    }
  };

  const selClassObj  = classes.find(c => c._id === selClass);
  const selExamLabel = EXAM_TYPES.find(e => e.value === selExam)?.label;
  const loading = tab === 'entry' ? entryLoading
                : tab === 'view'  ? viewLoading
                : statsLoading;

  return (
    <div className="mk-page">
      {/* Header */}
      <div className="mk-header">
        <h1>📊 Mark Management System</h1>
        <p>Enter marks → Save → Publish → Print admit cards & marksheets</p>
      </div>

      {/* Filters */}
      <div className="mk-filters">
        <div className="mk-fg">
          <label>Class</label>
          <select value={selClass} onChange={e => { setSelClass(e.target.value); setTab('entry'); }}>
            <option value="">— Select Class —</option>
            {classes.map(c => (
              <option key={c._id} value={c._id}>
                {c.name}{c.section ? ` (${c.section})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="mk-fg">
          <label>Exam Type</label>
          <select value={selExam} onChange={e => setSelExam(e.target.value)}>
            {EXAM_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>

        <div className="mk-fg">
          <label>Year</label>
          <select value={selYear} onChange={e => setSelYear(parseInt(e.target.value))}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {selClass && selClassObj && (
          <div className="mk-class-badge">
            <span className="badge-inner">
              {selClassObj.name}{selClassObj.section && ` · ${selClassObj.section}`}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mk-tabs">
        {[['entry','✏️ Mark Entry'],['view','📋 View Results'],['stats','📈 Statistics']].map(([t, label]) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {label}
          </button>
        ))}
        {isAdmin && selClass && (
          <>
            <a href={`/dashboard/admit-card?classId=${selClass}&examType=${selExam}&examYear=${selYear}`}
               className="tab-ext" target="_blank" rel="noreferrer">🎫 Admit Cards</a>
            <a href={`/dashboard/result-sheet?classId=${selClass}&examType=${selExam}&examYear=${selYear}`}
               className="tab-ext green" target="_blank" rel="noreferrer">📄 Marksheets</a>
          </>
        )}
      </div>

      {/* No class selected */}
      {!selClass && (
        <div className="mk-empty">
          <span>📚</span>
          <p>Please select a class to get started</p>
        </div>
      )}

      {/* Loading */}
      {selClass && loading && (
        <div className="mk-loading">
          <div className="spin" /><span>Loading...</span>
        </div>
      )}

      {/* ═══════ MARK ENTRY ═══════ */}
      {tab === 'entry' && selClass && !entryLoading && (
        <div className="mk-section">
          {!classInfo ? (
            <div className="mk-empty">
              <span>⚠️</span>
              <p>Could not load class data.</p>
              <button className="btn-retry" onClick={() => loadEntry(true)}>🔄 Retry</button>
            </div>
          ) : classInfo.students.length === 0 ? (
            <div className="mk-empty">
              <span>👥</span>
              <p>No students found in <strong>{classInfo.class.name}</strong></p>
            </div>
          ) : classInfo.subjects.length === 0 ? (
            <div className="mk-empty">
              <span>📖</span>
              <p>No subjects found for this class. Add subjects first.</p>
            </div>
          ) : (
            <>
              <div className="mk-toolbar">
                <div className="mk-toolbar-info">
                  <strong>{classInfo.class.name}</strong>
                  {classInfo.class.section && ` (${classInfo.class.section})`}
                  {' — '}{selExamLabel} {selYear}
                  <span className="mk-count">
                    &nbsp;· {classInfo.students.length} Students &nbsp;· {classInfo.subjects.length} Subjects
                  </span>
                </div>
                <div className="mk-toolbar-btns">
                  <button className="btn-save" onClick={handleSaveAll} disabled={saving}>
                    {saving ? <><div className="btn-spin"/>Saving...</> : '💾 Save All'}
                  </button>
                  {isAdmin && (
                    <button className="btn-publish" onClick={handlePublish}>🚀 Publish</button>
                  )}
                </div>
              </div>

              <div className="mk-table-wrap">
                <table className="mk-table">
                  <thead>
                    <tr>
                      <th className="col-roll" rowSpan={2}>Roll</th>
                      <th className="col-name" rowSpan={2}>Student</th>
                      {classInfo.subjects.map(sub => (
                        <th key={sub._id} colSpan={2} className="col-subj">
                          {sub.name}{sub.code && <small> ({sub.code})</small>}
                        </th>
                      ))}
                      <th className="col-sum" rowSpan={2}>Total</th>
                      <th className="col-sum" rowSpan={2}>%</th>
                      <th className="col-sum" rowSpan={2}>Grade</th>
                    </tr>
                    <tr>
                      {classInfo.subjects.map(sub => {
                        const firstStu = classInfo.students[0]?.student?._id;
                        const full = grid[firstStu]?.[String(sub._id)]?.theoryFullMarks ?? sub.totalMarks ?? 100;
                        return (
                          <React.Fragment key={sub._id}>
                            <th className="col-inp">Marks <small>/{full}</small></th>
                            <th className="col-abs">AB</th>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {classInfo.students.map(({ student }) => {
                      const live = calcLive(grid, student._id, classInfo.subjects);
                      return (
                        <tr key={student._id}>
                          <td className="td-roll">{student.rollNumber || '—'}</td>
                          <td className="td-name">
                            {student.profileImage && (
                              <img src={student.profileImage} alt="" className="s-pic" />
                            )}
                            {student.name}
                          </td>
                          {classInfo.subjects.map(sub => {
                            const key    = String(sub._id);
                            const m      = grid[student._id]?.[key] || {};
                            const full   = parseFloat(m.theoryFullMarks) || sub.totalMarks || 100;
                            const absent = m.isAbsent ?? false;
                            return (
                              <React.Fragment key={key}>
                                <td className="td-inp">
                                  <input
                                    type="number" min="0" max={full} step="0.5"
                                    value={absent ? '' : (m.theoryObtained ?? '')}
                                    placeholder={absent ? 'AB' : `0-${full}`}
                                    disabled={absent}
                                    onChange={e => setMark(student._id, key, 'theoryObtained', e.target.value)}
                                    className={`minput${absent ? ' absent' : ''}`}
                                  />
                                </td>
                                <td className="td-abs">
                                  <input
                                    type="checkbox"
                                    checked={absent}
                                    onChange={e => setMark(student._id, key, 'isAbsent', e.target.checked)}
                                    className="ab-chk"
                                  />
                                </td>
                              </React.Fragment>
                            );
                          })}
                          <td className="td-sum">{live.obtained}/{live.full}</td>
                          <td className="td-pct">{live.pct}%</td>
                          <td className="td-grade" style={{ color: gradeColor(live.grade) }}>
                            <strong>{live.grade}</strong>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mk-footer">
                <button className="btn-save" onClick={handleSaveAll} disabled={saving}>
                  {saving ? 'Saving...' : '💾 Save All Marks'}
                </button>
                {isAdmin && (
                  <button className="btn-publish" onClick={handlePublish}>🚀 Publish Results</button>
                )}
                <span className="mk-hint">💡 Save marks first, then publish when done.</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════ VIEW RESULTS ═══════ */}
      {tab === 'view' && selClass && !viewLoading && (
        <div className="mk-section">
          <div className="mk-toolbar">
            <div className="mk-toolbar-info">
              Results — {selClassObj?.name} — {selExamLabel} {selYear}
            </div>
            <div className="mk-toolbar-btns">
              {isAdmin && viewMarks.length > 0 && (
                <>
                  <button className="btn-unp" onClick={handleUnpublish}>🔒 Unpublish</button>
                  <a href={`/dashboard/result-sheet?classId=${selClass}&examType=${selExam}&examYear=${selYear}`}
                     className="btn-print" target="_blank" rel="noreferrer">🖨️ Print All</a>
                </>
              )}
              <button className="btn-retry" onClick={() => loadView(true)}>🔄 Refresh</button>
            </div>
          </div>

          {viewMarks.length === 0 ? (
            <div className="mk-empty">
              <span>📭</span>
              <p>No marks saved yet. Use Mark Entry to enter marks first.</p>
            </div>
          ) : (
            <div className="mk-table-wrap">
              <table className="mk-table res-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Roll</th>
                    <th>Student</th>
                    {viewMarks[0]?.subjects?.map((s, i) => (
                      <th key={i}>{s.subjectName || `Sub ${i+1}`}</th>
                    ))}
                    <th>Total</th>
                    <th>%</th>
                    <th>GPA</th>
                    <th>Grade</th>
                    <th>Result</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...viewMarks]
                    .sort((a, b) => (b.percentage||0) - (a.percentage||0))
                    .map((mark, idx) => (
                    <tr key={mark._id} className={mark.grade === 'F' ? 'row-fail' : ''}>
                      <td className="td-pos">#{idx + 1}</td>
                      <td>{mark.student?.rollNumber || '—'}</td>
                      <td className="td-name">
                        {mark.student?.userId?.profileImage && (
                          <img src={mark.student.userId.profileImage} alt="" className="s-pic" />
                        )}
                        {mark.student?.userId?.name || 'Unknown'}
                      </td>
                      {mark.subjects?.map((s, i) => (
                        <td key={i} className={s.isAbsent ? 'td-ab' : ''}>
                          {s.isAbsent
                            ? <span className="ab-tag">AB</span>
                            : `${s.totalObtained}/${s.totalFullMarks}`
                          }
                          <span className="sub-g" style={{ color: gradeColor(s.grade) }}>
                            &nbsp;({s.isAbsent ? 'AB' : s.grade})
                          </span>
                        </td>
                      ))}
                      <td className="td-b">{mark.totalObtained}/{mark.totalFullMarks}</td>
                      <td className="td-pct">{mark.percentage}%</td>
                      <td className="td-b">{mark.gpa}</td>
                      <td style={{ color: gradeColor(mark.grade), fontWeight: 700 }}>{mark.grade}</td>
                      <td>
                        <span className={`res-chip ${mark.result?.toLowerCase().replace(/ /g,'-')}`}>
                          {mark.result}
                        </span>
                      </td>
                      <td>
                        <span className={mark.isPublished ? 'pub-yes' : 'pub-no'}>
                          {mark.isPublished ? '✅ Published' : '⏳ Draft'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════ STATISTICS ═══════ */}
      {tab === 'stats' && selClass && !statsLoading && (
        <div className="mk-section stats-sec">
          <h2>📈 Statistics — {selClassObj?.name} — {selExamLabel} {selYear}</h2>

          {!stats ? (
            <div className="mk-empty">
              <span>📊</span>
              <p>No statistics yet. Save and publish marks first.</p>
              <button className="btn-retry" onClick={() => loadStats(true)}>🔄 Refresh</button>
            </div>
          ) : (
            <>
              <div className="s-grid">
                {[
                  { l: 'Total Students', v: stats.total,               c: '#6366f1' },
                  { l: 'Passed',         v: stats.passed,              c: '#16a34a' },
                  { l: 'Failed',         v: stats.failed,              c: '#dc2626' },
                  { l: 'Pass Rate',      v: `${stats.passRate}%`,      c: '#f59e0b' },
                  { l: 'Avg Score',      v: `${stats.avgPercentage}%`, c: '#0284c7' },
                  { l: 'Avg GPA',        v: stats.avgGpa,              c: '#7c3aed' },
                  { l: 'Published',      v: stats.published,           c: '#059669' },
                  { l: 'Unpublished',    v: stats.notPublished,        c: '#94a3b8' },
                ].map(s => (
                  <div key={s.l} className="s-card">
                    <div className="s-val" style={{ color: s.c }}>{s.v}</div>
                    <div className="s-lbl">{s.l}</div>
                  </div>
                ))}
              </div>

              <div className="s-row2">
                <div className="s-card wide">
                  <div className="s-lbl">🏆 Highest Scorer</div>
                  <div className="s-detail">
                    {stats.highest?.student} — {stats.highest?.percentage}% · GPA: {stats.highest?.gpa} · {stats.highest?.grade}
                  </div>
                </div>
                <div className="s-card wide">
                  <div className="s-lbl">📉 Lowest Scorer</div>
                  <div className="s-detail">
                    {stats.lowest?.student} — {stats.lowest?.percentage}% · GPA: {stats.lowest?.gpa} · {stats.lowest?.grade}
                  </div>
                </div>
              </div>

              <div className="s-card full-w">
                <div className="s-lbl">Grade Distribution</div>
                <div className="g-bars">
                  {['A+','A','A-','B','C','D','F'].map(g => {
                    const count = stats.gradeDistribution?.[g] || 0;
                    const pct   = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={g} className="g-bar-row">
                        <span className="g-lbl" style={{ color: gradeColor(g) }}>{g}</span>
                        <div className="g-bg">
                          <div className="g-fill" style={{ width: `${pct}%`, background: gradeColor(g) }} />
                        </div>
                        <span className="g-cnt">{count} ({pct.toFixed(0)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
