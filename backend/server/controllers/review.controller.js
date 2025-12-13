// File: backend/server/controllers/review.controller.js
import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';
import { reviewService } from '../service/review.service.js';

// ========== Customer Endpoints ==========

/**
 * Lấy reviews của một item (public)
 */
const getItemReviews = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const result = await reviewService.getItemReviews(itemId, req.query);
    res.status(httpStatus.OK).send(result);
});

/**
 * Tạo review mới
 */
const createReview = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const review = await reviewService.createReview(userId, req.body);
    res.status(httpStatus.CREATED).send(review);
});

/**
 * Cập nhật review của mình
 */
const updateMyReview = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const review = await reviewService.updateMyReview(userId, reviewId, req.body);
    res.status(httpStatus.OK).send(review);
});

/**
 * Xóa review của mình
 */
const deleteMyReview = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const result = await reviewService.deleteMyReview(userId, reviewId);
    res.status(httpStatus.OK).send(result);
});

// ========== Admin Endpoints ==========

/**
 * [Admin] Lấy tất cả reviews
 */
const getAllReviewsAdmin = asyncHandler(async (req, res) => {
    const result = await reviewService.getAllReviewsAdmin(req.query);
    res.status(httpStatus.OK).send(result);
});

/**
 * [Admin] Duyệt/Từ chối review
 */
const approveReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { isApproved } = req.body;

    if (isApproved === undefined) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: 'isApproved là bắt buộc'
        });
    }

    const review = await reviewService.approveReview(reviewId, isApproved);
    res.status(httpStatus.OK).send(review);
});

/**
 * [Admin] Xóa review
 */
const deleteReviewAdmin = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const result = await reviewService.deleteReviewAdmin(reviewId);
    res.status(httpStatus.OK).send(result);
});

export const reviewController = {
    getItemReviews,
    createReview,
    updateMyReview,
    deleteMyReview,
    getAllReviewsAdmin,
    approveReview,
    deleteReviewAdmin,
};
