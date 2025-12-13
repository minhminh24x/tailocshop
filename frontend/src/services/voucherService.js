// File: frontend/src/services/voucherService.js
import apiClient from './apiClient.js';

/**
 * [Customer] Validate voucher code
 * @param {string} code - Mã voucher
 * @param {number} orderTotal - Tổng tiền đơn hàng
 */
export const validateVoucher = (code, orderTotal) => {
    return apiClient.post('/vouchers/validate', { code, orderTotal });
};

// ========== Admin ==========

/**
 * [Admin] Lấy tất cả vouchers
 * @param {object} params - { page, limit, isActive }
 */
export const getAllVouchers = (params = {}) => {
    return apiClient.get('/vouchers', { params });
};

/**
 * [Admin] Lấy chi tiết voucher
 * @param {string} voucherId 
 */
export const getVoucherById = (voucherId) => {
    return apiClient.get(`/vouchers/${voucherId}`);
};

/**
 * [Admin] Tạo voucher mới
 * @param {object} voucherData 
 */
export const createVoucher = (voucherData) => {
    return apiClient.post('/vouchers', voucherData);
};

/**
 * [Admin] Cập nhật voucher
 * @param {string} voucherId 
 * @param {object} updateData 
 */
export const updateVoucher = (voucherId, updateData) => {
    return apiClient.patch(`/vouchers/${voucherId}`, updateData);
};

/**
 * [Admin] Xóa voucher
 * @param {string} voucherId 
 */
export const deleteVoucher = (voucherId) => {
    return apiClient.delete(`/vouchers/${voucherId}`);
};
