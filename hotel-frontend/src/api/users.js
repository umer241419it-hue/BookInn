import api from './axiosClient';

export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async ({ name }) => {
  const response = await api.put('/users/profile', { name });
  return response.data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await api.put('/users/change-password', { currentPassword, newPassword });
  return response.data;
};
