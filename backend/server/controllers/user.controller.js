// File: server/controllers/user.controller.js
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs'; // Giữ lại import này cho hàm changeMyPassword
import { userService } from '../service/user.service.js';
import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';

// [MỚI] (Dành cho Admin)
const adminCreateUser = asyncHandler(async (req, res) => {
  const user = await userService.adminCreateUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

/**
 * Lấy hồ sơ cá nhân của tôi (đã sửa lỗi)
 */
export const getMyProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Lấy thông tin user và VIP HIỆN TẠI
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true, // Thêm username (trang Profile có dùng)
        inGameName: true,
        role: true,
        totalSpentCoin: true, // Đây là 'totalCoinPurchased'
        createdAt: true,
        vipLevel: { // Lấy cả object VIP hiện tại
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            requiredCoins: true
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // 2. Tìm CẤP VIP TIẾP THEO
    let nextVipLevel = null;
    const currentVipCoins = user.vipLevel?.requiredCoins || 0;

    nextVipLevel = await prisma.vipLevel.findFirst({
      where: {
        requiredCoins: {
          gt: currentVipCoins // Tìm cấp VIP có số coin > cấp hiện tại
        }
      },
      orderBy: {
        requiredCoins: 'asc' // Lấy cấp gần nhất
      },
      select: {
        name: true,
        requiredCoins: true
      }
    });

    // 3. Gửi phản hồi
    // Gửi về object chứa user VÀ nextVipLevel
    // để trang UserProfilePage.js có thể dùng
    res.status(200).json({ 
      user: {
        ...user,
        // Đổi tên totalSpentCoin thành totalCoinPurchased cho khớp code Profile
        totalCoinPurchased: user.totalSpentCoin, 
      }, 
      nextVipLevel 
    });

  } catch (error) {
    // [THÊM] Log lỗi ra console backend để dễ debug
    console.error("Lỗi tại getMyProfile:", error); 
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};


/**
 * Đổi mật khẩu
 */
const changeMyPassword = asyncHandler(async (req, res) => {
  // 1. Lấy userId từ middleware 'protect'
  const userId = req.user.id;
  
  // 2. Dữ liệu (oldPassword, newPassword) đã được validate_từ_route
  // và sẽ được xử lý bởi userService
  await userService.changeMyPassword(userId, req.body);

  // 3. Trả về thành công
  // (Lưu ý: userService đã xử lý việc so sánh mật khẩu cũ
  // và cập nhật mustChangePassword = false)
  res.status(httpStatus.OK).json({ message: 'Đổi mật khẩu thành công!' });
});


export const userController = {
  adminCreateUser,
  getMyProfile,
  changeMyPassword,
};