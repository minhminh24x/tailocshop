// File: prisma/fixVipLevels.js
// Script sửa VIP levels cho tất cả users dựa trên totalSpentCoin thực tế

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixVipLevels() {
    console.log('🔧 Bắt đầu sửa VIP levels...\n');

    // 1. Lấy tất cả VIP levels, sắp xếp giảm dần theo threshold
    const vipLevels = await prisma.vipLevel.findMany({
        orderBy: { coinThreshold: 'desc' },
    });

    console.log('📊 VIP Levels trong hệ thống:');
    vipLevels.forEach(vip => {
        console.log(`   Level ${vip.level}: ${vip.name} (threshold: ${vip.coinThreshold})`);
    });
    console.log('');

    // 2. Lấy tất cả users
    const users = await prisma.user.findMany({
        select: {
            id: true,
            inGameName: true,
            totalSpentCoin: true,
            vipLevelInt: true,
        },
    });

    console.log(`👥 Tìm thấy ${users.length} users\n`);

    let fixedCount = 0;

    // 3. Với mỗi user, tính VIP level đúng
    for (const user of users) {
        const totalSpent = parseFloat(user.totalSpentCoin) || 0;

        // Tìm VIP level cao nhất mà user đạt được
        let correctVipLevel = 0;
        for (const vip of vipLevels) {
            if (totalSpent >= parseFloat(vip.coinThreshold)) {
                correctVipLevel = vip.level;
                break;
            }
        }

        // Nếu VIP hiện tại sai, sửa lại
        if (user.vipLevelInt !== correctVipLevel) {
            console.log(`⚠️  ${user.inGameName}: vipLevelInt ${user.vipLevelInt} → ${correctVipLevel} (spent: ${totalSpent})`);

            await prisma.user.update({
                where: { id: user.id },
                data: { vipLevelInt: correctVipLevel },
            });

            fixedCount++;
        }
    }

    console.log(`\n✅ Đã sửa ${fixedCount} users`);
    await prisma.$disconnect();
}

fixVipLevels()
    .catch(e => {
        console.error('Error:', e);
        prisma.$disconnect();
        process.exit(1);
    });
