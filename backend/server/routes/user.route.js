// File: server/routes/user.route.js
import express from 'express';
import { getMyProfile } from '../controllers/user.controller.js';

// [SỬA] Đổi tên 'verifyToken' thành 'protect' 
// để khớp với file auth.middleware.js đã nâng cấp của chúng ta
import { protect } from '../middleware/auth.middleware.js'; 

const router = express.Router();

// Đây là điểm mấu chốt:
// Bất kỳ ai gọi 'GET /api/users/profile'
// Sẽ phải đi qua 'protect' TRƯỚC
// Nếu 'protect' thành công (gọi next()), thì mới tới 'getMyProfile'

// [SỬA] Đổi tên 'verifyToken' thành 'protect' tại đây
router.get('/profile', protect, getMyProfile);

export default router;