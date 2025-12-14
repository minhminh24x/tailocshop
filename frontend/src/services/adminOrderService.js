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

// [MỚI] Chuyển đơn hàng sang bước tiếp theo
export const advanceOrderStatus = (orderId) => {
  return apiClient.post(`/orders/admin/${orderId}/advance`);
};

// [MỚI] Xác nhận thanh toán và hoàn thành đơn hàng
export const confirmPaymentAndComplete = (orderId) => {
  return apiClient.post(`/orders/admin/${orderId}/confirm-complete`);
};

// [MỚI] Constants cho order flow
export const ORDER_STATUS_FLOW = ['PENDING', 'PREPARING', 'READY_FOR_DELIVERY', 'COMPLETED'];

export const ORDER_STATUS_LABELS = {
  PENDING: 'Chờ xử lý',
  PREPARING: 'Đang chuẩn bị',
  READY_FOR_DELIVERY: 'Sẵn sàng giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export const getNextStatus = (currentStatus) => {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex >= ORDER_STATUS_FLOW.length - 1) {
    return null;
  }
  return ORDER_STATUS_FLOW[currentIndex + 1];
};