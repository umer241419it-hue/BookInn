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
