// File: backend/server/controllers/wishlist.controller.js
import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';
import { wishlistService } from '../service/wishlist.service.js';

/**
 * Lấy danh sách wishlist của user hiện tại
 */
const getMyWishlist = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const wishlist = await wishlistService.getMyWishlist(userId);
    res.status(httpStatus.OK).send(wishlist);
});

/**
 * Thêm item vào wishlist
 */
const addToWishlist = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { itemId } = req.body;

    if (!itemId) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: 'itemId là bắt buộc'
        });
    }

    const result = await wishlistService.addToWishlist(userId, itemId);
    res.status(httpStatus.CREATED).send(result);
});

/**
 * Xóa item khỏi wishlist
 */
const removeFromWishlist = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { itemId } = req.params;

    const result = await wishlistService.removeFromWishlist(userId, itemId);
    res.status(httpStatus.OK).send(result);
});

/**
 * Kiểm tra item có trong wishlist không
 */
const checkInWishlist = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { itemId } = req.params;

    const result = await wishlistService.checkInWishlist(userId, itemId);
    res.status(httpStatus.OK).send(result);
});

/**
 * Toggle wishlist
 */
const toggleWishlist = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { itemId } = req.body;

    if (!itemId) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: 'itemId là bắt buộc'
        });
    }

    const result = await wishlistService.toggleWishlist(userId, itemId);
    res.status(httpStatus.OK).send(result);
});

export const wishlistController = {
    getMyWishlist,
    addToWishlist,
    removeFromWishlist,
    checkInWishlist,
    toggleWishlist,
};
