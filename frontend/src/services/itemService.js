// File: frontend/src/services/itemService.js
import apiClient from './apiClient.js';

/**
 * Lấy tất cả vật phẩm (cho trang /items)
 * [ĐÃ SỬA] Thêm tham số params để hỗ trợ phân trang, lọc, limit
 */
export const getAllItems = (params) => {
  return apiClient.get('/items', { params });
};

// Giữ nguyên hàm này để tương thích ngược nếu có chỗ nào dùng tên 'getItems' cũ
// (Alias function)
export const getItems = (params) => {
  return getAllItems(params);
};

/**
 * Lấy chi tiết một vật phẩm bằng slug và unit
 * @param {string} slug 
 * @param {string} unit 
 */
export const getSingleItem = (slug, unit) => {
  return apiClient.get(`/items/${slug}/${unit}`);
};