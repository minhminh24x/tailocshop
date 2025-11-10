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
 * Gửi yêu cầu tạo đơn hàng mới
 * @param {object} orderData - { items, inGameName, deliveryTimeSlotId }
 */
export const createOrder = async (orderData) => {
  try {
    // Gửi thẳng 'orderData' mà không cần xử lý hay ánh xạ lại.
    const response = await apiClient.post('/orders', orderData);
    return response.data;
    
  } catch (error) {
    // Log lỗi vẫn giữ nguyên
    console.error("Lỗi khi tạo đơn hàng:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};