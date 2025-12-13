// File: backend/server/routes/voucher.route.js
import express from 'express';
import { voucherController } from '../controllers/voucher.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// ========== Customer Routes ==========
// POST /api/vouchers/validate - Kiểm tra và validate voucher
router.post('/validate', protect, voucherController.validateVoucher);

// ========== Admin Routes ==========
// GET /api/vouchers - Lấy tất cả vouchers
router.get('/', protect, authorize('ADMIN'), voucherController.getAllVouchers);

// GET /api/vouchers/:voucherId - Lấy chi tiết voucher
router.get('/:voucherId', protect, authorize('ADMIN'), voucherController.getVoucherById);

// POST /api/vouchers - Tạo voucher mới
router.post('/', protect, authorize('ADMIN'), voucherController.createVoucher);

// PATCH /api/vouchers/:voucherId - Cập nhật voucher
router.patch('/:voucherId', protect, authorize('ADMIN'), voucherController.updateVoucher);

// DELETE /api/vouchers/:voucherId - Xóa voucher
router.delete('/:voucherId', protect, authorize('ADMIN'), voucherController.deleteVoucher);

export default router;
