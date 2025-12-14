// File: prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seeding dữ liệu mẫu...\n');

  // ============ 1. XÓA DỮ LIỆU CŨ ============
  console.log('🗑️ Xóa dữ liệu cũ...');
  await prisma.inventoryLog.deleteMany();
  await prisma.orderDetail.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  await prisma.deliveryTimeSlot.deleteMany();
  await prisma.currencyExchangeRate.deleteMany();
  await prisma.user.deleteMany();
  await prisma.vipLevel.deleteMany();
  console.log('✅ Đã xóa dữ liệu cũ.\n');

  // ============ 2. TẠO VIP LEVELS ============
  console.log('⭐ Tạo 5 cấp VIP...');
  await prisma.vipLevel.createMany({
    data: [
      { level: 0, name: 'Tân Thủ', coinThreshold: 0, discountPercent: 0 },
      { level: 1, name: 'Chiến Binh', coinThreshold: 500, discountPercent: 5 },
      { level: 2, name: 'Tinh Anh', coinThreshold: 2000, discountPercent: 10 },
      { level: 3, name: 'Đại Gia', coinThreshold: 5000, discountPercent: 15 },
      { level: 4, name: 'Huyền Thoại', coinThreshold: 10000, discountPercent: 20 },
    ],
  });
  console.log('✅ Đã tạo 5 cấp VIP.\n');

  // ============ 3. TẠO USERS ============
  console.log('👥 Tạo tài khoản mẫu...');
  const adminPassword = await bcrypt.hash('admin123', 12);
  const staffPassword = await bcrypt.hash('staff123', 12);
  const customerPassword = await bcrypt.hash('customer123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@tailocshop.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      inGameName: 'AdminTaiLoc',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@tailocshop.com',
      passwordHash: staffPassword,
      role: 'STAFF',
      inGameName: 'StaffTaiLoc',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'player1@gmail.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      inGameName: 'ProPlayer99',
      totalSpentCoin: 1500,
      vipLevelInt: 2, // Tinh Anh
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'player2@gmail.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      inGameName: 'MinecraftKing',
      totalSpentCoin: 300,
      vipLevelInt: 0,
    },
  });

  console.log('✅ Đã tạo tài khoản: Admin, Staff, 2 Customers.\n');

  // ============ 4. TẠO EXCHANGE RATE ============
  console.log('💱 Tạo tỷ giá...');
  await prisma.currencyExchangeRate.create({
    data: {
      rate: 1000,
      rateType: 'XU_TO_USD',
      updatedById: admin.id,
    },
  });
  console.log('✅ Đã tạo tỷ giá: 1 Xu = 1000 USD.\n');

  // ============ 5. TẠO CATEGORIES ============
  console.log('📁 Tạo danh mục...');
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Vật Phẩm Hiếm', slug: 'vat-pham-hiem', description: 'Các vật phẩm quý hiếm trong game' },
    }),
    prisma.category.create({
      data: { name: 'Trang Bị', slug: 'trang-bi', description: 'Áo giáp, vũ khí, công cụ' },
    }),
    prisma.category.create({
      data: { name: 'Khối & Vật Liệu', slug: 'khoi-vat-lieu', description: 'Các loại khối xây dựng' },
    }),
    prisma.category.create({
      data: { name: 'Đồ Ăn', slug: 'do-an', description: 'Thực phẩm và potion' },
    }),
    prisma.category.create({
      data: { name: 'Spawner & Mob', slug: 'spawner-mob', description: 'Spawner và mob eggs' },
    }),
  ]);
  console.log('✅ Đã tạo 5 danh mục.\n');

  // ============ 6. TẠO ITEMS ============
  console.log('📦 Tạo sản phẩm mẫu...');
  const itemsData = [
    // Vật Phẩm Hiếm
    { name: 'Kim Cương', slug: 'kim-cuong', unit: 'viên', priceCoin: 50, priceUsd: 5, stockQuantity: 500, categoryId: categories[0].id, thumbnailImageUrl: 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/a/ab/Diamond_JE3_BE3.png' },
    { name: 'Ngọc Ender', slug: 'ngoc-ender', unit: 'viên', priceCoin: 100, priceUsd: 10, stockQuantity: 200, categoryId: categories[0].id },
    { name: 'Ngọc Nether', slug: 'ngoc-nether', unit: 'viên', priceCoin: 30, priceUsd: 3, stockQuantity: 1000, categoryId: categories[0].id },
    { name: 'Elytra', slug: 'elytra', unit: 'cái', priceCoin: 500, priceUsd: 50, stockQuantity: 20, categoryId: categories[0].id },

    // Trang Bị
    { name: 'Kiếm Kim Cương', slug: 'kiem-kim-cuong', unit: 'cái', priceCoin: 150, priceUsd: 15, stockQuantity: 100, categoryId: categories[1].id },
    { name: 'Áo Giáp Kim Cương Full Set', slug: 'ao-giap-kim-cuong-full-set', unit: 'bộ', priceCoin: 400, priceUsd: 40, stockQuantity: 50, categoryId: categories[1].id },
    { name: 'Cuốc Netherite', slug: 'cuoc-netherite', unit: 'cái', priceCoin: 250, priceUsd: 25, stockQuantity: 30, categoryId: categories[1].id },

    // Khối & Vật Liệu
    { name: 'Khối Kim Cương', slug: 'khoi-kim-cuong', unit: 'block', priceCoin: 450, priceUsd: 45, stockQuantity: 100, categoryId: categories[2].id },
    { name: 'Obsidian', slug: 'obsidian', unit: 'stack', priceCoin: 20, priceUsd: null, stockQuantity: 500, categoryId: categories[2].id },
    { name: 'Glowstone', slug: 'glowstone', unit: 'stack', priceCoin: 15, priceUsd: null, stockQuantity: 800, categoryId: categories[2].id },

    // Đồ Ăn
    { name: 'Golden Apple', slug: 'golden-apple', unit: 'viên', priceCoin: 80, priceUsd: 8, stockQuantity: 150, categoryId: categories[3].id },
    { name: 'Enchanted Golden Apple', slug: 'enchanted-golden-apple', unit: 'viên', priceCoin: 300, priceUsd: 30, stockQuantity: 30, categoryId: categories[3].id },
    { name: 'Steak Stack', slug: 'steak-stack', unit: 'stack', priceCoin: 10, priceUsd: null, stockQuantity: 1000, categoryId: categories[3].id },

    // Spawner & Mob
    { name: 'Zombie Spawner', slug: 'zombie-spawner', unit: 'cái', priceCoin: 1000, priceUsd: 100, stockQuantity: 10, categoryId: categories[4].id },
    { name: 'Skeleton Spawner', slug: 'skeleton-spawner', unit: 'cái', priceCoin: 1200, priceUsd: 120, stockQuantity: 8, categoryId: categories[4].id },
    { name: 'Blaze Spawner', slug: 'blaze-spawner', unit: 'cái', priceCoin: 2000, priceUsd: 200, stockQuantity: 5, categoryId: categories[4].id },
  ];

  const items = await Promise.all(
    itemsData.map(item => prisma.item.create({ data: item }))
  );
  console.log(`✅ Đã tạo ${items.length} sản phẩm.\n`);

  // ============ 7. TẠO DELIVERY TIME SLOTS ============
  console.log('⏰ Tạo khung giờ giao hàng...');
  await prisma.deliveryTimeSlot.createMany({
    data: [
      { displayText: 'Sáng (8:00 - 12:00)', isActive: true },
      { displayText: 'Chiều (13:00 - 17:00)', isActive: true },
      { displayText: 'Tối (18:00 - 21:00)', isActive: true },
      { displayText: 'Giao ngay khi có thể', isActive: true },
    ],
  });
  console.log('✅ Đã tạo 4 khung giờ.\n');

  // ============ 8. TẠO VOUCHERS ============
  console.log('🎫 Tạo mã giảm giá...');
  await prisma.voucher.createMany({
    data: [
      {
        code: 'WELCOME10',
        description: 'Giảm 10% cho khách hàng mới',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 100,
        maxDiscount: 50,
        usageLimit: 100,
        isActive: true,
      },
      {
        code: 'SALE50',
        description: 'Giảm 50 Xu cho đơn từ 500 Xu',
        discountType: 'FIXED_COIN',
        discountValue: 50,
        minOrderValue: 500,
        usageLimit: 50,
        isActive: true,
      },
      {
        code: 'VIP20',
        description: 'Giảm 20% cho VIP members',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderValue: 1000,
        maxDiscount: 500,
        usageLimit: 20,
        isActive: true,
      },
    ],
  });
  console.log('✅ Đã tạo 3 mã giảm giá.\n');

  // ============ 9. TẠO SAMPLE ORDERS ============
  console.log('📋 Tạo đơn hàng mẫu...');
  const timeSlot = await prisma.deliveryTimeSlot.findFirst();

  await prisma.order.create({
    data: {
      orderNumber: 'ORD-001',
      inGameName: 'ProPlayer99',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      totalAmountCoin: 200,
      totalAmountUsd: 0,
      vipDiscountAmountCoin: 20,
      pendingAt: new Date(Date.now() - 86400000),
      completedAt: new Date(),
      customer: { connect: { id: customer1.id } },
      deliveryTimeSlot: { connect: { id: timeSlot.id } },
      orderDetails: {
        create: [
          {
            itemId: items[0].id,
            itemNameSnapshot: items[0].name,
            itemSlugSnapshot: items[0].slug,
            itemUnitSnapshot: items[0].unit,
            quantity: 2,
            priceAtPurchaseCoin: 50,
            currencyAtPurchase: 'COIN',
          },
          {
            itemId: items[1].id,
            itemNameSnapshot: items[1].name,
            itemSlugSnapshot: items[1].slug,
            itemUnitSnapshot: items[1].unit,
            quantity: 1,
            priceAtPurchaseCoin: 100,
            currencyAtPurchase: 'COIN',
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 'ORD-002',
      inGameName: 'MinecraftKing',
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      totalAmountCoin: 150,
      totalAmountUsd: 0,
      pendingAt: new Date(),
      customer: { connect: { id: customer2.id } },
      deliveryTimeSlot: { connect: { id: timeSlot.id } },
      orderDetails: {
        create: [
          {
            itemId: items[4].id,
            itemNameSnapshot: items[4].name,
            itemSlugSnapshot: items[4].slug,
            itemUnitSnapshot: items[4].unit,
            quantity: 1,
            priceAtPurchaseCoin: 150,
            currencyAtPurchase: 'COIN',
          },
        ],
      },
    },
  });
  console.log('✅ Đã tạo 2 đơn hàng mẫu.\n');

  // ============ 10. TẠO REVIEWS ============
  console.log('⭐ Tạo reviews mẫu...');
  await prisma.review.createMany({
    data: [
      { userId: customer1.id, itemId: items[0].id, rating: 5, comment: 'Sản phẩm tuyệt vời! Giao hàng nhanh.', isApproved: true },
      { userId: customer2.id, itemId: items[0].id, rating: 4, comment: 'Tốt, sẽ mua lại.', isApproved: true },
      { userId: customer1.id, itemId: items[4].id, rating: 5, comment: 'Kiếm cực mạnh, đáng tiền!', isApproved: true },
    ],
  });
  console.log('✅ Đã tạo 3 reviews.\n');

  // ============ 11. TẠO WISHLIST ============
  console.log('❤️ Tạo wishlist mẫu...');
  await prisma.wishlist.createMany({
    data: [
      { userId: customer1.id, itemId: items[3].id },
      { userId: customer1.id, itemId: items[15].id },
      { userId: customer2.id, itemId: items[11].id },
    ],
  });
  console.log('✅ Đã tạo wishlist.\n');

  console.log('=====================================');
  console.log('🎉 SEEDING HOÀN TẤT!');
  console.log('=====================================');
  console.log(`
📧 Tài khoản đăng nhập:
  - Admin: admin@tailocshop.com / admin123
  - Staff: staff@tailocshop.com / staff123
  - Customer: player1@gmail.com / customer123
  - Customer: player2@gmail.com / customer123

🎫 Mã giảm giá:
  - WELCOME10 (giảm 10%)
  - SALE50 (giảm 50 Xu)
  - VIP20 (giảm 20% cho VIP)
  `);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });