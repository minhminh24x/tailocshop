// File: frontend/src/services/adminCurrencyService.js
// [CODE MỚI]
import apiClient from './apiClient.js';

/**
 * [Admin] Lấy TẤT CẢ tỷ giá
 */
export const getAllRatesAdmin = () => {
  return apiClient.get('/rates');
};

/**
 * [Admin] Cập nhật một tỷ giá
 * @param {string} rateType - Tên tỷ giá (ví dụ: 'XU_TO_USD')
 * @param {number} rate - Giá trị mới
 */
export const updateRateAdmin = (rateType, rate) => {
  return apiClient.patch(`/rates/${rateType}`, { rate });
};