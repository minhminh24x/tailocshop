// server/index.js
import express from 'express';
import cors from 'cors';
import slowDown from 'express-slow-down';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import httpStatus from 'http-status';

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import categoryRoutes from './routes/category.route.js';
import itemRoutes from './routes/item.route.js';
import deliveryTimeSlotRoutes from './routes/deliveryTimeSlot.route.js';
import orderRoutes from './routes/order.route.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 phút
  delayAfter: 5, // Bắt đầu làm chậm sau 5 yêu cầu
  delayMs: 500,  // Thêm 500ms độ trễ
  maxDelayMs: 3000 // Độ trễ tối đa là 3 giây
});

// ✅ Danh sách các origin được phép
const allowedOrigins = [
  'http://localhost:3000',
  'https://tailocshop.onrender.com',
  'https://tailocshop.vercel.app',
  'https://tailocshop-6qtp-iefejt9eu-minhminh24xs-projects.vercel.app'
];

// ✅ Cấu hình CORS nâng cao
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ API Routes
app.use('/api/auth',authRoutes,authSlowDown);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/delivery-slots', deliveryTimeSlotRoutes);
app.use('/api/orders', orderRoutes);

// ✅ Route test
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Chào mừng đến với Tài Lộc Shop API!' });
});

// ✅ Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err);
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ nội bộ';

  if (err.code === 'P2025') {
    statusCode = httpStatus.NOT_FOUND;
    message = 'Không tìm thấy tài nguyên được yêu cầu';
  }
  if (err.code === 'P2003') {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Không thể xóa: Tài nguyên này đang được sử dụng ở nơi khác';
  }
  if (err.code === 'P2002') {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Lỗi trùng lặp dữ liệu (Unique constraint failed)';
  }

  res.status(statusCode).json({
    status: 'error',
    message,
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server đang chạy tại http://localhost:${PORT}`);
});
