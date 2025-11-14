// File: backend/server/service/user.service.js
import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Dùng để tạo mật khẩu ngẫu nhiên
import { emailService } from './email.service.js';

/**
 * [Admin] Tạo user mới (Staff/Supplier)
 * @param {object} userData - Dữ liệu user từ body
 * @returns {Promise<User>}
 */
const adminCreateUser = async (userData) => {
  const { email, inGameName, role } = userData;

  // 1. Kiểm tra email hoặc inGameName đã tồn tại chưa
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: email }, { inGameName: inGameName }],
    },
  });
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email hoặc Tên in-game đã tồn tại');
  }

  // 2. Tạo mật khẩu tạm thời (10 ký tự)
  const temporaryPassword = crypto.randomBytes(5).toString('hex');

  // 3. Hash mật khẩu
  const passwordHash = await bcrypt.hash(temporaryPassword, 10);

  // 4. Tạo user trong CSDL
  // mustChangePassword sẽ mặc định là true (như schema)
  const newUser = await prisma.user.create({
    data: {
      email,
      inGameName,
      passwordHash,
      role, // STAFF hoặc SUPPLIER
      mustChangePassword: true,
    },
    select: {
      id: true,
      email: true,
      inGameName: true,
      role: true,
      createdAt: true,
    },
  });

  // 5. Gửi email
  try {
    await emailService.sendTemporaryPasswordEmail(email, inGameName, temporaryPassword);
  } catch (emailError) {
    // Mặc dù gửi email lỗi, tài khoản vẫn được tạo.
    // Cần có cơ chế xử lý lại hoặc thông báo cho Admin.
    console.warn(`Tạo user ${email} thành công, nhưng gửi email thất bại: ${emailError.message}`);
    // Không throw lỗi ở đây để Admin vẫn nhận được thông báo tạo thành công
  }

  return newUser;
};

/**
 * [User] Tự đổi mật khẩu
 * @param {string} userId - ID của user (từ req.user)
 * @param {object} passwordData - { oldPassword, newPassword }
 * @returns {Promise<void>}
 */
const changeMyPassword = async (userId, passwordData) => {
  const { oldPassword, newPassword } = passwordData;

  // 1. Lấy user (bao gồm cả passwordHash)
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy người dùng');
  }

  // 2. Kiểm tra mật khẩu cũ
  const isPasswordMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mật khẩu cũ không chính xác');
  }

  // 3. Hash mật khẩu mới
  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  // 4. Cập nhật mật khẩu VÀ tắt cờ mustChangePassword
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newPasswordHash,
      mustChangePassword: false, // Rất quan trọng
    },
  });
};

export const userService = {
  adminCreateUser,
  changeMyPassword,
};