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
 * @param {object} orderData - { items, inGameName, deliveryTimeSlotId }
 * Đối tượng này được gửi thẳng từ CheckoutPage.js và đã có định dạng chuẩn.
 */
export const createOrder = async (orderData) => {
  try {
    // [SỬA] Gửi thẳng 'orderData' mà không cần xử lý hay ánh xạ lại.
    // Đối tượng 'orderData' từ CheckoutPage.js đã chứa:
    // { 
    //   inGameName: "...", 
    //   deliveryTimeSlotId: "...", 
    //   items: [{ itemId, quantity, currencyAtPurchase }] 
    // }
    // Đây chính xác là những gì backend validation (order.validation.js) mong đợi.
    
    // [BỎ] Toàn bộ logic destructure và map lại đã bị xóa.
    
    const response = await apiClient.post('/orders', orderData);
    return response.data;
    
  } catch (error) {
    // Log lỗi vẫn giữ nguyên
    console.error("Lỗi khi tạo đơn hàng:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};