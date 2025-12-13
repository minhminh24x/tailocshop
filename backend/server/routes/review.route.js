// File: backend/server/routes/review.route.js
import express from 'express';
import { reviewController } from '../controllers/review.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// ========== Public Routes ==========
// GET /api/reviews/item/:itemId - Lấy reviews của item
router.get('/item/:itemId', reviewController.getItemReviews);

// ========== Customer Routes ==========
// POST /api/reviews - Tạo review mới
router.post('/', protect, reviewController.createReview);

// PATCH /api/reviews/:reviewId - Cập nhật review của mình
router.patch('/:reviewId', protect, reviewController.updateMyReview);

// DELETE /api/reviews/:reviewId - Xóa review của mình
router.delete('/:reviewId', protect, reviewController.deleteMyReview);

// ========== Admin Routes ==========
// GET /api/reviews/admin - Lấy tất cả reviews
router.get('/admin', protect, authorize('ADMIN'), reviewController.getAllReviewsAdmin);

// PATCH /api/reviews/admin/:reviewId/approve - Duyệt review
router.patch('/admin/:reviewId/approve', protect, authorize('ADMIN'), reviewController.approveReview);

// DELETE /api/reviews/admin/:reviewId - Xóa review (admin)
router.delete('/admin/:reviewId', protect, authorize('ADMIN'), reviewController.deleteReviewAdmin);

export default router;
