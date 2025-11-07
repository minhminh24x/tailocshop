// File: frontend/src/services/orderService.js
import apiClient from './apiClient.js';

/**
 * Lấy danh sách đơn hàng của user đang đăng nhập
 */
export const getMyOrders = () => {
  return apiClient.get('/orders/my-orders');
};

/**
 * Lấy chi tiết một đơn hàng của user đang đăng nhập
 * @param {string} orderId 
 */
export const getMyOrderById = (orderId) => {
  return apiClient.get(`/orders/my-orders/${orderId}`);
};

/**
 * [THÊM MỚI] Gửi yêu cầu tạo đơn hàng mới
 * @param {Array} items - [{ itemId, quantity }, ...]
 * @param {string} inGameName - Tên trong game của user
 */
export const createOrder = (items, inGameName) => {
  const payload = {
    items: items.map(entry => ({
      itemId: entry.itemData.id,
      quantity: entry.quantity
    })),
    inGameName: inGameName
  };
  
  // Gọi đến route `POST /orders/create` (được bảo vệ)
  return apiClient.post('/orders/create', payload); 
};