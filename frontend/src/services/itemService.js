// File: frontend/src/services/itemService.js
import apiClient from './apiClient.js';

/**
 * Lấy tất cả vật phẩm (cho trang /items)
 */
export const getAllItems = () => {
  return apiClient.get('/items');
};

/**
 * Lấy chi tiết một vật phẩm bằng slug và unit
 * @param {string} slug 
 * @param {string} unit 
 */
export const getSingleItem = (slug, unit) => {
  return apiClient.get(`/items/${slug}/${unit}`);
};