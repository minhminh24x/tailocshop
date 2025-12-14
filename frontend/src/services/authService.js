// File: frontend/src/services/authService.js
import apiClient from './apiClient.js';

/**
 * Đăng nhập
 * @param {object} credentials - { email, password }
 */
export const loginUser = (credentials) => {
  return apiClient.post('/auth/login', credentials);
};

/**
 * Đăng ký
 * @param {object} userData - { email, password, inGameName }
 */
export const registerUser = (userData) => {
  return apiClient.post('/auth/register', userData);
};

/**
 * Đăng xuất
 */
export const logoutUser = () => {
  return apiClient.post('/auth/logout');
};

/**
 * Yêu cầu đặt lại mật khẩu (gửi email)
 * @param {string} email 
 */
export const forgotPassword = (email) => {
  return apiClient.post('/auth/forgot-password', { email });
};

/**
 * Đặt lại mật khẩu với token
 * @param {string} token - Token từ email
 * @param {string} email - Email người dùng 
 * @param {string} newPassword - Mật khẩu mới
 */
export const resetPassword = (token, email, newPassword) => {
  return apiClient.post('/auth/reset-password', { token, email, newPassword });
};

/**
 * Kiểm tra token có hợp lệ không
 * @param {string} token 
 * @param {string} email 
 */
export const verifyResetToken = (token, email) => {
  return apiClient.post('/auth/verify-reset-token', { token, email });
};