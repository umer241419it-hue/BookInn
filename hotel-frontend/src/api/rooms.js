import api from './axiosClient';

export const getAllRooms = async () => {
  const response = await api.get('/rooms');
  return response.data;
};

export const getAvailableRooms = async (checkIn, checkOut) => {
  const response = await api.get('/rooms/available', {
    params: { checkIn, checkOut },
  });
  return response.data;
};

export const createRoomType = async ({ type, price, capacity, totalRooms }) => {
  const response = await api.post('/rooms', { type, price, capacity, totalRooms });
  return response.data;
};

export const updateRoomType = async (originalType, { type, price, capacity, totalRooms }) => {
  const response = await api.put(`/rooms/${encodeURIComponent(originalType)}`, { type, price, capacity, totalRooms });
  return response.data;
};

export const deleteRoomType = async (type) => {
  const response = await api.delete(`/rooms/${encodeURIComponent(type)}`);
  return response.data;
};
