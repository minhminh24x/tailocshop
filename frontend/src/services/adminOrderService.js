// File: frontend/src/services/adminOrderService.js
import apiClient from './apiClient.js';

// (ADMIN) Lấy tất cả đơn hàng
export const getAllOrdersAdmin = () => {
  return apiClient.get('/orders/admin'); // [FIX] Đã bỏ /all để khớp với backend
};

// (ADMIN) Lấy chi tiết 1 đơn hàng
export const getOrderByIdAdmin = (orderId) => {
  return apiClient.get(`/orders/admin/${orderId}`);
};

// (ADMIN) Cập nhật 1 đơn hàng
export const updateOrderAdmin = (orderId, updateData) => {
  // updateData: { status: "NEW_STATUS", paymentStatus: "NEW_STATUS" }
  return apiClient.patch(`/orders/admin/${orderId}`, updateData);
};