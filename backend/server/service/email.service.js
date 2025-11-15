// File: backend/server/service/email.service.js
import nodemailer from 'nodemailer';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';

// Cấu hình transporter dùng Gmail SMTP
// Yêu cầu: tạo App Password và đặt trong biến môi trường EMAIL_PASS
// EMAIL_USER = loclm112.noreply@gmail.com
// EMAIL_PASS = <App Password>
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Gmail dùng SSL cho port 465
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
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
    from: 'Tài Lộc Shop <loclm112.noreply@gmail.com>',
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
    console.log('Email sent:', info.messageId);
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Không thể gửi email: ${error.message}`
    );
  }
};

export const emailService = {
  sendTemporaryPasswordEmail,
};