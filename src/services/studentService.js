import api from './api';

const STUDENT_API = '/students';

// ============ Get All Students ============
export const getAllStudents = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.class) queryParams.append('class', filters.class);
    if (filters.section) queryParams.append('section', filters.section);
    if (filters.gender) queryParams.append('gender', filters.gender);
    if (filters.status) queryParams.append('status', filters.status);

    const response = await api.get(`${STUDENT_API}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching students' };
  }
};

// ============ Get Single Student ============
export const getStudent = async (id) => {
  try {
    const response = await api.get(`${STUDENT_API}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching student' };
  }
};

// ============ Get Student by ID ============
export const getStudentById = async (id) => {
  try {
    const response = await api.get(`${STUDENT_API}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching student' };
  }
};

// ============ Create Student ============
export const createStudent = async (studentData) => {
  try {
    const response = await api.post(STUDENT_API, studentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error creating student' };
  }
};

// ============ Update Student ============
export const updateStudent = async (id, studentData) => {
  try {
    const response = await api.put(`${STUDENT_API}/${id}`, studentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating student' };
  }
};

// ============ Delete Student ============
export const deleteStudent = async (id) => {
  try {
    const response = await api.delete(`${STUDENT_API}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting student' };
  }
};

// ============ Get Students by Class ============
export const getStudentsByClass = async (className, section) => {
  try {
    const response = await api.get(`${STUDENT_API}/class/${className}/${section}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching students by class' };
  }
};

// ============ Toggle Student Status ============
export const toggleStudentStatus = async (id) => {
  try {
    const response = await api.put(`${STUDENT_API}/${id}/status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error toggling student status' };
  }
};

// ============ Get Logged-in Student Profile ============
export const getStudentProfile = async () => {
  try {
    const response = await api.get(`${STUDENT_API}/profile`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch student profile' };
  }
};

// ============ Default Export (Object with all methods) ============
const studentService = {
  getAllStudents,
  getStudent,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByClass,
  toggleStudentStatus,
  getStudentProfile
};

export default studentService;




// import api from './api';

// const studentService = {
//   // Get all students
//   getAllStudents: async (params) => {
//     const response = await api.get('/students', { params });
//     return response.data;
//   },

//   // Get single student
//   getStudent: async (id) => {
//     const response = await api.get(`/students/${id}`);
//     return response.data;
//   },

//   // Create student
//   createStudent: async (studentData) => {
//     const response = await api.post('/students', studentData);
//     return response.data;
//   },

//   // Update student
//   updateStudent: async (id, studentData) => {
//     const response = await api.put(`/students/${id}`, studentData);
//     return response.data;
//   },

//   // Delete student
//   deleteStudent: async (id) => {
//     const response = await api.delete(`/students/${id}`);
//     return response.data;
//   },

//   // Get students by class
//   getStudentsByClass: async (className, section) => {
//     const response = await api.get(`/students/class/${className}/${section}`);
//     return response.data;
//   },

//   // Toggle student status
//   toggleStudentStatus: async (id) => {
//     const response = await api.put(`/students/${id}/status`);
//     return response.data;
//   },

//   // ✅ Get logged-in student profile
//   getStudentProfile: async () => {
//     try {
//       const response = await api.get('/students/profile');
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || {
//         message: 'Failed to fetch student profile'
//       };
//     }
//   }
// };

// export default studentService;

// // Named export (optional but convenient)
// export const getStudentProfile = studentService.getStudentProfile;








// import api from './api';

// const studentService = {
//   // Get all students
//   getAllStudents: async (params) => {
//     const response = await api.get('/students', { params });
//     return response.data;
//   },

//   // Get single student
//   getStudent: async (id) => {
//     const response = await api.get(`/students/${id}`);
//     return response.data;
//   },

//   // Create student
//   createStudent: async (studentData) => {
//     const response = await api.post('/students', studentData);
//     return response.data;
//   },

//   // Update student
//   updateStudent: async (id, studentData) => {
//     const response = await api.put(`/students/${id}`, studentData);
//     return response.data;
//   },

//   // Delete student
//   deleteStudent: async (id) => {
//     const response = await api.delete(`/students/${id}`);
//     return response.data;
//   },

//   // Get students by class
//   getStudentsByClass: async (className, section) => {
//     const response = await api.get(`/students/class/${className}/${section}`);
//     return response.data;
//   },

//   // Toggle student status
//   toggleStudentStatus: async (id) => {
//     const response = await api.put(`/students/${id}/status`);
//     return response.data;
//   }
// };

// export default studentService;