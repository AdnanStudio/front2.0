import api from './api';

const noticeService = {
  // Get all notices (Admin/Teacher - Private)
  getAllNotices: async () => {
    const response = await api.get('/notices');
    return response.data;
  },

  // Get public notices with pagination
  getPublicNotices: async (page = 1, limit = 8) => {
    const response = await api.get(`/notices/public?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get single notice
  getNotice: async (id) => {
    const response = await api.get(`/notices/${id}`);
    return response.data;
  },

  // Get single notice (Public)
  getPublicNotice: async (id) => {
    const response = await api.get(`/notices/public/${id}`);
    return response.data;
  },

  // Create notice with files
  createNotice: async (noticeData) => {
    const response = await api.post('/notices', noticeData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update notice
  updateNotice: async (id, noticeData) => {
    const response = await api.put(`/notices/${id}`, noticeData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete notice
  deleteNotice: async (id) => {
    const response = await api.delete(`/notices/${id}`);
    return response.data;
  },

  // Delete attachment
  deleteAttachment: async (noticeId, attachmentId) => {
    const response = await api.delete(`/notices/${noticeId}/attachments/${attachmentId}`);
    return response.data;
  }
};

export default noticeService;


// import api from './api';

// const noticeService = {
//   // Get all notices (Admin/Teacher - Private)
//   getAllNotices: async () => {
//     const response = await api.get('/notices');
//     return response.data;
//   },

//   // Get public notices (for PublicHome.js - No authentication needed)
//   getPublicNotices: async () => {
//     const response = await api.get('/notices/public');
//     return response.data;
//   },

//   // Get single notice
//   getNotice: async (id) => {
//     const response = await api.get(`/notices/${id}`);
//     return response.data;
//   },

//   // Get single notice (Public)
//   getPublicNotice: async (id) => {
//     const response = await api.get(`/notices/public/${id}`);
//     return response.data;
//   },

//   // Create notice with files
//   createNotice: async (noticeData) => {
//     const response = await api.post('/notices', noticeData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     });
//     return response.data;
//   },

//   // Update notice
//   updateNotice: async (id, noticeData) => {
//     const response = await api.put(`/notices/${id}`, noticeData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     });
//     return response.data;
//   },

//   // Delete notice
//   deleteNotice: async (id) => {
//     const response = await api.delete(`/notices/${id}`);
//     return response.data;
//   },

//   // Delete attachment
//   deleteAttachment: async (noticeId, attachmentId) => {
//     const response = await api.delete(`/notices/${noticeId}/attachments/${attachmentId}`);
//     return response.data;
//   }
// };

// export default noticeService;