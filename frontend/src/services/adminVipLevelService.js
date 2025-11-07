// File: frontend/src/services/adminVipLevelService.js
import apiClient from './apiClient.js';

const API_URL = '/vip-levels';

// (ADMIN) Lấy tất cả cấp VIP
export const getAllVipLevelsAdmin = () => {
  return apiClient.get(API_URL); // Dùng route admin
};

// (ADMIN) Tạo cấp VIP mới
export const createVipLevelAdmin = (vipLevelData) => {
  // { name, minSpent, discountPercent, levelInt }
  return apiClient.post(API_URL, vipLevelData);
};

// (ADMIN) Cập nhật cấp VIP
export const updateVipLevelAdmin = (level, updateData) => {
  return apiClient.patch(`${API_URL}/${level}`, updateData);
};

// (ADMIN) Xóa cấp VIP
export const deleteVipLevelAdmin = (id) => {
  return apiClient.delete(`${API_URL}/${id}`);
};