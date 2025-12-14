// File: backend/server/controllers/otp.controller.js
import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';
import { otpService } from '../service/otp.service.js';

/**
 * Gửi OTP đến email để xác thực đăng ký
 */
const sendOTP = asyncHandler(async (req, res) => {
    const { email, inGameName } = req.body;

    if (!email || !inGameName) {
        return res.status(httpStatus.BAD_REQUEST).send({
            message: 'Email và tên trong game là bắt buộc'
        });
    }

    const result = await otpService.sendRegistrationOTP(email, inGameName);
    res.status(httpStatus.OK).send(result);
});

/**
 * Xác thực mã OTP
 */
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(httpStatus.BAD_REQUEST).send({
            message: 'Email và mã OTP là bắt buộc'
        });
    }

    const result = await otpService.verifyOTP(email, otp);
    res.status(httpStatus.OK).send(result);
});

export const otpController = {
    sendOTP,
    verifyOTP,
};
