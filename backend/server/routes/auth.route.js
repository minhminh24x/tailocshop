// File: server/routes/auth.route.js
import express from 'express';
import { register, login, logout } from '../controllers/auth.controller.js';
import { passwordResetController } from '../controllers/passwordReset.controller.js';

const router = express.Router();

// Định nghĩa tuyến đường cho 'register', 'login' và 'logout'
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// [MỚI] Password Reset Routes
router.post('/forgot-password', passwordResetController.forgotPassword);
router.post('/reset-password', passwordResetController.resetPassword);
router.post('/verify-reset-token', passwordResetController.verifyResetToken);

export default router;