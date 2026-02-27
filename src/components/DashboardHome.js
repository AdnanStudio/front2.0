import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardCheck,
  CreditCard, Award, FileText, Bell, UserCog, Settings, CalendarDays,
  CalendarX, BookOpenCheck, UserCheck, UsersRound, ListChecks, Library, Building2
} from 'lucide-react';
import api from '../services/api';
import './DashboardHome.css';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Fetch live stats for admin ─────────────────────────────────────────────
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const [studentsRes, teachersRes, classesRes, paymentsRes] = await Promise.allSettled([
        api.get('/students'),
        api.get('/teachers'),
        api.get('/classes'),
        api.get('/payments'),
      ]);

      setStats({
        students : studentsRes.status  === 'fulfilled' ? (studentsRes.value.data?.count  || studentsRes.value.data?.data?.length  || 0) : 0,
        teachers : teachersRes.status  === 'fulfilled' ? (teachersRes.value.data?.count  || teachersRes.value.data?.data?.length  || 0) : 0,
        classes  : classesRes.status   === 'fulfilled' ? (classesRes.value.data?.count   || classesRes.value.data?.data?.length   || 0) : 0,
        payments : paymentsRes.status  === 'fulfilled' ? (paymentsRes.value.data?.count  || paymentsRes.value.data?.data?.length  || 0) : 0,
      });
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // ── Menu items ─────────────────────────────────────────────────────────────
  const allMenuItems = [
    { path: '/dashboard/students',         icon: <Users />,         label: 'Students',         color: '#667eea', roles: ['admin', 'teacher'] },
    { path: '/dashboard/teachers',         icon: <GraduationCap />, label: 'Teachers',         color: '#f093fb', roles: ['admin'] },
    { path: '/dashboard/classes',          icon: <BookOpen />,      label: 'Classes',          color: '#4facfe', roles: ['admin', 'teacher'] },
    { path: '/dashboard/subjects',         icon: <BookOpenCheck />, label: 'Subjects',         color: '#43e97b', roles: ['admin'] },
    { path: '/dashboard/attendance',       icon: <ClipboardCheck />,label: 'Attendance',       color: '#fa709a', roles: ['admin', 'teacher'] },
    { path: '/dashboard/attendance-report',icon: <FileText />,      label: 'Attendance Report',color: '#fee140', roles: ['admin', 'teacher'] },
    { path: '/dashboard/class-routine',    icon: <CalendarDays />,  label: 'Class Routine',    color: '#30cfd0', roles: ['admin', 'teacher', 'student'] },
    { path: '/dashboard/assignments',      icon: <FileText />,      label: 'Assignments',      color: '#a8edea', roles: ['admin', 'teacher', 'student'] },
    { path: '/dashboard/leave-request',    icon: <CalendarX />,     label: 'Request Leave',    color: '#ff6b6b', roles: ['teacher', 'student', 'staff', 'librarian', 'accountant'] },
    { path: '/dashboard/my-leaves',        icon: <FileText />,      label: 'My Leaves',        color: '#4ecdc4', roles: ['teacher', 'student', 'staff', 'librarian', 'accountant'] },
    { path: '/dashboard/leave-management', icon: <CalendarX />,     label: 'Leave Management', color: '#ff8787', roles: ['admin'] },
    { path: '/dashboard/payments',         icon: <CreditCard />,    label: 'Payments',         color: '#ffd93d', roles: ['admin', 'accountant', 'teacher', 'student'] },
    { path: '/dashboard/marks',            icon: <Award />,         label: 'Results',            color: '#6bcf7f', roles: ['admin', 'teacher', 'student'] },
    { path: '/dashboard/admissions',       icon: <FileText />,      label: 'Admissions',       color: '#95e1d3', roles: ['admin', 'teacher'] },
    { path: '/dashboard/notifications',    icon: <Bell />,          label: 'Notifications',    color: '#f38181', roles: ['admin', 'teacher', 'student', 'staff', 'librarian', 'accountant'] },
    { path: '/dashboard/library',          icon: <Library />,       label: 'Library Management',color: '#2196F3',roles: ['admin', 'librarian'] },
    { path: '/dashboard/governing-body',   icon: <Building2 />,     label: 'Governing Body',   color: '#3b82f6', roles: ['admin'] },
    { path: '/dashboard/teacher-training', icon: <UserCheck />,     label: 'Teacher Training', color: '#8b5cf6', roles: ['admin'] },
    { path: '/dashboard/club-management',  icon: <UsersRound />,    label: 'Club Management',  color: '#ec4899', roles: ['admin'] },
    { path: '/dashboard/teacher-list',     icon: <ListChecks />,    label: 'Teacher List',     color: '#14b8a6', roles: ['admin'] },
    { path: '/dashboard/users',            icon: <UserCog />,       label: 'Manage Users',     color: '#aa96da', roles: ['admin'] },
    { path: '/dashboard/notices',          icon: <Bell />,          label: 'Notices',          color: '#a8d8ea', roles: ['admin', 'teacher', 'staff', 'librarian', 'accountant'] },
    { path: '/dashboard/manage-settings',  icon: <Settings />,      label: 'Manage Settings',  color: '#ffcfdf', roles: ['admin'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role));

  // ── Admin Stats Cards ──────────────────────────────────────────────────────
  const adminStatCards = stats ? [
    { label: 'মোট শিক্ষার্থী',  value: stats.students, icon: '👨🏻‍🎓', color: '#667eea', path: '/dashboard/students' },
    { label: 'মোট শিক্ষক',      value: stats.teachers, icon: '👨🏻‍🏫', color: '#f093fb', path: '/dashboard/teachers' },
    { label: 'মোট ক্লাস',       value: stats.classes,  icon: '📚', color: '#4facfe', path: '/dashboard/classes' },
    { label: 'মোট পেমেন্ট',    value: stats.payments, icon: '💳', color: '#ffd93d', path: '/dashboard/payments' },
  ] : [];

  return (
    <div className="dashboard-home-container">

      {/* ── Welcome Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #fff 0%, #fff 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 28, color: '#000',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '2px 4px 2px rgba(102,126,234,0.1)'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
            {user?.name}
          </h2>
          <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: 15 }}>
            {user?.role === 'admin'    ? 'Admin Account' :
             user?.role === 'teacher'  ? 'Teacher Account' :
             user?.role === 'student'  ? 'Student Account' :
             user?.role === 'staff'  ? 'Staff Account' :
             user?.role === 'accountant'  ? 'Accountant Account' :
             user?.role === 'librarian'? 'আপনি লাইব্রেরিয়ান হিসেবে লগইন করেছেন' :
             'ড্যাশবোর্ডে আপনাকে স্বাগতম'}
          </p>
        </div>
        <div style={{ fontSize: 48, opacity: 0.7 }}>
          {user?.role === 'admin' ? '👨🏻‍💼' :
           user?.role === 'teacher' ? '👨🏻‍🏫' :
           user?.role === 'student' ? '👨🏻‍🎓' : '🙍🏻‍♂️'}
        </div>
      </div>

      {/* ── Admin Live Stats ── */}
      {user?.role === 'admin' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16, marginBottom: 28
        }}>
          {statsLoading ? (
            [1,2,3,4].map(i => (
              <div key={i} style={{ background: '#f3f4f6', borderRadius: 12, height: 100,
                animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))
          ) : adminStatCards.map(s => (
            <div key={s.label}
              onClick={() => navigate(s.path)}
              style={{
                background: '#fff', borderRadius: 12, padding: '20px 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer',
                borderLeft: `5px solid ${s.color}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex', alignItems: 'center', gap: 16
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'; }}
            >
              <div style={{ fontSize: 36 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Menu Grid ── */}
      
      <div className="dashboard-cards-grid">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="dashboard-card"
            onClick={() => navigate(item.path)}
            style={{ '--card-color': item.color }}
          >
            <div className="card-icon" style={{ background: item.color }}>
              {item.icon}
            </div>
            <h3>{item.label}</h3>
            <div className="card-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;
