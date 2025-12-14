// File: backend/server/service/otp.service.js
import prisma from '../lib/prisma.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

// OTP hết hạn sau 10 phút
const OTP_EXPIRY_MINUTES = 10;

// Cấu hình email transporter
const createTransporter = () => {
    // [FIX] Sử dụng đúng tên biến môi trường
    const emailUser = process.env.EMAIL_USERNAME || process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
        console.error('[EMAIL] Missing EMAIL_USERNAME or EMAIL_PASSWORD in .env');
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });
};

/**
 * Tạo mã OTP 6 số
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Gửi OTP đến email để xác thực đăng ký
 * @param {string} email 
 * @param {string} inGameName 
 */
const sendRegistrationOTP = async (email, inGameName) => {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (existingUser) {
        throw new ApiError(httpStatus.CONFLICT, 'Email này đã được đăng ký!');
    }

    // Tạo OTP
    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Lưu OTP vào bảng tạm (hoặc Redis nếu có)
    // Sử dụng upsert để cập nhật nếu email đã có OTP
    await prisma.pendingOTP.upsert({
        where: { email: email.toLowerCase() },
        create: {
            email: email.toLowerCase(),
            otp: otp,
            expiresAt: expiryTime,
            type: 'REGISTRATION',
        },
        update: {
            otp: otp,
            expiresAt: expiryTime,
        }
    });

    // Gửi email
    try {
        const transporter = createTransporter();

        await transporter.sendMail({
            from: `"Tài Lộc Shop" <${process.env.EMAIL_USERNAME || process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Mã xác thực đăng ký - Tài Lộc Shop',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a2e; color: #eee;">
          <h1 style="color: #e94057; text-align: center;">Tài Lộc Shop</h1>
          <h2 style="color: #fff; text-align: center;">Xác Thực Email Đăng Ký</h2>
          <p style="color: #ccc; line-height: 1.6;">
            Xin chào <strong>${inGameName}</strong>,
          </p>
          <p style="color: #ccc; line-height: 1.6;">
            Cảm ơn bạn đã đăng ký tài khoản tại Tài Lộc Shop. Đây là mã xác thực của bạn:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #2d2d44; padding: 20px 40px; border-radius: 12px; display: inline-block; border: 2px solid #e94057;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #e94057;">
                ${otp}
              </span>
            </div>
          </div>
          <p style="color: #888; font-size: 12px; line-height: 1.6; text-align: center;">
            Mã này sẽ hết hạn sau <strong>${OTP_EXPIRY_MINUTES} phút</strong>.<br>
            Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.
          </p>
          <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;">
          <p style="color: #666; font-size: 11px; text-align: center;">
            © 2024 Tài Lộc Shop. All rights reserved.
          </p>
        </div>
      `,
        });

        console.log(`[OTP] Đã gửi mã xác thực đến: ${email}`);
        return { message: 'Mã xác thực đã được gửi đến email của bạn!' };
    } catch (error) {
        console.error('[OTP] Lỗi gửi email:', error);
        // Xóa OTP nếu gửi thất bại
        await prisma.pendingOTP.delete({
            where: { email: email.toLowerCase() }
        }).catch(() => { });
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Không thể gửi email. Vui lòng thử lại sau.');
    }
};

/**
 * Xác thực OTP và trả về trạng thái
 * @param {string} email 
 * @param {string} otp 
 */
const verifyOTP = async (email, otp) => {
    const pendingOTP = await prisma.pendingOTP.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (!pendingOTP) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Không tìm thấy mã OTP. Vui lòng yêu cầu mã mới.');
    }

    if (new Date() > pendingOTP.expiresAt) {
        // Xóa OTP hết hạn
        await prisma.pendingOTP.delete({
            where: { email: email.toLowerCase() }
        }).catch(() => { });
        throw new ApiError(httpStatus.BAD_REQUEST, 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
    }

    if (pendingOTP.otp !== otp) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Mã OTP không đúng. Vui lòng kiểm tra lại.');
    }

    // OTP đúng - đánh dấu đã xác thực
    await prisma.pendingOTP.update({
        where: { email: email.toLowerCase() },
        data: { verified: true }
    });

    return { verified: true, message: 'Xác thực thành công!' };
};

/**
 * Kiểm tra email đã xác thực OTP chưa (dùng khi hoàn tất đăng ký)
 * @param {string} email 
 */
const checkOTPVerified = async (email) => {
    const pendingOTP = await prisma.pendingOTP.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (!pendingOTP || !pendingOTP.verified) {
        return false;
    }

    // Kiểm tra còn hạn không (thêm 5 phút grace period sau khi verified)
    const gracePeriod = new Date(pendingOTP.expiresAt.getTime() + 5 * 60 * 1000);
    if (new Date() > gracePeriod) {
        await prisma.pendingOTP.delete({
            where: { email: email.toLowerCase() }
        }).catch(() => { });
        return false;
    }

    return true;
};

/**
 * Xóa OTP sau khi đăng ký thành công
 * @param {string} email 
 */
const clearOTP = async (email) => {
    await prisma.pendingOTP.delete({
        where: { email: email.toLowerCase() }
    }).catch(() => { });
};

export const otpService = {
    sendRegistrationOTP,
    verifyOTP,
    checkOTPVerified,
    clearOTP,
};
