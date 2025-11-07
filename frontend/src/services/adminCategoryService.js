// File: frontend/src/services/adminCategoryService.js
import apiClient from './apiClient.js';

// (ADMIN) Lấy tất cả danh mục
export const getAllCategoriesAdmin = () => {
  // Sử dụng lại API public vì nó đã lấy tất cả
  return apiClient.get('/categories'); 
};

// (ADMIN) Tạo danh mục mới
export const createCategoryAdmin = (categoryData) => {
  // categoryData: { name: "Tên", parentId: "uuid-hoặc-null" }
  return apiClient.post('/categories', categoryData);
};

// (ADMIN) Cập nhật danh mục
export const updateCategoryAdmin = (id, updateData) => {
  // updateData: { name: "Tên mới", parentId: "uuid-mới" }
  return apiClient.patch(`/categories/${id}`, updateData);
};

// (ADMIN) Xóa danh mục
export const deleteCategoryAdmin = (id) => {
  return apiClient.delete(`/categories/${id}`);
};