// File: server/controllers/auth.controller.js
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// =============================================
// HÀM Register
// =============================================

export const register = async (req, res) => {
  // 1. Lấy dữ liệu từ 'body' của request
  const { email, password, inGameName } = req.body;

  try {
    // 2. Kiểm tra dữ liệu đầu vào (đơn giản)
    if (!email || !password || !inGameName) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin' });
    }

    // 3. Kiểm tra xem email hoặc inGameName đã tồn tại chưa
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { inGameName: inGameName }],
      },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email hoặc In-game name đã tồn tại' });
    }

    // 4. Băm mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Tạo người dùng mới
    const newUser = await prisma.user.create({
      data: {
        email: email,
        inGameName: inGameName,
        passwordHash: hashedPassword,
        // Các trường khác như 'role' sẽ dùng giá trị DEFAULT (CUSTOMER)
      },
    });

    // 6. Trả về thành công (Không bao giờ trả về mật khẩu)
    const { passwordHash, ...userInfo } = newUser; // Lọc bỏ passwordHash
    res.status(201).json({ 
      message: 'Tạo tài khoản thành công!',
      user: userInfo 
    });

  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// =============================================
// HÀM LOGIN MỚI
// =============================================
export const login = async (req, res) => {
  // 1. Lấy dữ liệu từ 'body'
  const { email, password } = req.body;

  try {
    // 2. Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });
    }

    // 3. Tìm người dùng bằng email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    // 4. So sánh mật khẩu
    // (So sánh mật khẩu 'password' người dùng gửi lên
    // với 'passwordHash' trong database)
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    // 5. Tạo JSON Web Token (JWT)
    // ĐỊNH NGHĨA THỜI GIAN
    const age = 30 * 60 * 1000; // 30 phút (tính bằng mili giây)

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '30m' } // <-- SỬA TỪ '7d' THÀNH '30m'
    );

    // 6. Gửi Token về cho client qua Cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      // secure: true, // (Bật khi deploy HTTPS)
      maxAge: age, // <-- SỬA THÀNH 'age' (30 phút)
    });

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
// HÀM LOGOUT
// =============================================
export const logout = (req, res) => {
  try {
    // 1. Gửi 1 cookie rỗng tên 'access_token'
    // 2. Đặt maxAge = 0 (hoặc 1 mili giây) để nó hết hạn ngay lập tức
    res.cookie('access_token', '', {
      httpOnly: true,
      maxAge: 0,
    });

    // 3. Trả về thông báo thành công
    res.status(200).json({ message: 'Đăng xuất thành công!' });
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};