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
 * [SỬA] Lấy chi tiết một vật phẩm bằng slug (không cần unit nữa vì slug là unique)
 * @param {string} slug 
 * @param {string} unit - [DEPRECATED] Không dùng nữa, giữ lại để tương thích
 */
export const getSingleItem = (slug, unit) => {
  // Chỉ dùng slug, bỏ qua unit (giữ lại param để tương thích ngược)
  return apiClient.get(`/items/${slug}`);
};