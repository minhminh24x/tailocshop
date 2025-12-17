// File: backend/server/routes/user.route.js
import express from 'express';

// [SỬA] Xóa import lẻ
// import { getMyProfile, changeMyPassword } from '../controllers/user.controller.js';

// [GIỮ NGUYÊN] Import validation và controller
import { userValidation } from '../validations/user.validation.js';
import { userController } from '../controllers/user.controller.js'; //

// [SỬA] Import 'protect' và 'authorize'
import { protect, authorize } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.js'; // Thêm import validate

const router = express.Router();

// [CHUẨN HÓA] POST /api/v1/users (Admin tạo)
router.post(
  '/',
  protect, // 1. Phải đăng nhập
  authorize('ADMIN'), // 2. Phải là Admin
  validate(userValidation.adminCreateUser), // 3. Validate
  userController.adminCreateUser
);

// [CHUẨN HÓA] PUT /api/v1/users/change-password (User tự đổi)
router.put(
  '/change-password',
  protect, // 1. Phải đăng nhập
  validate(userValidation.changeMyPassword), // 2. Validate
  userController.changeMyPassword
);

// [CHUẨN HÓA] GET /api/v1/users/profile (Lấy thông tin cá nhân)
router.get(
  '/profile',
  protect, // 1. Phải đăng nhập
  userController.getMyProfile // Gọi qua controller
);

// [XÓA] Xóa route /change-password bị lặp
// router.put('/change-password', protect, changeMyPassword);

// [SỬA] Thêm route GET /
router
  .route('/')
  // (Admin tạo tài khoản Staff/Supplier)
  .post(
    protect,
    authorize('ADMIN'),
    validate(userValidation.adminCreateUser),
    userController.adminCreateUser
  )
  // [MỚI] (Admin Lấy danh sách user)
  .get(
    protect,
    authorize('ADMIN'),
    userController.adminGetUsers
  );

// [MỚI] (Admin Lấy chi tiết user)
router.get(
  '/:userId',
  protect,
  authorize('ADMIN'),
  userController.adminGetUserDetail
);

// [MỚI] Admin ban/unban user
router.put(
  '/:userId/ban',
  protect,
  authorize('ADMIN'),
  userController.adminBanUser
);

export default router;