import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import DashboardHome from '../components/DashboardHome';
import Students from './Students';
import StudentForm from './StudentForm';
import Teachers from './Teachers';
import TeacherForm from './TeacherForm';
import Classes from './Classes';
import AddClass from './AddClass';
import EditClass from './EditClass';
import Attendance from './Attendance';
import AttendanceReport from './AttendanceReport';
import Payments from './Payments';
import Marks from './Marks';
import Notifications from './Notifications';
import WebsiteSettings from './WebsiteSettings';
import Notices from './Notices';
import ManageSettings from './ManageSettings';
import ManageUsers from './ManageUsers';
import AddUser from './AddUser';
import EditUser from './EditUser';
import StaffDashboard from './StaffDashboard';
import LibrarianDashboard from './LibrarianDashboard';
import AccountantDashboard from './AccountantDashboard';
import Subjects from './Subjects';
import ClassRoutine from './ClassRoutine';
import ClassRoutineView from './ClassRoutineView';
import StudentRoutineView from '../components/StudentRoutineView';
import TeacherRoutineView from '../components/TeacherRoutineView';
import Assignments from './Assignments';
import AddAssignment from './AddAssignment';
import StudentAssignments from './StudentAssignments';
import LeaveRequest from './LeaveRequest';
import MyLeaves from './MyLeaves';
import LeaveManagement from './LeaveManagement';

// ✅ NEW IMPORTS - Teacher Training, Club, Teacher List
import TeacherTrainingManagement from './TeacherTrainingManagement';
import ClubManagement from './ClubManagement';
import TeacherListManagement from './TeacherListManagement';

import './Dashboard.css';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const getDashboardHome = () => {
    switch (user?.role) {
      case 'staff':
        return <StaffDashboard />;
      case 'librarian':
        return <LibrarianDashboard />;
      case 'accountant':
        return <AccountantDashboard />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />

      <div className="dashboard-content-area">
        <Routes>
          <Route path="/" element={getDashboardHome()} />

          {/* ====================================== */}
          {/* STUDENT ROUTES - Admin & Teacher */}
          {/* ====================================== */}
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <>
              <Route path="/students" element={<Students />} />
              <Route path="/students/add" element={<StudentForm />} />
              <Route path="/students/edit/:id" element={<StudentForm />} />
            </>
          )}

          {/* ====================================== */}
          {/* TEACHER ROUTES - Admin Only */}
          {/* ====================================== */}
          {user?.role === 'admin' && (
            <>
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/teachers/add" element={<TeacherForm />} />
              <Route path="/teachers/edit/:id" element={<TeacherForm />} />
            </>
          )}

          {/* ====================================== */}
          {/* CLASS ROUTES - Admin & Teacher */}
          {/* ====================================== */}
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <>
              <Route path="/classes" element={<Classes />} />
              <Route path="/classes/add" element={<AddClass />} />
              <Route path="/classes/edit/:id" element={<EditClass />} />
            </>
          )}

          {/* ====================================== */}
          {/* ATTENDANCE ROUTES - Admin & Teacher */}
          {/* ====================================== */}
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <>
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/attendance-report" element={<AttendanceReport />} />
            </>
          )}

          {/* ====================================== */}
          {/* PAYMENT ROUTES */}
          {/* ====================================== */}
          {(user?.role === 'admin' || user?.role === 'accountant' || user?.role === 'teacher' || user?.role === 'student') && (
            <Route path="/payments" element={<Payments />} />
          )}

          {/* ====================================== */}
          {/* MARKS ROUTES */}
          {/* ====================================== */}
          {(user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'student') && (
            <Route path="/marks" element={<Marks />} />
          )}

          {/* ====================================== */}
          {/* NOTIFICATION ROUTES - All Users */}
          {/* ====================================== */}
          <Route path="/notifications" element={<Notifications />} />

          {/* ====================================== */}
          {/* WEBSITE SETTINGS - Admin Only */}
          {/* ====================================== */}
          {user?.role === 'admin' && (
            <>
              <Route path="/website-settings" element={<WebsiteSettings />} />
              <Route path="/manage-settings" element={<ManageSettings />} />
            </>
          )}

          {/* ====================================== */}
          {/* NOTICE ROUTES */}
          {/* ====================================== */}
          {(user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'staff' || user?.role === 'librarian' || user?.role === 'accountant') && (
            <Route path="/notices" element={<Notices />} />
          )}

          {/* ====================================== */}
          {/* SUBJECT ROUTES - Admin Only */}
          {/* ====================================== */}
          {user?.role === 'admin' && (
            <Route path="/subjects" element={<Subjects />} />
          )}

          {/* ====================================== */}
          {/* ASSIGNMENT ROUTES - Admin & Teacher */}
          {/* ====================================== */}
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <>
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/assignments/add" element={<AddAssignment />} />
            </>
          )}

          {/* ====================================== */}
          {/* ASSIGNMENT ROUTES - Student */}
          {/* ====================================== */}
          {user?.role === 'student' && (
            <Route path="/assignments" element={<StudentAssignments />} />
          )}

          {/* ====================================== */}
          {/* LEAVE ROUTES - Non-Admin */}
          {/* ====================================== */}
          {user?.role !== 'admin' && (
            <>
              <Route path="/leave-request" element={<LeaveRequest />} />
              <Route path="/my-leaves" element={<MyLeaves />} />
            </>
          )}

          {/* ====================================== */}
          {/* LEAVE MANAGEMENT - Admin Only */}
          {/* ====================================== */}
          {user?.role === 'admin' && (
            <Route path="/leave-management" element={<LeaveManagement />} />
          )}

          {/* ====================================== */}
          {/* ADMISSIONS - Admin & Teacher */}
          {/* ====================================== */}
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <Route path="/admissions" element={<Students />} />
          )}

          {/* ====================================== */}
          {/* CLASS ROUTINE ROUTES - Admin */}
          {/* ====================================== */}
          {user?.role === 'admin' && (
            <>
              <Route path="/class-routine" element={<ClassRoutine />} />
              <Route path="/class-routine/:id" element={<ClassRoutineView />} />
            </>
          )}

          {/* ====================================== */}
          {/* CLASS ROUTINE - Teacher */}
          {/* ====================================== */}
          {user?.role === 'teacher' && (
            <Route path="/class-routine" element={<TeacherRoutineView />} />
          )}

          {/* ====================================== */}
          {/* CLASS ROUTINE - Student */}
          {/* ====================================== */}
          {user?.role === 'student' && (
            <Route path="/class-routine" element={<StudentRoutineView />} />
          )}

          {/* ====================================== */}
          {/* ✅ NEW: TEACHER TRAINING - Admin Only */}
          {/* ====================================== */}
          {user?.role === 'admin' && (
            <Route path="/teacher-training" element={<TeacherTrainingManagement />} />
          )}

          {/* ====================================== */}
          {/* ✅ NEW: CLUB MANAGEMENT - Admin Only */}
          {/* ====================================== */}
          {user?.role === 'admin' && (
            <Route path="/club-management" element={<ClubManagement />} />
          )}

          {/* ====================================== */}
          {/* ✅ NEW: TEACHER LIST - Admin Only */}
          {/* ====================================== */}
          {user?.role === 'admin' && (
            <Route path="/teacher-list" element={<TeacherListManagement />} />
          )}

          {/* ====================================== */}
          {/* USER MANAGEMENT - Admin Only */}
          {/* ====================================== */}
          {user?.role === 'admin' && (
            <>
              <Route path="/users" element={<ManageUsers />} />
              <Route path="/users/add" element={<AddUser />} />
              <Route path="/users/edit/:id" element={<EditUser />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;