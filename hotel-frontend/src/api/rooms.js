import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

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
