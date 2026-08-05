import api from './axiosClient';

export const signup = async (name, email, password, phoneNumber) => {
  const response = await api.post('/auth/signup', { name, email, password, phoneNumber });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};
