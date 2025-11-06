import express from 'express';

// === ĐÃ SỬA LỖI ĐƯỜNG DẪN ===

// Import controller trực tiếp từ file, lùi 1 cấp
import { categoryController } from '../controllers/category.controller.js';

// Import middleware 'validate' trực tiếp, lùi 1 cấp
// (Giả sử đây là export default)
import validate from '../middleware/validate.js';

// Import validation từ file 'index.js' trong 'validations', lùi 1 cấp
import { categoryValidation } from '../index.js';

// Import middleware xác thực, lùi 1 cấp
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