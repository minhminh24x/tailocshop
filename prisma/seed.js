// File: prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu seeding (gieo mầm) dữ liệu...');

  // 1. Xóa dữ liệu cũ (Lưu ý: nên xóa theo thứ tự ngược lại
  // nếu có khóa ngoại, ví dụ: Order -> User)
  // Tạm thời chấp nhận cách xóa này cho seed.
  await prisma.user.deleteMany();
  await prisma.vipLevel.deleteMany();
  console.log('Đã xóa dữ liệu cũ (User, VipLevel).');

  // 2. Tạo 5 cấp VIP
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

  // 3. Tạo tài khoản Admin
  console.log('Đang tạo tài khoản Admin...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tailocshop.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      inGameName: 'AdminTaiLoc',
      // vipLevel sẽ tự động là default (0)
    },
  });

  console.log(`Đã tạo Admin thành công: ${adminUser.email}`);
  console.log('Seeding hoàn tất.');
} // [ĐÃ SỬA] Dấu } kết thúc hàm main() nằm ở đây

// [ĐÃ SỬA] Khối lệnh này phải nằm BÊN NGOÀI hàm main()
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });