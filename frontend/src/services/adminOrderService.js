// File: frontend/src/services/adminOrderService.js
import apiClient from './apiClient.js';

/**
 * [NÂNG CẤP] (ADMIN) Lấy đơn hàng với pagination và filter
 * @param {object} params - { page, limit, status, paymentStatus, fromDate, toDate }
 * @returns {Promise<{data: Order[], pagination: object}>}
 */
export const getAllOrdersAdmin = (params = {}) => {
  return apiClient.get('/orders/admin', { params });
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