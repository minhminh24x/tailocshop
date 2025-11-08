// File: backend/server/routes/currency.route.js
// [CODE ĐÃ SỬA LỖI IMPORT]
import express from 'express';
import { currencyController } from '../controllers/currency.controller.js';
// [SỬA] Import đúng tên hàm từ file auth.middleware.js
import { protect, isAdmin } from '../middleware/auth.middleware.js'; 
import validate from '../middleware/validate.js';
import { currencyValidation } from '../validations/currency.validation.js';

const router = express.Router();

// === Public API (Đã có) ===
router.get('/:rateType', currencyController.getRate);

// === Admin APIs (Mới) ===

// GET /api/rates (Lấy TẤT CẢ tỷ giá cho trang quản lý)
router.get(
  '/',
  protect, // [SỬA] Dùng "protect"
  isAdmin, // [SỬA] Dùng "isAdmin"
  currencyController.getAllRates
);

// PATCH /api/rates/:rateType (Cập nhật 1 tỷ giá)
router.patch(
  '/:rateType',
  protect, // [SỬA] Dùng "protect"
  isAdmin, // [SỬA] Dùng "isAdmin"
  validate(currencyValidation.updateRateSchema), // Validate input
  currencyController.updateRate
);

export default router;  