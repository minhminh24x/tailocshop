// File: server/controllers/user.controller.js
import prisma from '../lib/prisma.js';

export const getMyProfile = async (req, res) => {
  // Nhờ middleware (Bước 3), chúng ta có 'req.userId'
  const userId = req.userId; 

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { // Chỉ chọn những thông tin an toàn
        id: true,
        email: true,
        inGameName: true,
        role: true,
        totalSpentCoin: true,
        vipLevelInt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};