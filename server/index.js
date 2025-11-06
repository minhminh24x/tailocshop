// File: server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';

// [SỬA] Import categoryRoutes bằng cú pháp ESM
// Và đảm bảo đường dẫn đúng là 'category.route.js' (không có 'v1')
// để nhất quán với 'user.route.js' và 'auth.route.js'
import categoryRoutes from './routes/category.route.js'; 

// 1. Khởi tạo
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// [XÓA] Xóa 2 dòng bị trùng và sai cú pháp dưới đây
// const express = require('express');
// const categoryRoutes = require('./routes/v1/category.route');

// 2. Cấu hình Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// 3. API Routes
// Gắn các router
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes); // Dòng này giữ nguyên, nó dùng biến đã import ở trên

// API Test "Hello World"
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Chào mừng đến với Tài Lộc Shop API!' });
});

// 4. Khởi động Server
app.listen(PORT, () => {
  console.log(`Backend server đang chạy tại http://localhost:${PORT}`);
});