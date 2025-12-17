// File: server/controllers/auth.controller.js
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sanitizeEmail, sanitizeInGameName } from '../utils/sanitize.js';

// =============================================
// HÀM Register
// =============================================

export const register = async (req, res) => {
  // [FIX] Thêm inGameName vào destructuring
  const { email, password, inGameName } = req.body || {};

  try {
    // 2. Kiểm tra dữ liệu đầu vào - [FIX] Thêm validation cho inGameName
    if (!email || !password || !inGameName) {
      console.log('Register failed - Body received:', req.body);
      console.log('Register failed - Content-Type:', req.headers['content-type']);

      return res
        .status(400)
        .json({ message: 'Vui lòng cung cấp email, mật khẩu và tên trong game' });
    }

    // [THÊM] Sanitize inputs để ngăn XSS
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedInGameName = sanitizeInGameName(inGameName);

    if (!sanitizedEmail) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }

    // 3. Kiểm tra xem email hoặc inGameName đã tồn tại chưa
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: sanitizedEmail }, { inGameName: sanitizedInGameName }],
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'Email hoặc In-game name đã tồn tại' });
    }

    // 4. Băm mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Tạo người dùng mới
    const newUser = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        inGameName: sanitizedInGameName,
        passwordHash: hashedPassword,
        // Các trường khác như 'role' sẽ dùng giá trị DEFAULT (CUSTOMER)
        mustChangePassword: false,
      },
    });

    // 6. Trả về thành công (Không bao giờ trả về mật khẩu)
    const { passwordHash, ...userInfo } = newUser; // Lọc bỏ passwordHash
    res.status(201).json({
      message: 'Tạo tài khoản thành công!',
      user: userInfo,
    });
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// =============================================
// HÀM LOGIN MỚI (ĐÃ SỬA COOKIE)
// =============================================
export const login = async (req, res) => {
  const { email, password } = req.body || {};

  try {
    // 2. Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      // Log ra để debug xem server nhận được gì
      console.log('Login failed - Body received:', req.body);
      console.log('Login failed - Content-Type:', req.headers['content-type']);

      return res
        .status(400)
        .json({ message: 'Vui lòng cung cấp email và mật khẩu' });
    }

    // [THÊM] Sanitize email
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }

    // 3. Tìm người dùng bằng email
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    // [FIX] 3.5. Kiểm tra user có bị ban không
    if (user.isBanned) {
      // Kiểm tra xem ban có thời hạn không và đã hết hạn chưa
      const now = new Date();
      const banExpired = user.banUntil && new Date(user.banUntil) < now;

      if (!banExpired) {
        // Vẫn đang bị ban
        const banDuration = user.banUntil
          ? `đến ${new Date(user.banUntil).toLocaleDateString('vi-VN')}`
          : 'vĩnh viễn';
        const banReason = user.banReason || 'Vi phạm quy định';

        return res.status(403).json({
          message: `Tài khoản bị khóa ${banDuration}. Lý do: ${banReason}`,
          code: 'ACCOUNT_BANNED',
          banUntil: user.banUntil,
          banReason: banReason
        });
      }
      // Nếu ban đã hết hạn, cho phép đăng nhập bình thường
      // (Có thể thêm logic tự động unban ở đây nếu cần)
    }

    // 4. So sánh mật khẩu
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    // 5. Tạo JSON Web Token (JWT)
    const age = 30 * 60 * 1000; // 30 phút (tính bằng mili giây)

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '30m' } // Khớp với thời gian 'age'
    );

    // [SỬA ĐỔI] Tạo cấu hình Cookie
    const cookieOptions = {
      httpOnly: true,
      maxAge: age,

      // [THÊM] Bắt buộc cho cookie cross-domain (khi deploy)
      // Chỉ gửi cookie qua HTTPS
      secure: process.env.NODE_ENV === 'production',

      // [THÊM] Cho phép gửi cookie từ domain khác (Render -> Vercel)
      // 'Lax' cho môi trường dev (localhost), 'None' cho production
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    };

    // 6. Gửi Token về cho client qua Cookie
    res.cookie('access_token', token, cookieOptions); // <-- Sử dụng cookieOptions

    // 7. Gửi thông tin user về
    const { passwordHash, ...userInfo } = user;
    res.status(200).json({
      message: 'Đăng nhập thành công!',
      user: userInfo,
    });
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// =============================================
// HÀM LOGOUT (ĐÃ SỬA COOKIE)
// =============================================
export const logout = (req, res) => {
  try {
    // [SỬA ĐỔI] Lấy cookieOptions
    // Các thuộc tính (secure, sameSite) PHẢI KHỚP
    // với lúc tạo cookie thì trình duyệt mới xóa
    const cookieOptions = {
      httpOnly: true,
      maxAge: 0, // Hết hạn ngay lập tức

      // [THÊM] Phải khớp với cookie lúc login
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    };

    // 1. Gửi cookie rỗng với đúng options để xóa nó đi
    res.cookie('access_token', '', cookieOptions);

    // 3. Trả về thông báo thành công
    res.status(200).json({ message: 'Đăng xuất thành công!' });
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};