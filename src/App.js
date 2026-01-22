import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';

import PublicHome from './pages/PublicHome';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import AdmissionForm from './pages/AdmissionForm';
import AdmissionList from './pages/AdmissionList';

import InstallPWAGuide from './components/InstallPWAGuide';


// ✅ NEW: Import public pages
import TeacherTraining from './content/administration/TeacherTraining';
import ClubManagementPublic from './content/administration/ClubManagement';
import Teachers from './content/administration/Teachers';

import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes - All nested routes handled in PublicHome */}
          <Route path="/*" element={<PublicHome />} />

          {/* ✅ NEW: Install Guide Route */}
          <Route path="/install-guide" element={<InstallPWAGuide />} />
          
          {/* ✅ NEW: Public administration routes */}
          <Route path="/administration/teacher-training" element={<TeacherTraining />} />
          <Route path="/administration/club-management" element={<ClubManagementPublic />} />
          <Route path="/administration/teachers" element={<Teachers />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admission-form" element={<AdmissionForm />} />

          {/* Private Routes */}
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/admissions"
            element={
              <PrivateRoute>
                <AdmissionList />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;



// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import { Toaster } from 'react-hot-toast';
// import { store } from './redux/store';

// import PublicHome from './pages/PublicHome';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Dashboard from './pages/Dashboard';
// import PrivateRoute from './components/PrivateRoute';

// // নতুন imports
// import AdmissionForm from './pages/AdmissionForm';
// import AdmissionList from './pages/AdmissionList';

// import './App.css';

// function App() {
//   return (
//     <Provider store={store}>
//       <Router>
//         <Toaster
//           position="top-right"
//           toastOptions={{
//             duration: 3000,
//             style: {
//               background: '#363636',
//               color: '#fff',
//             },
//             success: {
//               duration: 3000,
//               iconTheme: {
//                 primary: '#10b981',
//                 secondary: '#fff',
//               },
//             },
//             error: {
//               duration: 4000,
//               iconTheme: {
//                 primary: '#ef4444',
//                 secondary: '#fff',
//               },
//             },
//           }}
//         />

//         <Routes>
//           {/* Public Routes */}
//           <Route path="/" element={<PublicHome />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/admission" element={<AdmissionForm />} />

//           {/* Private Routes */}
//           <Route
//             path="/dashboard/*"
//             element={
//               <PrivateRoute>
//                 <Dashboard />
//               </PrivateRoute>
//             }
//           />

//           <Route
//             path="/dashboard/admissions"
//             element={
//               <PrivateRoute>
//                 <AdmissionList />
//               </PrivateRoute>
//             }
//           />
//         </Routes>
//       </Router>
//     </Provider>
//   );
// }

// export default App;
