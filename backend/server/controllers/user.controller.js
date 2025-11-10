// File: server/controllers/user.controller.js
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs'; // Giữ lại import này cho hàm changeMyPassword

/**
 * Lấy hồ sơ cá nhân của tôi (đã sửa lỗi)
 */
export const getMyProfile = async (req, res) => {
  const userId = req.userId; 

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
export const changeMyPassword = async (req, res) => {
  const userId = req.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu cũ và mới.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu cũ không chính xác.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    res.status(200).json({ message: 'Đổi mật khẩu thành công!' });

  } catch (error) {
    // [THÊM] Log lỗi ra console backend để dễ debug
    console.error("Lỗi tại changeMyPassword:", error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};