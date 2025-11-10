// File: frontend/src/services/userService.js
import apiClient from './apiClient.js';

/**
 * Gọi API để lấy thông tin cá nhân (dựa trên cookie)
 */
export const getMyProfile = async () => {
  // GET đến /api/users/profile
  const res = await apiClient.get('/users/profile');
  return res.data; // Trả về res.data
};

/**
 * [THÊM] Gọi API để đổi mật khẩu
 * @param {object} passwordData - Gồm { currentPassword, newPassword }
 */
export const changePassword = async (passwordData) => {
  // PUT đến /api/users/change-password
  const res = await apiClient.put('/users/change-password', passwordData);
  return res.data; // Trả về data (thường là { message: '...' })
};