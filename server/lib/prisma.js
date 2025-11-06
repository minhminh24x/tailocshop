// File: server/lib/prisma.js
import { PrismaClient } from '@prisma/client';

// Khởi tạo Prisma Client
const prisma = new PrismaClient({
  // Tùy chọn: Bật log để xem các câu truy vấn SQL thô
  log: ['query', 'info', 'warn', 'error'],
});

// Xuất (export) instance của Prisma Client
export default prisma;