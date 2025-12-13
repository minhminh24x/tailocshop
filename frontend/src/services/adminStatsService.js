// File: frontend/src/services/adminStatsService.js
import apiClient from './apiClient.js';

/**
 * Lấy thống kê tổng quan Dashboard
 */
export const getDashboardStats = () => {
    return apiClient.get('/stats/dashboard');
};

/**
 * Lấy đơn hàng gần đây
 * @param {number} limit - Số lượng đơn hàng cần lấy
 */
export const getRecentOrders = (limit = 5) => {
    return apiClient.get('/stats/recent-orders', { params: { limit } });
};

/**
 * Lấy sản phẩm sắp hết hàng
 * @param {number} threshold - Ngưỡng số lượng
 * @param {number} limit - Số lượng items cần lấy
 */
export const getLowStockItems = (threshold = 10, limit = 10) => {
    return apiClient.get('/stats/low-stock', { params: { threshold, limit } });
};
