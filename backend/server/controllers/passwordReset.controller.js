// File: backend/server/controllers/passwordReset.controller.js
import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';
import { passwordResetService } from '../service/passwordReset.service.js';

/**
 * Yêu cầu đặt lại mật khẩu (gửi email)
 * POST /api/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: 'Vui lòng cung cấp email'
        });
    }

    const result = await passwordResetService.requestPasswordReset(email);
    res.status(httpStatus.OK).json(result);
});

/**
 * Đặt lại mật khẩu với token
 * POST /api/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: 'Vui lòng cung cấp đầy đủ thông tin'
        });
    }

    const result = await passwordResetService.resetPassword(token, email, newPassword);
    res.status(httpStatus.OK).json(result);
});

/**
 * Kiểm tra token có hợp lệ không
 * POST /api/auth/verify-reset-token
 */
const verifyResetToken = asyncHandler(async (req, res) => {
    const { token, email } = req.body;

    if (!token || !email) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: 'Token và email là bắt buộc'
        });
    }

    const result = await passwordResetService.verifyResetToken(token, email);
    res.status(httpStatus.OK).json(result);
});

export const passwordResetController = {
    forgotPassword,
    resetPassword,
    verifyResetToken,
};
