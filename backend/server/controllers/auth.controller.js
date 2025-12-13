// File: server/controllers/auth.controller.js
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

    // 3. Kiểm tra xem email hoặc inGameName đã tồn tại chưa
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { inGameName: inGameName }],
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
        email: email,
        inGameName: inGameName,
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
    
    // 3. Tìm người dùng bằng email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: 'Email hoặc mật khẩu không chính xác' });
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