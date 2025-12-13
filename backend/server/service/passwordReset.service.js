// File: backend/server/service/passwordReset.service.js
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

// Cấu hình email transporter (sử dụng Gmail hoặc SMTP server khác)
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // App password for Gmail
        },
    });
};

/**
 * Tạo một token reset password an toàn
 * @returns {string} Token 32 bytes hex
 */
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash token trước khi lưu vào DB
 * @param {string} token 
 * @returns {string} Hashed token
 */
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Gửi email yêu cầu đặt lại mật khẩu
 * @param {string} email 
 */
const requestPasswordReset = async (email) => {
    // 1. Tìm user theo email
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });

    // Không tiết lộ user có tồn tại hay không (bảo mật)
    if (!user) {
        // Vẫn trả về success để không tiết lộ email có tồn tại hay không
        console.log(`[Password Reset] Email không tồn tại: ${email}`);
        return { message: 'Nếu email tồn tại, bạn sẽ nhận được email hướng dẫn.' };
    }

    // 2. Tạo token và hash
    const resetToken = generateResetToken();
    const hashedToken = hashToken(resetToken);

    // Token hết hạn sau 1 giờ
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    // 3. Lưu token vào user (cần thêm fields trong schema)
    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordResetToken: hashedToken,
            passwordResetExpiry: resetTokenExpiry,
        }
    });

    // 4. Tạo link reset
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // 5. Gửi email
    try {
        const transporter = createTransporter();

        await transporter.sendMail({
            from: `"Tài Lộc Shop" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Đặt lại mật khẩu - Tài Lộc Shop',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a2e; color: #eee;">
          <h1 style="color: #e94057; text-align: center;">Tài Lộc Shop</h1>
          <h2 style="color: #fff; text-align: center;">Đặt lại mật khẩu</h2>
          <p style="color: #ccc; line-height: 1.6;">
            Xin chào <strong>${user.inGameName}</strong>,
          </p>
          <p style="color: #ccc; line-height: 1.6;">
            Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Nhấn nút bên dưới để tiếp tục:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #e94057; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Đặt lại mật khẩu
            </a>
          </div>
          <p style="color: #888; font-size: 12px; line-height: 1.6;">
            Link này sẽ hết hạn sau <strong>1 giờ</strong>.<br>
            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
          </p>
          <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;">
          <p style="color: #666; font-size: 11px; text-align: center;">
            © 2024 Tài Lộc Shop. All rights reserved.
          </p>
        </div>
      `,
        });

        console.log(`[Password Reset] Email đã gửi đến: ${email}`);
    } catch (error) {
        console.error('[Password Reset] Lỗi gửi email:', error);
        // Reset token nếu gửi email thất bại
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: null,
                passwordResetExpiry: null,
            }
        });
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Không thể gửi email. Vui lòng thử lại sau.');
    }

    return { message: 'Nếu email tồn tại, bạn sẽ nhận được email hướng dẫn.' };
};

/**
 * Đặt lại mật khẩu với token
 * @param {string} token - Reset token từ email
 * @param {string} email - Email người dùng
 * @param {string} newPassword - Mật khẩu mới
 */
const resetPassword = async (token, email, newPassword) => {
    // 1. Hash token để so sánh với DB
    const hashedToken = hashToken(token);

    // 2. Tìm user với token hợp lệ và chưa hết hạn
    const user = await prisma.user.findFirst({
        where: {
            email: email.toLowerCase(),
            passwordResetToken: hashedToken,
            passwordResetExpiry: { gt: new Date() }
        }
    });

    if (!user) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.');
    }

    // 3. Validate mật khẩu mới
    if (!newPassword || newPassword.length < 6) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Mật khẩu mới phải có ít nhất 6 ký tự.');
    }

    // 4. Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 5. Cập nhật mật khẩu và xóa token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash: hashedPassword,
            passwordResetToken: null,
            passwordResetExpiry: null,
            mustChangePassword: false, // Reset flag này nếu có
        }
    });

    console.log(`[Password Reset] Đã đặt lại mật khẩu cho: ${email}`);
    return { message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.' };
};

/**
 * Kiểm tra token có hợp lệ không (dùng frontend để validate trước khi hiển thị form)
 * @param {string} token 
 * @param {string} email 
 */
const verifyResetToken = async (token, email) => {
    const hashedToken = hashToken(token);

    const user = await prisma.user.findFirst({
        where: {
            email: email.toLowerCase(),
            passwordResetToken: hashedToken,
            passwordResetExpiry: { gt: new Date() }
        },
        select: { id: true, inGameName: true }
    });

    if (!user) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Token không hợp lệ hoặc đã hết hạn.');
    }

    return {
        valid: true,
        inGameName: user.inGameName
    };
};

export const passwordResetService = {
    requestPasswordReset,
    resetPassword,
    verifyResetToken,
};
