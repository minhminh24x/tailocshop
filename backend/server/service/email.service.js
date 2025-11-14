// File: backend/server/service/email.service.js
import nodemailer from 'nodemailer';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';

// Cấu hình transporter (Nên dùng biến môi trường)
// Ví dụ test với Ethereal (lấy Ethereal credentials để test)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false, // true for 465, false cho các port khác
  auth: {
    user: process.env.EMAIL_USER || 'YOUR_ETHEREAL_USER', //
    pass: process.env.EMAIL_PASS || 'YOUR_ETHEREAL_PASSWORD', //
  },
});

/**
 * Gửi email chứa mật khẩu tạm thời
 * @param {string} toEmail - Email người nhận
 * @param {string} inGameName - Tên in-game
 * @param {string} temporaryPassword - Mật khẩu tạm thời
 */
const sendTemporaryPasswordEmail = async (toEmail, inGameName, temporaryPassword) => {
  const mailOptions = {
    from: '"Tài Lộc Shop" <noreply@tailocshop.com>',
    to: toEmail,
    subject: 'Tài khoản của bạn tại Tài Lộc Shop đã được tạo',
    html: `
      <p>Xin chào ${inGameName},</p>
      <p>Một tài khoản đã được tạo cho bạn trên hệ thống Tài Lộc Shop.</p>
      <p>Vui lòng sử dụng thông tin dưới đây để đăng nhập:</p>
      <ul>
        <li><strong>Email:</strong> ${toEmail}</li>
        <li><strong>Mật khẩu tạm thời:</strong> <code>${temporaryPassword}</code></li>
      </ul>
      <p>Bạn sẽ bị <strong>bắt buộc</strong> đổi mật khẩu này ngay sau khi đăng nhập lần đầu tiên.</p>
      <p>Trân trọng,<br>Tài Lộc Shop</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    // Link xem email test trên Ethereal
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Không thể gửi email: ${error.message}`);
  }
};

export const emailService = {
  sendTemporaryPasswordEmail,
};