// // FILE PATH: src/services/noticeService.js
// import api from './api';

// const noticeService = {
//   // ✅ Pagination support added
//   getAllNotices: async (page = 1, limit = 9) => {
//     const response = await api.get(`/notices?page=${page}&limit=${limit}`);
//     return response.data;
//   },
//   getPublicNotices: async (page = 1, limit = 8) => {
//     const response = await api.get(`/notices/public?page=${page}&limit=${limit}`);
//     return response.data;
//   },
//   getNotice: async (id) => {
//     const response = await api.get(`/notices/${id}`);
//     return response.data;
//   },
//   getPublicNotice: async (id) => {
//     const response = await api.get(`/notices/public/${id}`);
//     return response.data;
//   },
//   createNotice: async (noticeData) => {
//     const response = await api.post('/notices', noticeData, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     });
//     return response.data;
//   },
//   updateNotice: async (id, noticeData) => {
//     const response = await api.put(`/notices/${id}`, noticeData, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     });
//     return response.data;
//   },
//   deleteNotice: async (id) => {
//     const response = await api.delete(`/notices/${id}`);
//     return response.data;
//   },
//   deleteAttachment: async (noticeId, attachmentId) => {
//     const response = await api.delete(`/notices/${noticeId}/attachments/${attachmentId}`);
//     return response.data;
//   },
//   deleteDriveLink: async (noticeId, linkId) => {
//     const response = await api.delete(`/notices/${noticeId}/drivelinks/${linkId}`);
//     return response.data;
//   }
// };

// export default noticeService;

// FILE PATH: src/services/noticeService.js
import api from './api';

const noticeService = {
  // Dashboard
  getAllNotices: async (page = 1, limit = 9) => {
    const r = await api.get(`/notices?page=${page}&limit=${limit}`);
    return r.data;
  },
  getNotice: async (id) => {
    const r = await api.get(`/notices/${id}`);
    return r.data;
  },
  createNotice: async (data) => {
    const r = await api.post('/notices', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return r.data;
  },
  updateNotice: async (id, data) => {
    const r = await api.put(`/notices/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return r.data;
  },
  deleteNotice: async (id) => {
    const r = await api.delete(`/notices/${id}`);
    return r.data;
  },
  deleteAttachment: async (noticeId, attachmentId) => {
    const r = await api.delete(`/notices/${noticeId}/attachments/${attachmentId}`);
    return r.data;
  },
  deleteDriveLink: async (noticeId, linkId) => {
    const r = await api.delete(`/notices/${noticeId}/drivelinks/${linkId}`);
    return r.data;
  },

  // Public
  getPublicNotices: async (page = 1, limit = 15) => {
    const r = await api.get(`/notices/public?page=${page}&limit=${limit}`);
    return r.data;
  },
  getPublicNotice: async (id) => {
    const r = await api.get(`/notices/public/${id}`);
    return r.data;
  },
};

export default noticeService;