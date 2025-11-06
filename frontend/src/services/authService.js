// src/services/authService.js
import apiClient from './apiClient.js';

/**
 * Gọi API đăng ký
 * @param {object} userData - { email, password, inGameName }
 */
export const registerUser = (userData) => {
  // POST đến /api/auth/register
  return apiClient.post('/auth/register', userData);
};

/**
 * Gọi API đăng nhập
 * @param {object} credentials - { email, password }
 */
export const loginUser = (credentials) => {
  // POST đến /api/auth/login
  return apiClient.post('/auth/login', credentials);
};

/**
 * Gọi API đăng xuất
 */
export const logoutUser = () => {
  // POST đến /api/auth/logout
  return apiClient.post('/auth/logout');
};