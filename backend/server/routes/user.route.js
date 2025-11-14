// File: server/routes/user.route.js
import express from 'express';
// [THÊM] Import controller đổi mật khẩu
import { getMyProfile, changeMyPassword } from '../controllers/user.controller.js';
import { userValidation } from '../validations/user.validation.js'; //
import { userController } from '../controllers/user.controller.js'; //


// [SỬA] Đổi tên 'verifyToken' thành 'protect' 
// để khớp với file auth.middleware.js đã nâng cấp của chúng ta
import { protect } from '../middleware/auth.middleware.js'; 

const router = express.Router();

// [MỚI] POST /api/v1/users
// (Admin tạo tài khoản Staff/Supplier)
router.post(
  '/',
  auth('ADMIN'), // Chỉ Admin
  validate(userValidation.adminCreateUser),
  userController.adminCreateUser
);

// [MỚI] PUT /api/v1/users/change-password
// (User tự đổi mật khẩu, áp dụng cho cả việc đổi lần đầu)
router.put(
  '/change-password',
  auth(), // Bất kỳ ai đã đăng nhập
  validate(userValidation.changeMyPassword),
  userController.changeMyPassword
);

// Đây là điểm mấu chốt:
// Bất kỳ ai gọi 'GET /api/users/profile'
// Sẽ phải đi qua 'protect' TRƯỚC
// Nếu 'protect' thành công (gọi next()), thì mới tới 'getMyProfile'

// [SỬA] Đổi tên 'verifyToken' thành 'protect' tại đây
router.get('/profile', protect, getMyProfile); //

// [THÊM] Route mới để đổi mật khẩu
// Cũng phải đi qua 'protect' để biết là user nào đang muốn đổi
router.put('/change-password', protect, changeMyPassword);

export default router;