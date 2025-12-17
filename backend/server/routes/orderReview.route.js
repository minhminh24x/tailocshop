// File: backend/server/routes/orderReview.route.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import * as orderReviewController from '../controllers/orderReview.controller.js';

const router = express.Router();

// Routes cho Customer (đánh giá đơn hàng của mình)
router.post(
    '/orders/:orderId',
    protect,
    orderReviewController.createReview
);

// Lấy đánh giá của một đơn hàng (ai đăng nhập cũng xem được)
router.get(
    '/orders/:orderId',
    protect,
    orderReviewController.getReviewByOrderId
);

// Routes cho Admin/Staff (xem tất cả đánh giá)
router.get(
    '/',
    protect,
    authorize('ADMIN', 'MANAGER', 'STAFF'),
    orderReviewController.getAllReviews
);

// Thống kê đánh giá
router.get(
    '/stats',
    protect,
    authorize('ADMIN', 'MANAGER', 'STAFF'),
    orderReviewController.getReviewStats
);

export default router;
