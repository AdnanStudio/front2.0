import api from './api';

const paymentService = {
  // Get all payment requests
  getAllPayments: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  // Get single payment
  getPayment: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Create payment request (Admin/Teacher)
  createPaymentRequest: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  // Submit payment proof (Student)
  submitPaymentProof: async (id, formData) => {
    const response = await api.put(`/payments/${id}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update payment status (Admin/Teacher)
  updatePaymentStatus: async (id, statusData) => {
    const response = await api.put(`/payments/${id}/status`, statusData);
    return response.data;
  },

  // ✅ Delete single payment request (Admin only)
  deletePayment: async (id) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },

  // ✅ Delete all payment requests (Admin only)
  deleteAllPayments: async () => {
    const response = await api.delete('/payments/all/delete-all');
    return response.data;
  }
};

export default paymentService;