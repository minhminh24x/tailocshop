// server/routes/category.route.js
import express from 'express';
import { categoryController } from '../controllers/category.controller.js';
import validate from '../middleware/validate.js';

// [ĐÃ SỬA LỖI]
// Đường dẫn import bây giờ trỏ thẳng đến file .js cụ thể
import { categoryValidation } from '../validations/category.validation.js';

import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// 1. GET (Public) - Lấy tất cả
router.get('/', categoryController.getAllCategories);

// 2. GET (Public) - Lấy chi tiết theo SLUG
router.get(
  '/:slug',
  validate(categoryValidation.getCategoryBySlugSchema),
  categoryController.getCategoryBySlug
);

// 3. POST (Admin Only) - Tạo mới
router.post(
  '/',
  protect,
  isAdmin,
  validate(categoryValidation.createCategorySchema),
  categoryController.createCategory
);

// 4. PATCH (Admin Only) - Cập nhật theo ID
router.patch(
  '/:id',
  protect,
  isAdmin,
  validate(categoryValidation.updateCategorySchema),
  categoryController.updateCategory
);

// 5. DELETE (Admin Only) - Xóa theo ID
router.delete(
  '/:id',
  protect,
  isAdmin,
  validate(categoryValidation.deleteCategorySchema),
  categoryController.deleteCategory
);

export default router;