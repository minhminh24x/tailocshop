// File: frontend/src/services/adminVipLevelService.js
import apiClient from './apiClient.js';

const API_URL = '/vip-levels';

// (ADMIN) Lấy tất cả cấp VIP
export const getAllVipLevelsAdmin = () => {
  return apiClient.get(API_URL);
};

// [FIX] (ADMIN) Tạo cấp VIP mới
// Schema: { level, name, coinThreshold, discountPercent }
export const createVipLevelAdmin = (vipLevelData) => {
  return apiClient.post(API_URL, vipLevelData);
};

// (ADMIN) Cập nhật cấp VIP - sử dụng level làm identifier
export const updateVipLevelAdmin = (level, updateData) => {
  return apiClient.patch(`${API_URL}/${level}`, updateData);
};

// [FIX] (ADMIN) Xóa cấp VIP - sử dụng level thay vì id
export const deleteVipLevelAdmin = (level) => {
  return apiClient.delete(`${API_URL}/${level}`);
};