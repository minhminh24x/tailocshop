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
    if (process.env.NODE_ENV !== 'production') console.log('Email sent:', info.messageId);
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Không thể gửi email: ${error.message}`
    );
  }
};

/**
 * [MỚI] Gửi email hoàn thành đơn hàng
 * @param {object} orderData - Thông tin đơn hàng
 */
const sendOrderCompletionEmail = async (orderData) => {
  const {
    customerEmail,
    customerName,
    orderNumber,
    orderDetails,
    totalAmountCoin,
    totalAmountUsd,
    staffName,
    completedAt,
  } = orderData;

  // Build items list HTML
  const itemsHtml = orderDetails.map(detail => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${detail.itemName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${detail.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${detail.totalLineAmount} ${detail.currencyAtPurchase}</td>
    </tr>
  `).join('');

  // Build total section
  let totalHtml = '';
  if (totalAmountCoin > 0) {
    totalHtml += `<p style="font-size: 18px; color: #f59e0b;"><strong>Tổng (Xu):</strong> ${totalAmountCoin.toLocaleString()} Xu</p>`;
  }
  if (totalAmountUsd > 0) {
    totalHtml += `<p style="font-size: 18px; color: #22c55e;"><strong>Tổng ($):</strong> $${totalAmountUsd.toLocaleString()}</p>`;
  }

  const mailOptions = {
    from: 'Tài Lộc Shop <loclm112.noreply@gmail.com>',
    to: customerEmail,
    subject: `✅ Đơn hàng #${orderNumber} đã hoàn thành - Tài Lộc Shop`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1e293b; padding: 20px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #22c55e; margin: 0;">✅ Đơn hàng hoàn thành!</h1>
          <p style="color: #94a3b8;">Cảm ơn bạn đã mua hàng tại Tài Lộc Shop</p>
        </div>

        <div style="background: #334155; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #f8fafc; margin: 0 0 10px 0;">Xin chào <strong style="color: #fbbf24;">${customerName}</strong>,</p>
          <p style="color: #cbd5e1; margin: 0;">Đơn hàng <strong style="color: #60a5fa;">#${orderNumber}</strong> của bạn đã được giao thành công!</p>
        </div>

        <div style="background: #334155; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #f8fafc; margin: 0 0 10px 0;">📦 Chi tiết đơn hàng</h3>
          <table style="width: 100%; color: #cbd5e1; border-collapse: collapse;">
            <thead>
              <tr style="background: #475569;">
                <th style="padding: 8px; text-align: left;">Vật phẩm</th>
                <th style="padding: 8px; text-align: center;">SL</th>
                <th style="padding: 8px; text-align: right;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div style="margin-top: 16px; text-align: right;">
            ${totalHtml}
          </div>
        </div>

        <div style="background: #334155; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #cbd5e1; margin: 0;">
            👤 <strong>Nhân viên phục vụ:</strong> <span style="color: #60a5fa;">${staffName || 'Admin'}</span><br>
            🕐 <strong>Hoàn thành lúc:</strong> ${new Date(completedAt).toLocaleString('vi-VN')}
          </p>
        </div>

        <div style="background: linear-gradient(to right, #fbbf24, #f59e0b); padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin: 0 0 10px 0;">⭐ Đánh giá dịch vụ</h3>
          <p style="color: #1e293b; margin: 0 0 10px 0; font-size: 14px;">
            Hãy cho chúng tôi biết trải nghiệm của bạn!
          </p>
          <a href="${process.env.FRONTEND_URL || 'https://tailocshop.vercel.app'}/orders" 
             style="display: inline-block; background: #1e293b; color: #fbbf24; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Đánh giá ngay
          </a>
        </div>

        <div style="text-align: center; color: #64748b; font-size: 12px;">
          <p>Tài Lộc Shop - Cảm ơn bạn đã tin tưởng!</p>
          <p>Liên hệ: loclm112.noreply@gmail.com</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== 'production') console.log('Order completion email sent:', info.messageId);
  } catch (error) {
    // Don't throw - just log. Order completion shouldn't fail because of email
    console.error('Failed to send order completion email:', error.message);
  }
};

export const emailService = {
  sendTemporaryPasswordEmail,
  sendOrderCompletionEmail,
};