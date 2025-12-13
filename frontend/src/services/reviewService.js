// File: frontend/src/services/reviewService.js
import apiClient from './apiClient.js';

/**
 * Lấy reviews của một item
 * @param {string} itemId 
 * @param {object} params - { page, limit }
 */
export const getItemReviews = (itemId, params = {}) => {
    return apiClient.get(`/reviews/item/${itemId}`, { params });
};

/**
 * Tạo review mới
 * @param {object} reviewData - { itemId, rating, comment }
 */
export const createReview = (reviewData) => {
    return apiClient.post('/reviews', reviewData);
};

/**
 * Cập nhật review
 * @param {string} reviewId 
 * @param {object} updateData - { rating, comment }
 */
export const updateReview = (reviewId, updateData) => {
    return apiClient.patch(`/reviews/${reviewId}`, updateData);
};

/**
 * Xóa review
 * @param {string} reviewId 
 */
export const deleteReview = (reviewId) => {
    return apiClient.delete(`/reviews/${reviewId}`);
};

// ========== Admin ==========

/**
 * [Admin] Lấy tất cả reviews
 * @param {object} params - { page, limit, isApproved }
 */
export const getAllReviewsAdmin = (params = {}) => {
    return apiClient.get('/reviews/admin', { params });
};

/**
 * [Admin] Duyệt/Từ chối review
 * @param {string} reviewId 
 * @param {boolean} isApproved 
 */
export const approveReview = (reviewId, isApproved) => {
    return apiClient.patch(`/reviews/admin/${reviewId}/approve`, { isApproved });
};

/**
 * [Admin] Xóa review
 * @param {string} reviewId 
 */
export const deleteReviewAdmin = (reviewId) => {
    return apiClient.delete(`/reviews/admin/${reviewId}`);
};
