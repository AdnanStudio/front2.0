import api from './api';

// ── Governing Body Service ───────────────────────────────────────────────────
// Backend route: /api/governing-body

export const getAllMembers = async () => {
  const response = await api.get('/governing-body');
  return response.data;
};

export const getMemberById = async (id) => {
  const response = await api.get(`/governing-body/${id}`);
  return response.data;
};

export const createMember = async (memberData) => {
  const response = await api.post('/governing-body', memberData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateMember = async (id, memberData) => {
  const response = await api.put(`/governing-body/${id}`, memberData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteMember = async (id) => {
  const response = await api.delete(`/governing-body/${id}`);
  return response.data;
};

export const toggleMemberStatus = async (id) => {
  const response = await api.put(`/governing-body/${id}/status`);
  return response.data;
};

const governingBodyService = {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  toggleMemberStatus,
};

export default governingBodyService;
