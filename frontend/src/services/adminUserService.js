// File: frontend/src/services/adminUserService.js
import apiClient from './apiClient';

/**
 * [NÂNG CẤP] Lấy danh sách user với pagination và filter
 * @param {object} params - { page, limit, roles, search }
 * @returns {Promise<{data: User[], pagination: object}>}
 */
export const getUsers = async (params = {}) => {
  try {
    // Convert roles array to comma-separated string if needed
    const queryParams = { ...params };
    if (Array.isArray(params.roles)) {
      queryParams.roles = params.roles.join(',');
    }

    const { data } = await apiClient.get('/users', { params: queryParams });
    return data;
  } catch (error) {
    throw error.response?.data || error;
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
    throw error.response?.data || error;
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
    throw error.response?.data || error;
  }
};

/**
 * [MỚI] Admin ban/unban user
 * @param {string} userId
 * @param {object} banData { banned: boolean, reason?: string, banUntil?: string }
 */
export const banUser = async (userId, banData) => {
  try {
    const { data } = await apiClient.put(`/users/${userId}/ban`, banData);
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};