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
 * @param {object} orderData - { items, inGameName, deliveryTimeSlotId, preferredCurrency }
 */
export const createOrder = async (orderData) => {
  try {
    // [SỬA] Đảm bảo gửi đủ 4 trường
    const { items, inGameName, deliveryTimeSlotId, preferredCurrency } = orderData;
    
    // Ánh xạ items trong giỏ hàng (từ cartStore) sang định dạng API cần
    const mappedItems = items.map(item => ({
      itemId: item.id,
      quantity: item.quantity,
    }));

    const response = await apiClient.post('/orders', {
      items: mappedItems,
      inGameName,
      deliveryTimeSlotId,
      preferredCurrency // [SỬA] Gửi tiền tệ ưu tiên
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};