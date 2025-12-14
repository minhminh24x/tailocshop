// File: backend/server/controllers/user.controller.js

import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { userService } from '../service/user.service.js';
import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';

// --- HÀM CHO ADMIN ---

const adminCreateUser = asyncHandler(async (req, res) => {
  const user = await userService.adminCreateUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

// [NÂNG CẤP] Hỗ trợ pagination và search
const adminGetUsers = asyncHandler(async (req, res) => {
  // Truyền toàn bộ query params: page, limit, roles, search
  const result = await userService.adminGetUsers(req.query);
  res.status(httpStatus.OK).send(result);
});

const adminGetUserDetail = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.adminGetUserDetail(userId);
  res.status(httpStatus.OK).send(user);
});


// --- HÀM CHO USER ĐÃ XÁC THỰC ---

/**
 * Lấy hồ sơ cá nhân của tôi (đã sửa lỗi)
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 1. Lấy thông tin user và VIP HIỆN TẠI
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      inGameName: true,
      role: true,
      totalSpentCoin: true,
      createdAt: true,
      mustChangePassword: true,
      vipLevelInt: true, // [FIX] Cần có field này để relation hoạt động
      vipLevel: {
        select: {
          level: true,
          name: true,
          coinThreshold: true,
          discountPercent: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }

  // [DEBUG] Log user VIP data
  console.log('[VIP DEBUG] getMyProfile:', {
    userId: user.id,
    inGameName: user.inGameName,
    totalSpentCoin: user.totalSpentCoin,
    vipLevel: user.vipLevel,
  });

  // 2. Tìm CẤP VIP TIẾP THEO
  let nextVipLevel = null;
  // [FIX] Dùng ?. (optional chaining) để an toàn nếu user.vipLevel là null
  const currentVipCoins = user.vipLevel?.coinThreshold || 0;

  nextVipLevel = await prisma.vipLevel.findFirst({
    where: {
      coinThreshold: {
        gt: currentVipCoins,
      },
    },
    orderBy: {
      coinThreshold: 'asc',
    },
    select: {
      name: true,
      coinThreshold: true,
    },
  });

  // 3. Gửi phản hồi
  res.status(200).json({
    user: {
      ...user,
      totalCoinPurchased: user.totalSpentCoin,
      // [FIX] Dùng ternary (toán tử 3 ngôi) để an toàn nếu user.vipLevel là null
      vipLevel: user.vipLevel
        ? {
          ...user.vipLevel,
          requiredCoins: user.vipLevel.coinThreshold,
        }
        : null,
    },
    // [FIX] Dùng ternary để an toàn nếu nextVipLevel là null
    nextVipLevel: nextVipLevel
      ? {
        ...nextVipLevel,
        requiredCoins: nextVipLevel.coinThreshold,
      }
      : null,
  });
});

/**
 * Đổi mật khẩu
 */
const changeMyPassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await userService.changeMyPassword(userId, req.body);
  res.status(httpStatus.OK).json({ message: 'Đổi mật khẩu thành công!' });
});


// --- EXPORT CONTROLLER ---

export const userController = {
  adminCreateUser,
  adminGetUsers,
  adminGetUserDetail,
  getMyProfile,
  changeMyPassword,
};