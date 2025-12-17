// File: server/routes/auth.route.js
import express from 'express';
import rateLimit from 'express-rate-limit'; // [FIX] Import rate limiter
import { register, login, logout } from '../controllers/auth.controller.js';
import { passwordResetController } from '../controllers/passwordReset.controller.js';
import { otpController } from '../controllers/otp.controller.js'; // [THÊM]

const router = express.Router();

// [FIX] Rate limiter cho password reset - chống spam/abuse
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 giờ
    max: 3, // Tối đa 3 request/IP/giờ
    message: {
        status: 'error',
        message: 'Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 1 giờ.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Định nghĩa tuyến đường cho 'register', 'login' và 'logout'
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// [MỚI] OTP Routes cho đăng ký
router.post('/send-otp', otpController.sendOTP);
router.post('/verify-otp', otpController.verifyOTP);

// [FIX] Password Reset Routes - thêm rate limiter
router.post('/forgot-password', passwordResetLimiter, passwordResetController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, passwordResetController.resetPassword);
router.post('/verify-reset-token', passwordResetController.verifyResetToken);

export default router;