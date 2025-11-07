// File: backend/server/routes/vipLevel.route.js
import express from 'express';
import { vipLevelController } from '../controllers/vipLevel.controller.js';
import { authValidation } from '../validations/index.js';
import validate from '../middleware/validate.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// === ROUTE PUBLIC ===
// Lấy tất cả cấp độ VIP (cho trang "Quyền lợi VIP" nếu cần)
router.get('/public', vipLevelController.getAllVipLevels);

// === CÁC ROUTE CỦA ADMIN ===
router
  .route('/')
  .post(
    protect,
    authorize('ADMIN'),
    validate(authValidation.vipLevelValidation.createVipLevel),
    vipLevelController.createVipLevel
  )
  .get(
    protect,
    authorize('ADMIN'),
    vipLevelController.getAllVipLevels // Admin cũng dùng route này
  );

router
  .route('/:id')
  .get(
    protect,
    authorize('ADMIN'),
    validate(authValidation.vipLevelValidation.getVipLevel),
    vipLevelController.getVipLevelById
  )
  .patch(
    protect,
    authorize('ADMIN'),
    validate(authValidation.vipLevelValidation.updateVipLevel),
    vipLevelController.updateVipLevelById
  )
  .delete(
    protect,
    authorize('ADMIN'),
    validate(authValidation.vipLevelValidation.deleteVipLevel),
    vipLevelController.deleteVipLevelById
  );

export default router;