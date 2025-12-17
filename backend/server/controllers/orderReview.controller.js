// File: backend/server/controllers/orderReview.controller.js
import { orderReviewService } from '../service/orderReview.service.js';
import httpStatus from 'http-status';

/**
 * Tạo đánh giá đơn hàng (Customer)
 */
export const createReview = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const { productRating, serviceRating, staffRating, comment } = req.body;

        const review = await orderReviewService.createReview(userId, orderId, {
            productRating,
            serviceRating,
            staffRating,
            comment,
        });

        res.status(httpStatus.CREATED).json({
            message: 'Đánh giá thành công!',
            data: review,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy đánh giá của một đơn hàng
 */
export const getReviewByOrderId = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const review = await orderReviewService.getReviewByOrderId(orderId);

        if (!review) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Đơn hàng chưa được đánh giá',
            });
        }

        res.json(review);
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy tất cả đánh giá (Admin)
 */
export const getAllReviews = async (req, res, next) => {
    try {
        const { page, limit, staffId } = req.query;
        const result = await orderReviewService.getAllReviews({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            staffId,
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy thống kê đánh giá
 */
export const getReviewStats = async (req, res, next) => {
    try {
        const { staffId } = req.query;
        const stats = await orderReviewService.getReviewStats(staffId || null);

        res.json(stats);
    } catch (error) {
        next(error);
    }
};
