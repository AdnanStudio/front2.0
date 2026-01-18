import api from './api';

const clubService = {
  // Get all members (public)
  getAllMembers: async (params) => {
    const response = await api.get('/club-members', { params });
    return response.data;
  },

  // Get single member
  getMember: async (id) => {
    const response = await api.get(`/club-members/${id}`);
    return response.data;
  },

  // Create member (admin)
  createMember: async (formData) => {
    const response = await api.post('/club-members', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Update member (admin)
  updateMember: async (id, formData) => {
    const response = await api.put(`/club-members/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete member (admin)
  deleteMember: async (id) => {
    const response = await api.delete(`/club-members/${id}`);
    return response.data;
  },

  // Toggle member status
  toggleMemberStatus: async (id) => {
    const response = await api.put(`/club-members/${id}/status`);
    return response.data;
  }
};

export default clubService;