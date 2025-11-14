// File: frontend/src/services/adminUserService.js
import apiClient from './apiClient';

/**
 * Lấy danh sách user (lọc theo role)
 * @param {Array<string>} roles (VD: ['STAFF', 'SUPPLIER'])
 */
export const getUsers = async (roles = []) => {
  try {
    const params = new URLSearchParams();
    if (roles.length > 0) {
      params.append('roles', roles.join(','));
    }
    const { data } = await apiClient.get('/users', { params });
    return data;
  } catch (error) {
    throw error.response.data;
  }
};

/**
 * Lấy chi tiết 1 user (dùng cho trang Customer Detail)
 * @param {string} userId
 */
export const getUserDetail = async (userId) => {
  try {
    const { data } = await apiClient.get(`/users/${userId}`);
    return data;
  } catch (error) {
    throw error.response.data;
  }
};

/**
 * Admin tạo user mới (Staff/Supplier)
 * @param {object} userData { email, inGameName, role }
 */
export const createUser = async (userData) => {
  try {
    const { data } = await apiClient.post('/users', userData);
    return data;
  } catch (error) {
    throw error.response.data;
  }
};