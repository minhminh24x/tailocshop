// server/routes/item.route.js
import express from 'express';
import { itemController } from '../controllers/item.controller.js';
import validate from '../middleware/validate.js';
import { itemValidation } from '../validations/index.js';
// [QUAN TRỌNG] Import middleware bảo vệ
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// === ADMIN ROUTES (Cần bảo mật) ===
// API lấy toàn bộ item cho Admin (bao gồm cả ẩn)
router.get(
  '/admin/all',
  protect, // Đã bật bảo vệ đăng nhập
  isAdmin, // Đã bật bảo vệ quyền Admin
  itemController.getAllItemsAdmin
);

router.post(
  '/',
  protect,
  isAdmin,
  validate(itemValidation.createItemSchema),
  itemController.createItem
);

router.patch(
  '/:id',
  protect,
  isAdmin,
  validate(itemValidation.updateItemSchema),
  itemController.updateItem
);

router.delete(
  '/:id',
  protect,
  isAdmin,
  validate(itemValidation.deleteItemSchema),
  itemController.deleteItem
);

// === PUBLIC ROUTES (Để cuối để tránh trùng route) ===
router.get('/featured', itemController.getFeaturedItems);
router.get('/', itemController.getAllItems);

// [SỬA] Slug là unique nên chỉ cần slug, không cần unit
router.get('/:slug', itemController.getItem);

// [DEPRECATED] Giữ lại route cũ để tương thích ngược - bỏ qua unit
router.get('/:slug/:unit', itemController.getItem);

export default router;