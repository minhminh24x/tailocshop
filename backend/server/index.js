// server/index.js
import express from 'express';
import cors from 'cors';
import slowDown from 'express-slow-down';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import httpStatus from 'http-status';
// [NÂNG CẤP] Import thêm các thư viện bảo mật và hiệu năng
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import categoryRoutes from './routes/category.route.js';
import itemRoutes from './routes/item.route.js';
import deliveryTimeSlotRoutes from './routes/deliveryTimeSlot.route.js';
import orderRoutes from './routes/order.route.js';
import vipLevelRoutes from './routes/vipLevel.route.js';
import currencyRoutes from './routes/currency.route.js';
import supplierSubmissionRoutes from './routes/supplierSubmission.route.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// [NÂNG CẤP] 1. Security Headers (Bảo mật HTTP)
app.use(helmet());

// [NÂNG CẤP] 2. Gzip Compression (Tăng tốc độ tải API)
app.use(compression());

// [NÂNG CẤP] 3. Logging (Theo dõi request tốt hơn)
// Chỉ log ngắn gọn ở production, chi tiết ở development
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Cấu hình slowDown (Chống spam request)
const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, 
  delayAfter: 5,            
  delayMs: () => 500,       
  maxDelayMs: 3000,         
  validate: { delayMs: false } 
});

// Danh sách origin cho phép
const allowedOrigins = [
  'http://localhost:3000',
  'https://tailocshop.onrender.com',
  'https://tailocshop.vercel.app',
  'https://tailocshop-6qtp-iefejt9eu-minhminh24xs-projects.vercel.app'
];

// Cấu hình CORS
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
app.use('/api/auth', authSlowDown, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/delivery-time-slots', deliveryTimeSlotRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vip-levels', vipLevelRoutes);
app.use('/api/rates', currencyRoutes);
app.use('/api/supplier-submissions', supplierSubmissionRoutes);

// Route test
app.get('/api', (req, res) => {
  res.status(200).json({ 
    message: 'Chào mừng đến với Tài Lộc Shop API (Secured & Optimized)!' 
  });
});

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err); // Log lỗi ra console server để debug
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
    message = 'Dữ liệu đã tồn tại (Trùng lặp)';
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    // [NÂNG CẤP] Chỉ hiện stack trace khi không phải production để bảo mật
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server đang chạy tại http://localhost:${PORT}`);
});