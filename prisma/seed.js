// File: prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu seeding (gieo mầm) dữ liệu...');

  // 1. Xóa dữ liệu cũ
  await prisma.user.deleteMany();
  await prisma.vipLevel.deleteMany();
  console.log('Đã xóa dữ liệu cũ (User, VipLevel).');

  // 2. Tạo 5 cấp VIP (Giữ nguyên logic của bạn)
  const vipData = [
    { level: 0, name: 'Tân Thủ', coinThreshold: 0, discountPercent: 0 },
    { level: 1, name: 'Chiến Binh', coinThreshold: 50, discountPercent: 5 },
    { level: 2, name: 'Tinh Anh', coinThreshold: 100, discountPercent: 10 },
    { level: 3, name: 'Đại Gia', coinThreshold: 150, discountPercent: 15 },
    { level: 4, name: 'Huyền Thoại', coinThreshold: 200, discountPercent: 20 },
  ];

  await prisma.vipLevel.createMany({
    data: vipData,
  });
  console.log('Đã tạo 5 cấp VIP thành công.');

  // 3. [CODE ĐÃ SỬA] Tạo tài khoản Admin
  console.log('Đang tạo tài khoản Admin...');

  // 3a. Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 3b. Tạo Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tailocshop.com',
      passwordHash: hashedPassword, // (Chúng ta đã sửa ở bước trước)
      role: 'ADMIN',
      inGameName: 'AdminTaiLoc', // (Chúng ta đã thêm ở bước trước)
      
      // [SỬA LỖI 1] Xóa 'name: "..."' vì schema không có
      
      // [SỬA LỖI 2] Xóa khối 'vipLevel' vì nó là optional
    },
  });

  console.log(`Đã tạo Admin thành công: ${adminUser.email}`);
  console.log('Seeding hoàn tất.');
}

// 4. Chạy hàm main và xử lý kết nối
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Đóng kết nối Prisma
    await prisma.$disconnect();
  });