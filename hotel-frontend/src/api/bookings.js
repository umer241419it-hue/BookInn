import api from './axiosClient';

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get('/bookings/my-bookings');
  return response.data;
};

export const getAllBookings = async (params = {}) => {
  const response = await api.get('/bookings', { params });
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};

