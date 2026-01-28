import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  Award,
  FileText,
  Bell,
  UserCog,
  Settings,
  CalendarDays,
  CalendarX,
  BookOpenCheck,
  UserCheck,
  UsersRound,
  ListChecks,
  Library // ✅ NEW ICON
} from 'lucide-react';
import './DashboardHome.css';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Complete menu items
  const allMenuItems = [
    {
      path: '/dashboard/students',
      icon: <Users />,
      label: 'Students',
      color: '#667eea',
      roles: ['admin', 'teacher']
    },
    {
      path: '/dashboard/teachers',
      icon: <GraduationCap />,
      label: 'Teachers',
      color: '#f093fb',
      roles: ['admin']
    },
    {
      path: '/dashboard/classes',
      icon: <BookOpen />,
      label: 'Classes',
      color: '#4facfe',
      roles: ['admin', 'teacher']
    },
    {
      path: '/dashboard/subjects',
      icon: <BookOpenCheck />,
      label: 'Subjects',
      color: '#43e97b',
      roles: ['admin']
    },
    {
      path: '/dashboard/attendance',
      icon: <ClipboardCheck />,
      label: 'Attendance',
      color: '#fa709a',
      roles: ['admin', 'teacher']
    },
    {
      path: '/dashboard/attendance-report',
      icon: <FileText />,
      label: 'Attendance Report',
      color: '#fee140',
      roles: ['admin', 'teacher']
    },
    {
      path: '/dashboard/class-routine',
      icon: <CalendarDays />,
      label: 'Class Routine',
      color: '#30cfd0',
      roles: ['admin', 'teacher', 'student']
    },
    {
      path: '/dashboard/assignments',
      icon: <FileText />,
      label: 'Assignments',
      color: '#a8edea',
      roles: ['admin', 'teacher', 'student']
    },
    {
      path: '/dashboard/leave-request',
      icon: <CalendarX />,
      label: 'Request Leave',
      color: '#ff6b6b',
      roles: ['teacher', 'student', 'staff', 'librarian', 'accountant']
    },
    {
      path: '/dashboard/my-leaves',
      icon: <FileText />,
      label: 'My Leaves',
      color: '#4ecdc4',
      roles: ['teacher', 'student', 'staff', 'librarian', 'accountant']
    },
    {
      path: '/dashboard/leave-management',
      icon: <CalendarX />,
      label: 'Leave Management',
      color: '#ff8787',
      roles: ['admin']
    },
    {
      path: '/dashboard/payments',
      icon: <CreditCard />,
      label: 'Payments',
      color: '#ffd93d',
      roles: ['admin', 'accountant', 'teacher', 'student']
    },
    {
      path: '/dashboard/marks',
      icon: <Award />,
      label: 'Marks',
      color: '#6bcf7f',
      roles: ['admin', 'teacher', 'student']
    },
    {
      path: '/dashboard/admissions',
      icon: <FileText />,
      label: 'Admissions',
      color: '#95e1d3',
      roles: ['admin', 'teacher']
    },
    {
      path: '/dashboard/notifications',
      icon: <Bell />,
      label: 'Notifications',
      color: '#f38181',
      roles: ['admin', 'teacher', 'student', 'staff', 'librarian', 'accountant']
    },
    // ✅ NEW: Library Management
    {
      path: '/dashboard/library',
      icon: <Library />,
      label: 'Library Management',
      color: '#2196F3',
      roles: ['admin', 'librarian']
    },
    {
      path: '/dashboard/teacher-training',
      icon: <UserCheck />,
      label: 'Teacher Training',
      color: '#8b5cf6',
      roles: ['admin']
    },
    {
      path: '/dashboard/club-management',
      icon: <UsersRound />,
      label: 'Club Management',
      color: '#ec4899',
      roles: ['admin']
    },
    {
      path: '/dashboard/teacher-list',
      icon: <ListChecks />,
      label: 'Teacher List',
      color: '#14b8a6',
      roles: ['admin']
    },
    {
      path: '/dashboard/users',
      icon: <UserCog />,
      label: 'Manage Users',
      color: '#aa96da',
      roles: ['admin']
    },
    // {
    //   path: '/dashboard/website-settings',
    //   icon: <Settings />,
    //   label: 'Website Settings',
    //   color: '#fcbad3',
    //   roles: ['admin']
    // },
    {
      path: '/dashboard/notices',
      icon: <Bell />,
      label: 'Notices',
      color: '#a8d8ea',
      roles: ['admin', 'teacher', 'staff', 'librarian', 'accountant']
    },
    {
      path: '/dashboard/manage-settings',
      icon: <Settings />,
      label: 'Manage Settings',
      color: '#ffcfdf',
      roles: ['admin']
    }
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="dashboard-home-container">
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

// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import {
//   Users,
//   GraduationCap,
//   BookOpen,
//   ClipboardCheck,
//   CreditCard,
//   Award,
//   FileText,
//   BookOpenCheck
// } from 'lucide-react';
// import './DashboardHome.css';

// const DashboardHome = () => {
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);

//   // Role-based menu items
//   const getMenuItems = () => {
//     const allItems = [
//       {
//         path: '/dashboard/students',
//         icon: <Users />,
//         label: 'Students',
//         color: '#667eea',
//         roles: ['admin', 'teacher']
//       },
//       {
//         path: '/dashboard/teachers',
//         icon: <GraduationCap />,
//         label: 'Teachers',
//         color: '#f093fb',
//         roles: ['admin']
//       },
//       {
//         path: '/dashboard/classes',
//         icon: <BookOpen />,
//         label: 'Classes',
//         color: '#4facfe',
//         roles: ['admin', 'teacher']
//       },
//       {
//         path: '/dashboard/subjects',
//         icon: <BookOpenCheck />,
//         label: 'Subjects',
//         color: '#43e97b',
//         roles: ['admin']
//       },
//       {
//         path: '/dashboard/marks',
//         icon: <Award />,
//         label: 'Marks',
//         color: '#fa709a',
//         roles: ['admin', 'teacher', 'student']
//       },
//       {
//         path: '/dashboard/payments',
//         icon: <CreditCard />,
//         label: 'Payments',
//         color: '#fee140',
//         roles: ['admin', 'accountant', 'student']
//       },
//       {
//         path: '/dashboard/admissions',
//         icon: <FileText />,
//         label: 'Admissions',
//         color: '#30cfd0',
//         roles: ['admin', 'teacher']
//       },
//       {
//         path: '/dashboard/attendance',
//         icon: <ClipboardCheck />,
//         label: 'Attendance',
//         color: '#a8edea',
//         roles: ['admin', 'teacher']
//       }
//     ];

//     return allItems.filter(item => item.roles.includes(user?.role));
//   };

//   const menuItems = getMenuItems();

//   return (
//     <div className="dashboard-home-container">
//       <div className="welcome-header">
//         <h1>Welcome, {user?.name}! 👋</h1>
//         <p>Select an option to get started</p>
//       </div>

//       <div className="dashboard-cards-grid">
//         {menuItems.map((item, index) => (
//           <div
//             key={index}
//             className="dashboard-card"
//             onClick={() => navigate(item.path)}
//             style={{ '--card-color': item.color }}
//           >
//             <div className="card-icon" style={{ background: item.color }}>
//               {item.icon}
//             </div>
//             <h3>{item.label}</h3>
//             <div className="card-arrow">→</div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default DashboardHome;