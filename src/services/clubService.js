import api from './api';

// ── Club Management Service ──────────────────────────────────────────────────
// Backend route: /api/club-members

export const getAllClubs = async () => {
  const response = await api.get('/club-members');
  return response.data;
};

export const getClubById = async (id) => {
  const response = await api.get(`/club-members/${id}`);
  return response.data;
};

export const createClub = async (clubData) => {
  const response = await api.post('/club-members', clubData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateClub = async (id, clubData) => {
  const response = await api.put(`/club-members/${id}`, clubData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteClub = async (id) => {
  const response = await api.delete(`/club-members/${id}`);
  return response.data;
};

export const toggleClubStatus = async (id) => {
  const response = await api.put(`/club-members/${id}/status`);
  return response.data;
};

const clubService = {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  toggleClubStatus,
  // legacy aliases
  getAllMembers: getAllClubs,
  createMember: createClub,
  updateMember: updateClub,
  deleteMember: deleteClub,
};

export default clubService;
