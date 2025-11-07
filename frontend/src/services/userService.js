// src/services/userService.js
import apiClient from './apiClient.js';

/**
 * Gọi API để lấy thông tin cá nhân (dựa trên cookie)
 */
export const getMyProfile = async () => {
  // GET đến /api/users/profile
  return apiClient.get('/users/profile');
};