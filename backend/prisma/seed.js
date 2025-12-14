// File: prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seeding...\n');

  try {
    // 1. XÓA DỮ LIỆU CŨ
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
    console.log('✅ Xóa xong.\n');

    // 2. VIP LEVELS
    console.log('⭐ Tạo VIP Levels...');
    await prisma.vipLevel.createMany({
      data: [
        { level: 0, name: 'Tan Thu', coinThreshold: 0, discountPercent: 0 },
        { level: 1, name: 'Chien Binh', coinThreshold: 500, discountPercent: 5 },
        { level: 2, name: 'Tinh Anh', coinThreshold: 2000, discountPercent: 10 },
        { level: 3, name: 'Dai Gia', coinThreshold: 5000, discountPercent: 15 },
        { level: 4, name: 'Huyen Thoai', coinThreshold: 10000, discountPercent: 20 },
      ],
    });
    console.log('✅ VIP Levels done.\n');

    // 3. USERS
    console.log('👥 Tạo Users...');
    const pass = await bcrypt.hash('admin123', 12);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@tailocshop.com',
        passwordHash: pass,
        role: 'ADMIN',
        inGameName: 'AdminTaiLoc',
      },
    });
    console.log('Admin created:', admin.email);

    const staff = await prisma.user.create({
      data: {
        email: 'staff@tailocshop.com',
        passwordHash: pass,
        role: 'STAFF',
        inGameName: 'StaffTaiLoc',
      },
    });
    console.log('Staff created:', staff.email);

    const customer = await prisma.user.create({
      data: {
        email: 'player1@gmail.com',
        passwordHash: pass,
        role: 'CUSTOMER',
        inGameName: 'ProPlayer99',
      },
    });
    console.log('Customer created:', customer.email);
    console.log('✅ Users done.\n');

    // 4. EXCHANGE RATE
    console.log('💱 Tạo Exchange Rate...');
    await prisma.currencyExchangeRate.create({
      data: {
        rate: 1000,
        rateType: 'XU_TO_USD',
        updatedById: admin.id,
      },
    });
    console.log('✅ Exchange Rate done.\n');

    // 5. CATEGORIES (NO description field in schema!)
    console.log('📁 Tạo Categories...');
    const cat1 = await prisma.category.create({
      data: { name: 'Vat Pham Hiem', slug: 'vat-pham-hiem' },
    });
    console.log('Category created:', cat1.name);

    const cat2 = await prisma.category.create({
      data: { name: 'Trang Bi', slug: 'trang-bi' },
    });
    console.log('Category created:', cat2.name);

    const cat3 = await prisma.category.create({
      data: { name: 'Khoi Vat Lieu', slug: 'khoi-vat-lieu' },
    });
    console.log('Category created:', cat3.name);

    const cat4 = await prisma.category.create({
      data: { name: 'Do An', slug: 'do-an' },
    });
    console.log('Category created:', cat4.name);

    const cat5 = await prisma.category.create({
      data: { name: 'Spawner', slug: 'spawner' },
    });
    console.log('Category created:', cat5.name);
    console.log('✅ Categories done.\n');

    // 6. ITEMS
    console.log('📦 Tạo Items...');
    const items = [];

    items.push(await prisma.item.create({
      data: { name: 'Kim Cuong', slug: 'kim-cuong', unit: 'PIECE', priceCoin: 50, priceUsd: 5, stockQuantity: 500, categoryId: cat1.id },
    }));

    items.push(await prisma.item.create({
      data: { name: 'Ngoc Ender', slug: 'ngoc-ender', unit: 'PIECE', priceCoin: 100, priceUsd: 10, stockQuantity: 200, categoryId: cat1.id },
    }));

    items.push(await prisma.item.create({
      data: { name: 'Elytra', slug: 'elytra', unit: 'PIECE', priceCoin: 500, priceUsd: 50, stockQuantity: 20, categoryId: cat1.id },
    }));

    items.push(await prisma.item.create({
      data: { name: 'Kiem Kim Cuong', slug: 'kiem-kim-cuong', unit: 'PIECE', priceCoin: 150, priceUsd: 15, stockQuantity: 100, categoryId: cat2.id },
    }));

    items.push(await prisma.item.create({
      data: { name: 'Ao Giap Full Set', slug: 'ao-giap-full-set', unit: 'PIECE', priceCoin: 400, priceUsd: 40, stockQuantity: 50, categoryId: cat2.id },
    }));

    items.push(await prisma.item.create({
      data: { name: 'Obsidian Stack', slug: 'obsidian-stack', unit: 'STACK', priceCoin: 20, stockQuantity: 500, categoryId: cat3.id },
    }));

    items.push(await prisma.item.create({
      data: { name: 'Glowstone Stack', slug: 'glowstone-stack', unit: 'STACK', priceCoin: 15, stockQuantity: 800, categoryId: cat3.id },
    }));

    items.push(await prisma.item.create({
      data: { name: 'Golden Apple', slug: 'golden-apple', unit: 'PIECE', priceCoin: 80, priceUsd: 8, stockQuantity: 150, categoryId: cat4.id },
    }));

    items.push(await prisma.item.create({
      data: { name: 'Steak Stack', slug: 'steak-stack', unit: 'STACK', priceCoin: 10, stockQuantity: 1000, categoryId: cat4.id },
    }));

    items.push(await prisma.item.create({
      data: { name: 'Zombie Spawner', slug: 'zombie-spawner', unit: 'PIECE', priceCoin: 1000, priceUsd: 100, stockQuantity: 10, categoryId: cat5.id },
    }));

    items.push(await prisma.item.create({
      data: { name: 'Blaze Spawner', slug: 'blaze-spawner', unit: 'PIECE', priceCoin: 2000, priceUsd: 200, stockQuantity: 5, categoryId: cat5.id },
    }));

    console.log(`✅ Created ${items.length} Items.\n`);

    // 7. DELIVERY TIME SLOTS
    console.log('⏰ Tạo Time Slots...');
    await prisma.deliveryTimeSlot.createMany({
      data: [
        { displayText: 'Sang (8:00 - 12:00)', isActive: true },
        { displayText: 'Chieu (13:00 - 17:00)', isActive: true },
        { displayText: 'Toi (18:00 - 21:00)', isActive: true },
        { displayText: 'Giao ngay', isActive: true },
      ],
    });
    console.log('✅ Time Slots done.\n');

    // 8. VOUCHERS
    console.log('🎫 Tạo Vouchers...');
    await prisma.voucher.createMany({
      data: [
        {
          code: 'WELCOME10',
          description: 'Giam 10 phan tram',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          minOrderValue: 100,
          maxDiscount: 50,
          usageLimit: 100,
          isActive: true,
        },
        {
          code: 'SALE50',
          description: 'Giam 50 Xu',
          discountType: 'FIXED_COIN',
          discountValue: 50,
          minOrderValue: 500,
          usageLimit: 50,
          isActive: true,
        },
        {
          code: 'VIP20',
          description: 'Giam 20 phan tram cho VIP',
          discountType: 'PERCENTAGE',
          discountValue: 20,
          minOrderValue: 1000,
          maxDiscount: 500,
          usageLimit: 20,
          isActive: true,
        },
      ],
    });
    console.log('✅ Vouchers done.\n');

    // 9. REVIEWS
    console.log('⭐ Tạo Reviews...');
    await prisma.review.createMany({
      data: [
        { userId: customer.id, itemId: items[0].id, rating: 5, comment: 'San pham tuyet voi!', isApproved: true },
        { userId: customer.id, itemId: items[3].id, rating: 5, comment: 'Kiem cuc manh!', isApproved: true },
      ],
    });
    console.log('✅ Reviews done.\n');

    // 10. WISHLIST
    console.log('❤️ Tạo Wishlist...');
    await prisma.wishlist.createMany({
      data: [
        { userId: customer.id, itemId: items[2].id },
        { userId: customer.id, itemId: items[9].id },
      ],
    });
    console.log('✅ Wishlist done.\n');

    console.log('=====================================');
    console.log('🎉 SEEDING HOAN TAT!');
    console.log('=====================================');
    console.log(`
📧 Tai khoan dang nhap:
  - Admin: admin@tailocshop.com / admin123
  - Staff: staff@tailocshop.com / admin123
  - Customer: player1@gmail.com / admin123

🎫 Ma giam gia: WELCOME10, SALE50, VIP20
    `);
  } catch (error) {
    console.error('❌ LOI SEEDING:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    if (error.meta) console.error('Meta:', JSON.stringify(error.meta, null, 2));
    throw error;
  }
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });