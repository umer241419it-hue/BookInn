import api from './axiosClient';

export const createRazorpayOrder = async ({ bookingId, amount }) => {
  const response = await api.post('/payments/create-order', { bookingId, amount });
  return response.data;
};

export const verifyRazorpayPayment = async (paymentData) => {
  const response = await api.post('/payments/verify', paymentData);
  return response.data;
};
