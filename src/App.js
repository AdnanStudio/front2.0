// src/App.js
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';

import './App.css';

// ── Eagerly loaded core pages ──────────────────────────────────────────────
import PrivateRoute    from './components/PrivateRoute';
import PublicHome      from './pages/PublicHome';
import Login           from './pages/Login';
import Register        from './pages/Register';
import Dashboard       from './pages/Dashboard';
import AdmissionForm   from './pages/AdmissionForm';
import AdmissionList   from './pages/AdmissionList';
import InstallPWAGuide from './components/InstallPWAGuide';

// ── Layout wrapper ─────────────────────────────────────────────────────────
import PublicLayout from './components/PublicLayout';

// ── Dashboard tool pages (eagerly loaded) ─────────────────────────────────
import AdmitCardGenerator  from './pages/AdmitCardGenerator';
import ResultCardGenerator from './pages/ResultCardGenerator';
import MarkManagement      from './pages/MarkManagement';    // ✅ NEW
import StudentResults      from './pages/StudentResults';    // ✅ NEW

// ── Public content pages (lazy loaded) ────────────────────────────────────
const CollegeHistory      = lazy(() => import('./content/about/CollegeHistory'));
const MissionVision       = lazy(() => import('./content/about/MissionVision'));
const Achievements        = lazy(() => import('./content/about/Achievements'));
const Facilities          = lazy(() => import('./content/about/Facilities'));

const Teachers            = lazy(() => import('./content/administration/Teachers'));
const GoverningBody       = lazy(() => import('./content/administration/GoverningBody'));
const TeacherTraining     = lazy(() => import('./content/administration/TeacherTraining'));
const ClubManagementPub   = lazy(() => import('./content/administration/ClubManagement'));

const Departments         = lazy(() => import('./content/academic/Departments'));
const Programs            = lazy(() => import('./content/academic/Programs'));
const Syllabus            = lazy(() => import('./content/academic/Syllabus'));
const AcademicCalendar    = lazy(() => import('./content/academic/AcademicCalendar'));

const ApplyOnline           = lazy(() => import('./content/admission/ApplyOnline'));
const AdmissionRequirements = lazy(() => import('./content/admission/Requirements'));
const AdmissionProcedure    = lazy(() => import('./content/admission/AdmissionProcedure'));

const PhotoGallery        = lazy(() => import('./content/gallery/PhotoGallery'));
const VideoGallery        = lazy(() => import('./content/gallery/VideoGallery'));
const Events              = lazy(() => import('./content/gallery/Events'));

const NoticePage          = lazy(() => import('./content/Notice'));
const ContactPage         = lazy(() => import('./content/Contact'));

const FacultyCouncil      = lazy(() => import('./content/pages/FacultyCouncil'));
const Organogram          = lazy(() => import('./content/pages/Organogram'));
const StaffPage           = lazy(() => import('./content/pages/StaffPage'));
const PrincipalPage       = lazy(() => import('./content/pages/PrincipalPage'));
const HscRoutine          = lazy(() => import('./content/pages/HscRoutine'));
const DegreePassPage      = lazy(() => import('./content/pages/DegreePassPage'));
const DegreeHonorsPage    = lazy(() => import('./content/pages/DegreeHonorsPage'));
const AdmissionHsc        = lazy(() => import('./content/pages/AdmissionHsc'));
const AdmissionDegreePass = lazy(() => import('./content/pages/AdmissionDegreePass'));
const AdmissionDegree     = lazy(() => import('./content/pages/AdmissionDegree'));
const FormHsc             = lazy(() => import('./content/pages/FormHsc'));
const FormDegreePass      = lazy(() => import('./content/pages/FormDegreePass'));
const FormDegree          = lazy(() => import('./content/pages/FormDegree'));
const ResultAdmitCard     = lazy(() => import('./content/pages/ResultAdmitCard'));
const ResultInternal      = lazy(() => import('./content/pages/ResultInternal'));
const ResultHsc           = lazy(() => import('./content/pages/ResultHsc'));
const ResultDegreePass    = lazy(() => import('./content/pages/ResultDegreePass'));
const ResultDegree        = lazy(() => import('./content/pages/ResultDegree'));
const EasyCollegeMate     = lazy(() => import('./content/pages/EasyCollegeMate'));
const LibraryPage         = lazy(() => import('./content/pages/LibraryPage'));
const ELibraryPage        = lazy(() => import('./content/pages/ELibraryPage'));

// ── Fallback spinner ───────────────────────────────────────────────────────
function PageLoading() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 40, height: 40,
        border: '4px solid #e0e0e0',
        borderTopColor: '#2e7d32',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}

// ── Public layout wrapper ──────────────────────────────────────────────────
function Pub({ children }) {
  return (
    <Suspense fallback={<PageLoading />}>
      <PublicLayout>{children}</PublicLayout>
    </Suspense>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Provider store={store}>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: '#363636', color: '#fff' },
            success: { duration: 3000, iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />

        <Routes>

          {/* ══ AUTH ══════════════════════════════════════════════════════ */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ══ DASHBOARD — specific routes BEFORE the wildcard /dashboard/* ══
              React Router v6 matches in order, so more specific paths first.  */}

          {/* Admissions list */}
          <Route
            path="/dashboard/admissions"
            element={<PrivateRoute><AdmissionList /></PrivateRoute>}
          />

          {/* Student tools */}
          <Route
            path="/dashboard/students/admit-cards"
            element={<PrivateRoute><AdmitCardGenerator /></PrivateRoute>}
          />
          <Route
            path="/dashboard/students/result-cards"
            element={<PrivateRoute><ResultCardGenerator /></PrivateRoute>}
          />

          {/* ✅ Mark Management — admin/teacher view of all results */}
          <Route
            path="/dashboard/marks"
            element={<PrivateRoute><MarkManagement /></PrivateRoute>}
          />

          {/* ✅ My Results — student sees own published results */}
          <Route
            path="/dashboard/my-results"
            element={<PrivateRoute><StudentResults /></PrivateRoute>}
          />

          {/* Dashboard wildcard — everything else goes to Dashboard layout */}
          <Route
            path="/dashboard/*"
            element={<PrivateRoute><Dashboard /></PrivateRoute>}
          />

          {/* ══ MISC ══════════════════════════════════════════════════════ */}
          <Route path="/admission-form" element={<AdmissionForm />} />
          <Route path="/install-guide"  element={<InstallPWAGuide />} />

          {/* ══ ABOUT ═════════════════════════════════════════════════════ */}
          <Route path="/about/faculty-council" element={<Pub><FacultyCouncil /></Pub>} />
          <Route path="/about/organogram"      element={<Pub><Organogram /></Pub>} />
          <Route path="/about/staff"           element={<Pub><StaffPage /></Pub>} />
          <Route path="/about/history"         element={<Pub><CollegeHistory /></Pub>} />
          <Route path="/about/mission-vision"  element={<Pub><MissionVision /></Pub>} />
          <Route path="/about/facilities"      element={<Pub><Facilities /></Pub>} />
          <Route path="/about/achievements"    element={<Pub><Achievements /></Pub>} />
          <Route path="/about/governing-body"  element={<Pub><GoverningBody /></Pub>} />
          <Route path="/about/principal"       element={<Pub><PrincipalPage /></Pub>} />
          <Route path="/about"                 element={<Pub><CollegeHistory /></Pub>} />

          {/* ══ ADMINISTRATION ═══════════════════════════════════════════ */}
          <Route path="/administration/teachers"         element={<Pub><Teachers /></Pub>} />
          <Route path="/administration/governing-body"   element={<Pub><GoverningBody /></Pub>} />
          <Route path="/administration/teacher-training" element={<Pub><TeacherTraining /></Pub>} />
          <Route path="/administration/club-management"  element={<Pub><ClubManagementPub /></Pub>} />

          {/* ══ ACADEMIC ═════════════════════════════════════════════════ */}
          <Route path="/academic/hsc-routine"        element={<Pub><HscRoutine /></Pub>} />
          <Route path="/academic/degree-pass"        element={<Pub><DegreePassPage /></Pub>} />
          <Route path="/academic/degree-honors"      element={<Pub><DegreeHonorsPage /></Pub>} />
          <Route path="/academic/management"         element={<Pub><DegreePassPage /></Pub>} />
          <Route path="/academic/social-work"        element={<Pub><DegreePassPage /></Pub>} />
          <Route path="/academic/political-science"  element={<Pub><DegreePassPage /></Pub>} />
          <Route path="/academic/psychology"         element={<Pub><DegreePassPage /></Pub>} />
          <Route path="/academic/islamic-history"    element={<Pub><DegreePassPage /></Pub>} />
          <Route path="/academic/departments"        element={<Pub><Departments /></Pub>} />
          <Route path="/academic/programs"           element={<Pub><Programs /></Pub>} />
          <Route path="/academic/syllabus"           element={<Pub><Syllabus /></Pub>} />
          <Route path="/academic/calendar"           element={<Pub><AcademicCalendar /></Pub>} />
          <Route path="/academic"                    element={<Pub><Departments /></Pub>} />

          {/* ══ ADMISSION ════════════════════════════════════════════════ */}
          <Route path="/admission/apply"        element={<Pub><ApplyOnline /></Pub>} />
          <Route path="/admission/hsc"          element={<Pub><AdmissionHsc /></Pub>} />
          <Route path="/admission/degree-pass"  element={<Pub><AdmissionDegreePass /></Pub>} />
          <Route path="/admission/degree"       element={<Pub><AdmissionDegree /></Pub>} />
          <Route path="/admission/requirements" element={<Pub><AdmissionRequirements /></Pub>} />
          <Route path="/admission/procedure"    element={<Pub><AdmissionProcedure /></Pub>} />
          <Route path="/admission"              element={<Pub><ApplyOnline /></Pub>} />

          {/* ══ FORM FILL-UP ══════════════════════════════════════════════ */}
          <Route path="/form/hsc"         element={<Pub><FormHsc /></Pub>} />
          <Route path="/form/degree-pass" element={<Pub><FormDegreePass /></Pub>} />
          <Route path="/form/degree"      element={<Pub><FormDegree /></Pub>} />

          {/* ══ RESULT ════════════════════════════════════════════════════ */}
          <Route path="/result/admit-card"  element={<Pub><ResultAdmitCard /></Pub>} />
          <Route path="/result/internal"    element={<Pub><ResultInternal /></Pub>} />
          <Route path="/result/hsc"         element={<Pub><ResultHsc /></Pub>} />
          <Route path="/result/degree-pass" element={<Pub><ResultDegreePass /></Pub>} />
          <Route path="/result/degree"      element={<Pub><ResultDegree /></Pub>} />
          <Route path="/result"             element={<Pub><ResultInternal /></Pub>} />

          {/* ══ GALLERY ══════════════════════════════════════════════════ */}
          <Route path="/gallery/photos" element={<Pub><PhotoGallery /></Pub>} />
          <Route path="/gallery/videos" element={<Pub><VideoGallery /></Pub>} />
          <Route path="/gallery/events" element={<Pub><Events /></Pub>} />
          <Route path="/gallery"        element={<Pub><PhotoGallery /></Pub>} />

          {/* ══ NOTICES ══════════════════════════════════════════════════ */}
          <Route path="/notices/:id" element={<Pub><NoticePage /></Pub>} />
          <Route path="/notices"     element={<Pub><NoticePage /></Pub>} />

          {/* ══ MISC PUBLIC ══════════════════════════════════════════════ */}
          <Route path="/contact"           element={<Pub><ContactPage /></Pub>} />
          <Route path="/easy-college-mate" element={<Pub><EasyCollegeMate /></Pub>} />
          <Route path="/library"           element={<Pub><LibraryPage /></Pub>} />
          <Route path="/e-library"         element={<Pub><ELibraryPage /></Pub>} />

          {/* ══ HOME — wildcard MUST be last ═════════════════════════════ */}
          <Route path="/*" element={<PublicHome />} />

        </Routes>
      </Router>
    </Provider>
  );
}

export default App;



// // src/App.js  — Full routing for all public navigation links
// import React, { Suspense, lazy } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import { Toaster } from 'react-hot-toast';
// import { store } from './redux/store';

// import './App.css';

// // ── Eagerly loaded core pages ──────────────────────────────────────────────
// import PrivateRoute  from './components/PrivateRoute';
// import PublicHome    from './pages/PublicHome';
// import Login         from './pages/Login';
// import Register      from './pages/Register';
// import Dashboard     from './pages/Dashboard';
// import AdmissionForm from './pages/AdmissionForm';
// import AdmissionList from './pages/AdmissionList';
// import InstallPWAGuide from './components/InstallPWAGuide';

// // ── Layout wrapper that adds PublicHeader + PublicFooter ───────────────────
// import PublicLayout from './components/PublicLayout';

// // ── NEW: Admit Card & Result Card Generators ───────────────────────────────
// import AdmitCardGenerator  from './pages/AdmitCardGenerator';
// import ResultCardGenerator from './pages/ResultCardGenerator';

// // ── Content pages (lazy loaded) ────────────────────────────────────────────
// // About
// const CollegeHistory  = lazy(() => import('./content/about/CollegeHistory'));
// const MissionVision   = lazy(() => import('./content/about/MissionVision'));
// const Achievements    = lazy(() => import('./content/about/Achievements'));
// const Facilities      = lazy(() => import('./content/about/Facilities'));

// // Administration
// const Teachers          = lazy(() => import('./content/administration/Teachers'));
// const GoverningBody     = lazy(() => import('./content/administration/GoverningBody'));
// const TeacherTraining   = lazy(() => import('./content/administration/TeacherTraining'));
// const ClubManagementPub = lazy(() => import('./content/administration/ClubManagement'));

// // Academic
// const Departments       = lazy(() => import('./content/academic/Departments'));
// const Programs          = lazy(() => import('./content/academic/Programs'));
// const Syllabus          = lazy(() => import('./content/academic/Syllabus'));
// const AcademicCalendar  = lazy(() => import('./content/academic/AcademicCalendar'));

// // Admission
// const ApplyOnline           = lazy(() => import('./content/admission/ApplyOnline'));
// const AdmissionRequirements = lazy(() => import('./content/admission/Requirements'));
// const AdmissionProcedure    = lazy(() => import('./content/admission/AdmissionProcedure'));

// // Gallery
// const PhotoGallery = lazy(() => import('./content/gallery/PhotoGallery'));
// const VideoGallery = lazy(() => import('./content/gallery/VideoGallery'));
// const Events       = lazy(() => import('./content/gallery/Events'));

// // Notice
// const NoticePage  = lazy(() => import('./content/Notice'));

// // Contact
// const ContactPage = lazy(() => import('./content/Contact'));

// // New placeholder pages (routes that had no component yet)
// const FacultyCouncil      = lazy(() => import('./content/pages/FacultyCouncil'));
// const Organogram          = lazy(() => import('./content/pages/Organogram'));
// const StaffPage           = lazy(() => import('./content/pages/StaffPage'));
// const PrincipalPage       = lazy(() => import('./content/pages/PrincipalPage'));
// const HscRoutine          = lazy(() => import('./content/pages/HscRoutine'));
// const DegreePassPage      = lazy(() => import('./content/pages/DegreePassPage'));
// const DegreeHonorsPage    = lazy(() => import('./content/pages/DegreeHonorsPage'));
// const AdmissionHsc        = lazy(() => import('./content/pages/AdmissionHsc'));
// const AdmissionDegreePass = lazy(() => import('./content/pages/AdmissionDegreePass'));
// const AdmissionDegree     = lazy(() => import('./content/pages/AdmissionDegree'));
// const FormHsc             = lazy(() => import('./content/pages/FormHsc'));
// const FormDegreePass      = lazy(() => import('./content/pages/FormDegreePass'));
// const FormDegree          = lazy(() => import('./content/pages/FormDegree'));
// const ResultAdmitCard     = lazy(() => import('./content/pages/ResultAdmitCard'));
// const ResultInternal      = lazy(() => import('./content/pages/ResultInternal'));
// const ResultHsc           = lazy(() => import('./content/pages/ResultHsc'));
// const ResultDegreePass    = lazy(() => import('./content/pages/ResultDegreePass'));
// const ResultDegree        = lazy(() => import('./content/pages/ResultDegree'));
// const EasyCollegeMate     = lazy(() => import('./content/pages/EasyCollegeMate'));
// const LibraryPage         = lazy(() => import('./content/pages/LibraryPage'));
// const ELibraryPage        = lazy(() => import('./content/pages/ELibraryPage'));

// // ── Fallback spinner ───────────────────────────────────────────────────────
// function PageLoading() {
//   return (
//     <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//       <div style={{ width: 40, height: 40, border: '4px solid #e0e0e0', borderTopColor: '#2e7d32', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
//       <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//     </div>
//   );
// }

// // ── Wrapped route helper ───────────────────────────────────────────────────
// function Pub({ children }) {
//   return (
//     <Suspense fallback={<PageLoading />}>
//       <PublicLayout>{children}</PublicLayout>
//     </Suspense>
//   );
// }

// function App() {
//   return (
//     <Provider store={store}>
//       <Router>
//         <Toaster
//           position="top-right"
//           toastOptions={{
//             duration: 3000,
//             style: { background: '#363636', color: '#fff' },
//             success: { duration: 3000, iconTheme: { primary: '#10b981', secondary: '#fff' } },
//             error:   { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
//           }}
//         />

//         <Routes>
//           {/* ══ AUTH ══════════════════════════════════════════════════════ */}
//           <Route path="/login"    element={<Login />} />
//           <Route path="/register" element={<Register />} />

//           {/* ══ DASHBOARD (private) ══════════════════════════════════════ */}
//           <Route path="/dashboard/admissions" element={<PrivateRoute><AdmissionList /></PrivateRoute>} />

//           {/* ✅ NEW: Admit Card & Result Card Generator routes */}
//           <Route
//             path="/dashboard/students/admit-cards"
//             element={<PrivateRoute><AdmitCardGenerator /></PrivateRoute>}
//           />
//           <Route
//             path="/dashboard/students/result-cards"
//             element={<PrivateRoute><ResultCardGenerator /></PrivateRoute>}
//           />

//           <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

//           {/* ══ ADMISSION FORM ════════════════════════════════════════════ */}
//           <Route path="/admission-form" element={<AdmissionForm />} />
//           <Route path="/install-guide"  element={<InstallPWAGuide />} />

//           {/* ══ ABOUT ═════════════════════════════════════════════════════ */}
//           <Route path="/about/faculty-council" element={<Pub><FacultyCouncil /></Pub>} />
//           <Route path="/about/organogram"      element={<Pub><Organogram /></Pub>} />
//           <Route path="/about/staff"           element={<Pub><StaffPage /></Pub>} />
//           <Route path="/about/history"         element={<Pub><CollegeHistory /></Pub>} />
//           <Route path="/about/mission-vision"  element={<Pub><MissionVision /></Pub>} />
//           <Route path="/about/facilities"      element={<Pub><Facilities /></Pub>} />
//           <Route path="/about/achievements"    element={<Pub><Achievements /></Pub>} />
//           <Route path="/about/governing-body"  element={<Pub><GoverningBody /></Pub>} />
//           <Route path="/about/principal"       element={<Pub><PrincipalPage /></Pub>} />
//           <Route path="/about"                 element={<Pub><CollegeHistory /></Pub>} />

//           {/* ══ ADMINISTRATION ═══════════════════════════════════════════ */}
//           <Route path="/administration/teachers"         element={<Pub><Teachers /></Pub>} />
//           <Route path="/administration/governing-body"   element={<Pub><GoverningBody /></Pub>} />
//           <Route path="/administration/teacher-training" element={<Pub><TeacherTraining /></Pub>} />
//           <Route path="/administration/club-management"  element={<Pub><ClubManagementPub /></Pub>} />

//           {/* ══ ACADEMIC ═════════════════════════════════════════════════ */}
//           <Route path="/academic/hsc-routine"       element={<Pub><HscRoutine /></Pub>} />
//           <Route path="/academic/degree-pass"       element={<Pub><DegreePassPage /></Pub>} />
//           <Route path="/academic/degree-honors"     element={<Pub><DegreeHonorsPage /></Pub>} />
//           <Route path="/academic/management"        element={<Pub><DegreePassPage /></Pub>} />
//           <Route path="/academic/social-work"       element={<Pub><DegreePassPage /></Pub>} />
//           <Route path="/academic/political-science" element={<Pub><DegreePassPage /></Pub>} />
//           <Route path="/academic/psychology"        element={<Pub><DegreePassPage /></Pub>} />
//           <Route path="/academic/islamic-history"   element={<Pub><DegreePassPage /></Pub>} />
//           <Route path="/academic/departments"       element={<Pub><Departments /></Pub>} />
//           <Route path="/academic/programs"          element={<Pub><Programs /></Pub>} />
//           <Route path="/academic/syllabus"          element={<Pub><Syllabus /></Pub>} />
//           <Route path="/academic/calendar"          element={<Pub><AcademicCalendar /></Pub>} />
//           <Route path="/academic"                   element={<Pub><Departments /></Pub>} />

//           {/* ══ ADMISSION ════════════════════════════════════════════════ */}
//           <Route path="/admission/apply"        element={<Pub><ApplyOnline /></Pub>} />
//           <Route path="/admission/hsc"          element={<Pub><AdmissionHsc /></Pub>} />
//           <Route path="/admission/degree-pass"  element={<Pub><AdmissionDegreePass /></Pub>} />
//           <Route path="/admission/degree"       element={<Pub><AdmissionDegree /></Pub>} />
//           <Route path="/admission/requirements" element={<Pub><AdmissionRequirements /></Pub>} />
//           <Route path="/admission/procedure"    element={<Pub><AdmissionProcedure /></Pub>} />
//           <Route path="/admission"              element={<Pub><ApplyOnline /></Pub>} />

//           {/* ══ FORM FILL-UP ══════════════════════════════════════════════ */}
//           <Route path="/form/hsc"         element={<Pub><FormHsc /></Pub>} />
//           <Route path="/form/degree-pass" element={<Pub><FormDegreePass /></Pub>} />
//           <Route path="/form/degree"      element={<Pub><FormDegree /></Pub>} />

//           {/* ══ RESULT ════════════════════════════════════════════════════ */}
//           <Route path="/result/admit-card"  element={<Pub><ResultAdmitCard /></Pub>} />
//           <Route path="/result/internal"    element={<Pub><ResultInternal /></Pub>} />
//           <Route path="/result/hsc"         element={<Pub><ResultHsc /></Pub>} />
//           <Route path="/result/degree-pass" element={<Pub><ResultDegreePass /></Pub>} />
//           <Route path="/result/degree"      element={<Pub><ResultDegree /></Pub>} />
//           <Route path="/result"             element={<Pub><ResultInternal /></Pub>} />

//           {/* ══ GALLERY ══════════════════════════════════════════════════ */}
//           <Route path="/gallery/photos" element={<Pub><PhotoGallery /></Pub>} />
//           <Route path="/gallery/videos" element={<Pub><VideoGallery /></Pub>} />
//           <Route path="/gallery/events" element={<Pub><Events /></Pub>} />
//           <Route path="/gallery"        element={<Pub><PhotoGallery /></Pub>} />

//           {/* ══ NOTICES ══════════════════════════════════════════════════ */}
//           <Route path="/notices/:id" element={<Pub><NoticePage /></Pub>} />
//           <Route path="/notices"     element={<Pub><NoticePage /></Pub>} />

//           {/* ══ MISC PUBLIC ══════════════════════════════════════════════ */}
//           <Route path="/contact"           element={<Pub><ContactPage /></Pub>} />
//           <Route path="/easy-college-mate" element={<Pub><EasyCollegeMate /></Pub>} />
//           <Route path="/library"           element={<Pub><LibraryPage /></Pub>} />
//           <Route path="/e-library"         element={<Pub><ELibraryPage /></Pub>} />

//           {/* ══ HOME (wildcard — MUST be last) ═══════════════════════════ */}
//           <Route path="/*" element={<PublicHome />} />
//         </Routes>
//       </Router>
//     </Provider>
//   );
// }

// export default App;