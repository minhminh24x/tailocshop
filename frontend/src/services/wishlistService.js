// File: frontend/src/services/wishlistService.js
import apiClient from './apiClient.js';

/**
 * Lấy danh sách wishlist của user
 */
export const getMyWishlist = () => {
    return apiClient.get('/wishlist');
};

/**
 * Thêm item vào wishlist
 * @param {string} itemId 
 */
export const addToWishlist = (itemId) => {
    return apiClient.post('/wishlist', { itemId });
};

/**
 * Xóa item khỏi wishlist
 * @param {string} itemId 
 */
export const removeFromWishlist = (itemId) => {
    return apiClient.delete(`/wishlist/${itemId}`);
};

/**
 * Toggle wishlist (thêm/xóa)
 * @param {string} itemId 
 */
export const toggleWishlist = (itemId) => {
    return apiClient.post('/wishlist/toggle', { itemId });
};

/**
 * Kiểm tra item có trong wishlist không
 * @param {string} itemId 
 */
export const checkInWishlist = (itemId) => {
    return apiClient.get(`/wishlist/check/${itemId}`);
};
