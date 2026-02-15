import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  Award,
  Settings,
  LogOut,
  Bell,
  FileText,
  UserCog,
  CalendarDays,
  CalendarX,
  Library,
  UserCheck,
  UsersRound,
  ListChecks,
  Building2  // ✅ NEW ICON for Governing Body
} from 'lucide-react';

import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: <LayoutDashboard />,
      label: 'Dashboard',
      roles: ['admin', 'teacher', 'student', 'staff', 'librarian', 'accountant']
    },

    // Academic Management
    {
      path: '/dashboard/students',
      icon: <Users />,
      label: 'Students',
      roles: ['admin', 'teacher']
    },
    {
      path: '/dashboard/teachers',
      icon: <GraduationCap />,
      label: 'Teachers',
      roles: ['admin']
    },
    {
      path: '/dashboard/classes',
      icon: <BookOpen />,
      label: 'Classes',
      roles: ['admin', 'teacher']
    },

    // Subjects
    {
      path: '/dashboard/subjects',
      icon: <BookOpen />,
      label: 'Subjects',
      roles: ['admin']
    },

    // Attendance
    {
      path: '/dashboard/attendance',
      icon: <ClipboardCheck />,
      label: 'Attendance',
      roles: ['admin', 'teacher']
    },
    {
      path: '/dashboard/attendance-report',
      icon: <FileText />,
      label: 'Attendance Report',
      roles: ['admin', 'teacher']
    },

    // Class Routine
    {
      path: '/dashboard/class-routine',
      icon: <CalendarDays />,
      label: 'Class Routine',
      roles: ['admin', 'teacher', 'student']
    },

    // Assignments
    {
      path: '/dashboard/assignments',
      icon: <FileText />,
      label: 'Assignments',
      roles: ['admin', 'teacher', 'student']
    },

    // Leave Management
    {
      path: '/dashboard/leave-request',
      icon: <CalendarX />,
      label: 'Request Leave',
      roles: ['teacher', 'student', 'staff', 'librarian', 'accountant']
    },
    {
      path: '/dashboard/my-leaves',
      icon: <FileText />,
      label: 'My Leaves',
      roles: ['teacher', 'student', 'staff', 'librarian', 'accountant']
    },
    {
      path: '/dashboard/leave-management',
      icon: <CalendarX />,
      label: 'Leave Management',
      roles: ['admin']
    },

    // Payments
    {
      path: '/dashboard/payments',
      icon: <CreditCard />,
      label: 'Payments',
      roles: ['admin', 'accountant', 'teacher', 'student']
    },

    // Marks
    {
      path: '/dashboard/marks',
      icon: <Award />,
      label: 'Marks',
      roles: ['admin', 'teacher', 'student']
    },

    // Admissions
    {
      path: '/dashboard/admissions',
      icon: <FileText />,
      label: 'Admissions',
      roles: ['admin', 'teacher']
    },

    // Library Management
    {
      path: '/dashboard/library',
      icon: <Library />,
      label: 'Library',
      roles: ['admin', 'librarian']
    },

    // Notifications
    {
      path: '/dashboard/notifications',
      icon: <Bell />,
      label: 'Notifications',
      roles: ['admin', 'teacher', 'student', 'staff', 'librarian', 'accountant']
    },

    // ========== ADMINISTRATION SECTION ==========
    
    // ✅ NEW: Governing Body
    {
      path: '/dashboard/governing-body',
      icon: <Building2 />,
      label: 'Governing Body',
      roles: ['admin']
    },

    // Teacher Training
    {
      path: '/dashboard/teacher-training',
      icon: <UserCheck />,
      label: 'Teacher Training',
      roles: ['admin']
    },

    // Club Management
    {
      path: '/dashboard/club-management',
      icon: <UsersRound />,
      label: 'Club Management',
      roles: ['admin']
    },

    // Teacher List
    {
      path: '/dashboard/teacher-list',
      icon: <ListChecks />,
      label: 'Teacher List',
      roles: ['admin']
    },

    // ========== SYSTEM MANAGEMENT ==========

    // User Management
    {
      path: '/dashboard/users',
      icon: <UserCog />,
      label: 'Manage Users',
      roles: ['admin']
    },

    // Website Settings
    {
      path: '/dashboard/website-settings',
      icon: <Settings />,
      label: 'Website',
      roles: ['admin']
    },

    // Notices
    {
      path: '/dashboard/notices',
      icon: <Bell />,
      label: 'Notices',
      roles: ['admin', 'teacher', 'staff', 'librarian', 'accountant']
    },

    // Manage Settings
    {
      path: '/dashboard/manage-settings',
      icon: <Settings />,
      label: 'Manage Settings',
      roles: ['admin']
    }
  ];

  const filteredMenu = menuItems.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>{isOpen ? 'MALKHANAGAR COLLEGE' : 'M'}</h2>
      </div>

      <nav className="sidebar-nav">
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
            end={item.path === '/dashboard'}
          >
            <span className="nav-icon">{item.icon}</span>
            {isOpen && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="nav-item logout-btn">
          <span className="nav-icon"><LogOut /></span>
          {isOpen && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;


// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { logout } from '../redux/slices/authSlice';
// import {
//   LayoutDashboard,
//   Users,
//   GraduationCap,
//   BookOpen,
//   ClipboardCheck,
//   CreditCard,
//   Award,
//   Settings,
//   LogOut,
//   Bell,
//   FileText,
//   UserCog,
//   CalendarDays,
//   CalendarX
// } from 'lucide-react';

// import './Sidebar.css';

// const Sidebar = ({ isOpen, toggleSidebar }) => {
//   const { user } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();

//   const handleLogout = () => {
//     dispatch(logout());
//     window.location.href = '/login';
//   };

//   const menuItems = [
//     {
//       path: '/dashboard',
//       icon: <LayoutDashboard />,
//       label: 'Dashboard',
//       roles: ['admin', 'teacher', 'student', 'staff', 'librarian', 'accountant']
//     },

//     // Academic Management
//     {
//       path: '/dashboard/students',
//       icon: <Users />,
//       label: 'Students',
//       roles: ['admin', 'teacher']
//     },
//     {
//       path: '/dashboard/teachers',
//       icon: <GraduationCap />,
//       label: 'Teachers',
//       roles: ['admin']
//     },
//     {
//       path: '/dashboard/classes',
//       icon: <BookOpen />,
//       label: 'Classes',
//       roles: ['admin', 'teacher']
//     },

//     // Subjects
//     {
//       path: '/dashboard/subjects',
//       icon: <BookOpen />,
//       label: 'Subjects',
//       roles: ['admin']
//     },

//     // Attendance
//     {
//       path: '/dashboard/attendance',
//       icon: <ClipboardCheck />,
//       label: 'Attendance',
//       roles: ['admin', 'teacher']
//     },
//     {
//       path: '/dashboard/attendance-report',
//       icon: <FileText />,
//       label: 'Attendance Report',
//       roles: ['admin', 'teacher']
//     },

//     // Class Routine
//     {
//       path: '/dashboard/class-routine',
//       icon: <CalendarDays />,
//       label: 'Class Routine',
//       roles: ['admin', 'teacher', 'student']
//     },

//     // Assignments
//     {
//       path: '/dashboard/assignments',
//       icon: <FileText />,
//       label: 'Assignments',
//       roles: ['admin', 'teacher', 'student']
//     },

//     // ✅ Leave Management (Added)
//     {
//       path: '/dashboard/leave-request',
//       icon: <CalendarX />,
//       label: 'Request Leave',
//       roles: ['teacher', 'student', 'staff', 'librarian', 'accountant']
//     },
//     {
//       path: '/dashboard/my-leaves',
//       icon: <FileText />,
//       label: 'My Leaves',
//       roles: ['teacher', 'student', 'staff', 'librarian', 'accountant']
//     },
//     {
//       path: '/dashboard/leave-management',
//       icon: <CalendarX />,
//       label: 'Leave Management',
//       roles: ['admin']
//     },

//     // Payments
//     {
//       path: '/dashboard/payments',
//       icon: <CreditCard />,
//       label: 'Payments',
//       roles: ['admin', 'accountant', 'teacher', 'student']
//     },

//     // Marks
//     {
//       path: '/dashboard/marks',
//       icon: <Award />,
//       label: 'Marks',
//       roles: ['admin', 'teacher', 'student']
//     },

//     // Admissions
//     {
//       path: '/dashboard/admissions',
//       icon: <FileText />,
//       label: 'Admissions',
//       roles: ['admin', 'teacher']
//     },

//     // Notifications
//     {
//       path: '/dashboard/notifications',
//       icon: <Bell />,
//       label: 'Notifications',
//       roles: ['admin', 'teacher', 'student', 'staff', 'librarian', 'accountant']
//     },

//     // User Management
//     {
//       path: '/dashboard/users',
//       icon: <UserCog />,
//       label: 'Manage Users',
//       roles: ['admin']
//     },

//     // Website Settings
//     {
//       path: '/dashboard/website-settings',
//       icon: <Settings />,
//       label: 'Website',
//       roles: ['admin']
//     },

//     // Notices
//     {
//       path: '/dashboard/notices',
//       icon: <Bell />,
//       label: 'Notices',
//       roles: ['admin', 'teacher', 'staff', 'librarian', 'accountant']
//     },

//     // Manage Settings
//     {
//       path: '/dashboard/manage-settings',
//       icon: <Settings />,
//       label: 'Manage Settings',
//       roles: ['admin']
//     }
//   ];

//   const filteredMenu = menuItems.filter(item =>
//     item.roles.includes(user?.role)
//   );

//   return (
//     <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
//       <div className="sidebar-header">
//         <h2>{isOpen ? 'MALKHANAGAR COLLEGE' : 'M'}</h2>
//       </div>

//       <nav className="sidebar-nav">
//         {filteredMenu.map((item) => (
//           <NavLink
//             key={item.path}
//             to={item.path}
//             className={({ isActive }) =>
//               `nav-item ${isActive ? 'active' : ''}`
//             }
//             end={item.path === '/dashboard'}
//           >
//             <span className="nav-icon">{item.icon}</span>
//             {isOpen && <span className="nav-label">{item.label}</span>}
//           </NavLink>
//         ))}
//       </nav>

//       <div className="sidebar-footer">
//         <button onClick={handleLogout} className="nav-item logout-btn">
//           <span className="nav-icon"><LogOut /></span>
//           {isOpen && <span className="nav-label">Logout</span>}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;




// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { logout } from '../redux/slices/authSlice';
// import {
//   LayoutDashboard,
//   Users,
//   GraduationCap,
//   BookOpen,
//   ClipboardCheck,
//   CreditCard,
//   Award,
//   Settings,
//   LogOut,
//   Bell,
//   FileText,
//   UserCog,
//   CalendarDays
// } from 'lucide-react';

// import './Sidebar.css';

// const Sidebar = ({ isOpen, toggleSidebar }) => {
//   const { user } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();

//   const handleLogout = () => {
//     dispatch(logout());
//     window.location.href = '/login';
//   };

//   const menuItems = [
//     { 
//       path: '/dashboard', 
//       icon: <LayoutDashboard />, 
//       label: 'Dashboard', 
//       roles: ['admin', 'teacher', 'student', 'staff', 'librarian', 'accountant'] 
//     },

//     // Academic Management
//     { 
//       path: '/dashboard/students', 
//       icon: <Users />, 
//       label: 'Students', 
//       roles: ['admin', 'teacher'] 
//     },
//     { 
//       path: '/dashboard/teachers', 
//       icon: <GraduationCap />, 
//       label: 'Teachers', 
//       roles: ['admin'] 
//     },
//     { 
//       path: '/dashboard/classes', 
//       icon: <BookOpen />, 
//       label: 'Classes', 
//       roles: ['admin', 'teacher'] 
//     },

//     // Subjects - Admin only
//     { 
//       path: '/dashboard/subjects', 
//       icon: <BookOpen />, 
//       label: 'Subjects', 
//       roles: ['admin'] 
//     },

//     // Attendance
//     { 
//       path: '/dashboard/attendance', 
//       icon: <ClipboardCheck />, 
//       label: 'Attendance', 
//       roles: ['admin', 'teacher'] 
//     },
//     { 
//       path: '/dashboard/attendance-report', 
//       icon: <FileText />, 
//       label: 'Attendance Report', 
//       roles: ['admin', 'teacher'] 
//     },

//     // Class Routine
//     {
//       path: '/dashboard/class-routine',
//       icon: <CalendarDays />,
//       label: 'Class Routine',
//       roles: ['admin', 'teacher', 'student']
//     },

//     // ✅ Assignments (Added)
//     { 
//       path: '/dashboard/assignments', 
//       icon: <FileText />, 
//       label: 'Assignments', 
//       roles: ['admin', 'teacher', 'student'] 
//     },

//     // Payments
//     { 
//       path: '/dashboard/payments', 
//       icon: <CreditCard />, 
//       label: 'Payments', 
//       roles: ['admin', 'accountant', 'teacher', 'student'] 
//     },

//     // Marks
//     { 
//       path: '/dashboard/marks', 
//       icon: <Award />, 
//       label: 'Marks', 
//       roles: ['admin', 'teacher', 'student'] 
//     },

//     // Admissions
//     { 
//       path: '/dashboard/admissions', 
//       icon: <FileText />, 
//       label: 'Admissions', 
//       roles: ['admin', 'teacher'] 
//     },

//     // Notifications
//     { 
//       path: '/dashboard/notifications', 
//       icon: <Bell />, 
//       label: 'Notifications', 
//       roles: ['admin', 'teacher', 'student', 'staff', 'librarian', 'accountant'] 
//     },

//     // User Management
//     { 
//       path: '/dashboard/users', 
//       icon: <UserCog />, 
//       label: 'Manage Users', 
//       roles: ['admin'] 
//     },

//     // Website Settings
//     { 
//       path: '/dashboard/website-settings', 
//       icon: <Settings />, 
//       label: 'Website', 
//       roles: ['admin'] 
//     },

//     // Notices
//     { 
//       path: '/dashboard/notices', 
//       icon: <Bell />, 
//       label: 'Notices', 
//       roles: ['admin', 'teacher', 'staff', 'librarian', 'accountant'] 
//     },

//     // Manage Settings
//     { 
//       path: '/dashboard/manage-settings', 
//       icon: <Settings />, 
//       label: 'Manage Settings', 
//       roles: ['admin'] 
//     }
//   ];

//   const filteredMenu = menuItems.filter(item =>
//     item.roles.includes(user?.role)
//   );

//   return (
//     <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
//       <div className="sidebar-header">
//         <h2>{isOpen ? 'MALKHANAGAR COLLEGE' : 'M'}</h2>
//       </div>

//       <nav className="sidebar-nav">
//         {filteredMenu.map((item) => (
//           <NavLink
//             key={item.path}
//             to={item.path}
//             className={({ isActive }) =>
//               `nav-item ${isActive ? 'active' : ''}`
//             }
//             end={item.path === '/dashboard'}
//           >
//             <span className="nav-icon">{item.icon}</span>
//             {isOpen && <span className="nav-label">{item.label}</span>}
//           </NavLink>
//         ))}
//       </nav>

//       <div className="sidebar-footer">
//         <button onClick={handleLogout} className="nav-item logout-btn">
//           <span className="nav-icon"><LogOut /></span>
//           {isOpen && <span className="nav-label">Logout</span>}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
