// File: server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import categoryRoutes from './routes/category.route.js';
import itemRoutes from './routes/item.route.js'; // <-- [THÊM DÒNG NÀY]

// 1. Khởi tạo
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// 2. Cấu hình Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// 3. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes); // <-- [THÊM DÒNG NÀY]

// API Test "Hello World"
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Chào mừng đến với Tài Lộc Shop API!' });
});

// [THÊM MỚI] Middleware xử lý lỗi
// Bạn nên thêm một middleware xử lý lỗi cơ bản
// để bắt các lỗi ApiError và lỗi Prisma (P2025, P2003)
app.use((err, req, res, next) => {
  console.error(err); // Log lỗi ra console

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ nội bộ';

  // Xử lý lỗi Prisma (Ví dụ: P2025 - Record not found)
  if (err.code === 'P2025') {
    statusCode = httpStatus.NOT_FOUND;
    message = 'Không tìm thấy tài nguyên được yêu cầu';
  }
  // Xử lý lỗi Prisma (Ví dụ: P2003 - Foreign key constraint failed)
  if (err.code === 'P2003') {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Không thể xóa: Tài nguyên này đang được sử dụng ở nơi khác';
  }
  // Xử lý lỗi Prisma (Ví dụ: P2002 - Unique constraint failed)
  if (err.code === 'P2002') {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Lỗi trùng lặp dữ liệu (Unique constraint failed)';
  }

  res.status(statusCode).json({
    status: err.status || 'error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});


// 4. Khởi động Server
app.listen(PORT, () => {
  console.log(`Backend server đang chạy tại http://localhost:${PORT}`);
});