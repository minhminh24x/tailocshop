// server/index.js
import express from 'express';
import http from 'http';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import httpStatus from 'http-status';
// [NÂNG CẤP] Import thêm các thư viện bảo mật và hiệu năng
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// [RESTORED] Socket.io for real-time notifications
import { initSocket } from './lib/socket.js';

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import categoryRoutes from './routes/category.route.js';
import itemRoutes from './routes/item.route.js';
import deliveryTimeSlotRoutes from './routes/deliveryTimeSlot.route.js';
import orderRoutes from './routes/order.route.js';
import vipLevelRoutes from './routes/vipLevel.route.js';
import currencyRoutes from './routes/currency.route.js';
import supplierSubmissionRoutes from './routes/supplierSubmission.route.js';
import statsRoutes from './routes/stats.route.js';

// [THÊM] Phase 3 routes
import wishlistRoutes from './routes/wishlist.route.js';
import reviewRoutes from './routes/review.route.js';
import voucherRoutes from './routes/voucher.route.js';

// [THÊM] Phase 4 routes
import exportRoutes from './routes/export.route.js';
import applicationRoutes from './routes/application.route.js';
import orderReviewRoutes from './routes/orderReview.route.js'; // [MỚI]

dotenv.config();
const app = express();
const server = http.createServer(app); // [THÊM] HTTP server for Socket.io
const PORT = process.env.PORT || 8080;

// [RESTORED] Initialize Socket.io with fail-safe error handling
try {
  initSocket(server);
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Socket.io] Initialized successfully');
  }
} catch (e) {
  // Log error but don't crash server
  console.error('[Socket.io] Failed to initialize:', e.message);
}

// Danh sách origin cho phép
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://tailocshop.onrender.com',
  'https://tailocshop.vercel.app',
  'https://tailocshop-6qtp-iefejt9eu-minhminh24xs-projects.vercel.app',
  // Production domains
  'https://shop.minhminh24x.me',
  'https://api.minhminh24x.me',
  process.env.FRONTEND_URL, // Dynamic from .env
].filter(Boolean);

// Regex for Vercel preview URLs
const vercelPreviewRegex = /^https:\/\/tailocshop(-[a-z0-9]+)?(-[a-z0-9]+)?\.vercel\.app$/;

// [FIX] CORS phải được đặt TRƯỚC các middleware khác để đảm bảo headers luôn được gửi
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Check exact match
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check Vercel preview URLs pattern
    if (vercelPreviewRegex.test(origin)) {
      return callback(null, true);
    }

    // Reject other origins
    console.warn(`[CORS] Blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // [FIX] Cho legacy browsers
};

// [FIX] Đặt CORS đầu tiên, trước tất cả middleware khác
// Note: Express 5 không hỗ trợ app.options('*', ...) nên chỉ dùng app.use(cors())
// cors middleware sẽ tự động xử lý preflight OPTIONS requests
app.use(cors(corsOptions));

// [SECURITY] Helmet - đặt sau CORS
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // [FIX] Cho phép cross-origin
}));

// [NÂNG CẤP] 2. Compression
app.use(compression());

// [NÂNG CẤP] 3. Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ======================================
// 🛡️ RATE LIMITING & SECURITY CONFIG
// ======================================

// [MỚI] IP Whitelist - các IP này KHÔNG bị rate limit
const WHITELISTED_IPS = [
  '127.0.0.1',      // localhost IPv4
  '::1',            // localhost IPv6
  '::ffff:127.0.0.1', // localhost IPv6-mapped
  // Thêm IP admin/VPS của bạn vào đây:
  process.env.ADMIN_IP,
].filter(Boolean);

// [MỚI] Hàm lấy IP thật từ request
const getClientIP = (req) => {
  return req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip;
};

// [MỚI] Hàm kiểm tra IP có trong whitelist không
const isWhitelisted = (req) => {
  const clientIP = getClientIP(req);
  return WHITELISTED_IPS.some(ip => clientIP === ip || clientIP?.includes(ip));
};

// [SỬA] Rate Limit chung - TĂNG lên 500 requests per 15 phút
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 500, // [TĂNG] 100 → 500 requests per IP
  message: {
    status: 'error',
    message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIP,
  skip: isWhitelisted, // [MỚI] Bỏ qua whitelist IPs
});

// [SỬA] Rate Limit cho Auth routes - dùng chung functions
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // [TĂNG] 10 → 20 lần per IP per 15 phút
  message: {
    status: 'error',
    message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIP,
  skip: isWhitelisted, // [MỚI] Bỏ qua whitelist IPs
});

// [SỬA] Rate Limit cho Public routes - TĂNG lên 1000 requests
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // [TĂNG] 200 → 1000 requests (public data cần nhiều)
  message: {
    status: 'error',
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIP,
  skip: isWhitelisted, // [MỚI] Bỏ qua whitelist IPs
});

// Cấu hình slowDown (Thêm delay nếu spam - kết hợp với rate limit)
const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 5,
  delayMs: () => 500,
  maxDelayMs: 3000,
  validate: { delayMs: false }
});

// [MỚI] Áp dụng rate limit chung CHO TẤT CẢ routes
app.use('/api', generalLimiter);

// [MỚI] Block các đường dẫn tấn công phổ biến (bots, scanners)
app.use((req, res, next) => {
  const blockedPaths = [
    '/.env', '/.git', '/wp-admin', '/wp-login', '/phpMyAdmin',
    '/vendor', '/_ignition', '/actuator', '/solr', '/console',
    '/manager', '/admin.php', '/xmlrpc.php', '/eval-stdin.php'
  ];

  if (blockedPaths.some(path => req.path.toLowerCase().includes(path.toLowerCase()))) {
    console.warn(`[SECURITY] Blocked suspicious request: ${req.path} from ${req.ip}`);
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden'
    });
  }
  next();
});
// 1. Parse JSON (tăng giới hạn nếu cần)
app.use(express.json({ limit: '10mb' }));

// 2. Parse URL-encoded (quan trọng cho form submission thông thường)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Cookie Parser
app.use(cookieParser());

// 4. [DEBUG MIDDLEWARE] - Log request để kiểm tra (Chỉ chạy trong development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`👉 [${req.method}] ${req.url}`);
    console.log('   Headers Content-Type:', req.headers['content-type']);

    // Chỉ cảnh báo body undefined với các method thường có body
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body === undefined) {
      console.error('❌ CẢNH BÁO: req.body đang bị undefined!');
    } else if (req.body && Object.keys(req.body).length > 0) {
      // Log body (ẩn password nếu có)
      const logBody = { ...req.body };
      if (logBody.password) logBody.password = '***HIDDEN***';
      console.log('   Body:', logBody);
    }
    next();
  });
}

// ✅ API Routes
// [SỬA] Auth routes: authLimiter (block) + authSlowDown (delay)
app.use('/api/auth', authLimiter, authSlowDown, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/delivery-time-slots', deliveryTimeSlotRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vip-levels', vipLevelRoutes);
app.use('/api/rates', currencyRoutes);
app.use('/api/supplier-submissions', supplierSubmissionRoutes);
app.use('/api/stats', statsRoutes);

// [THÊM] Phase 3 API Routes
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/order-reviews', orderReviewRoutes); // [ĐÁNH GIÁ ĐƠN HÀNG]

// [THÊM] Phase 4 API Routes
app.use('/api/export', exportRoutes);
app.use('/api/applications', applicationRoutes);

// Route test
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Chào mừng đến với Tài Lộc Shop API (Secured & Optimized)!'
  });
});

// [THÊM] 404 Handler - Xử lý route không tồn tại
// Note: Express 5 doesn't support app.use('*', ...) - must use app.use without path
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} không tồn tại`
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

// [SỬA] Sử dụng server thay vì app để hỗ trợ Socket.io
server.listen(PORT, () => {
  console.log(`✅ Backend server đang chạy tại http://localhost:${PORT}`);
});