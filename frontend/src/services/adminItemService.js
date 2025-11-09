// File: frontend/src/services/adminItemService.js
import apiClient from './apiClient.js';

// (ADMIN) Lấy tất cả vật phẩm (Tạm dùng API public)
export const getAllItemsAdmin = () => {
 return apiClient.get('/items/admin/all');
  // Lưu ý: API này hiện chỉ lấy item "isActive: true".
  // Lý tưởng nhất là backend nên có route /api/items/admin/all
};

// (ADMIN) Tạo vật phẩm mới
export const createItemAdmin = (itemData) => {
  return apiClient.post('/items', itemData);
};

// (ADMIN) Cập nhật vật phẩm
export const updateItemAdmin = (id, updateData) => {
  return apiClient.patch(`/items/${id}`, updateData);
};

// (ADMIN) Xóa vật phẩm
export const deleteItemAdmin = (id) => {
  return apiClient.delete(`/items/${id}`);
};