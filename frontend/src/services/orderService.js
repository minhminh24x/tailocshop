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
 * [SỬA] Gửi yêu cầu tạo đơn hàng mới
 * @param {Array} items - [{ itemId, quantity }, ...]
 * @param {string} inGameName - Tên trong game của user
 * @param {string} deliveryTimeSlotId - ID khung giờ nhận hàng
 */
export const createOrder = (items, inGameName, deliveryTimeSlotId) => {
  const payload = {
    items: items.map(entry => ({
      itemId: entry.itemData.id,
      quantity: entry.quantity
    })),
    inGameName,
    deliveryTimeSlotId,
    // [FIX 1] Thêm trường currencyUsed mà backend yêu cầu
    currencyUsed: 'COIN', 
  };
  
  // [FIX 2] Đổi route từ /orders/create thành /orders
  // (Log của bạn cho thấy bạn đã gọi /orders, nhưng tệp bạn gửi
  // vẫn là /orders/create. Tôi sửa lại ở đây cho chắc chắn.)
  return apiClient.post('/orders', payload); 
};