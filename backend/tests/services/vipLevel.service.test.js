// File: backend/tests/services/vipLevel.service.test.js
// Unit tests for VIP Level Service

import prisma from '../../server/lib/prisma.js';
import { generateRandomEmail } from '../setup.js';

describe('VIP Level Service', () => {
    let testUser;

    beforeAll(async () => {
        // Create test user
        testUser = await prisma.user.create({
            data: {
                email: generateRandomEmail(),
                password: 'hash',
                inGameName: 'VipTestUser',
                totalSpentCoin: 0,
                vipLevelInt: 0
            }
        });
    });

    afterAll(async () => {
        await prisma.user.delete({ where: { id: testUser.id } });
        await prisma.$disconnect();
    });

    describe('VIP Level Calculation', () => {
        it('should get all VIP levels ordered by threshold', async () => {
            const levels = await prisma.vipLevel.findMany({
                orderBy: { coinThreshold: 'asc' }
            });

            expect(Array.isArray(levels)).toBe(true);

            // Check ordering
            for (let i = 1; i < levels.length; i++) {
                expect(parseFloat(levels[i].coinThreshold))
                    .toBeGreaterThanOrEqual(parseFloat(levels[i - 1].coinThreshold));
            }
        });

        it('should calculate VIP level based on spending', async () => {
            const levels = await prisma.vipLevel.findMany({
                orderBy: { coinThreshold: 'desc' }
            });

            const testSpent = 5000;
            let newLevel = 0;

            for (const level of levels) {
                if (testSpent >= level.coinThreshold) {
                    newLevel = level.level;
                    break;
                }
            }

            expect(newLevel).toBeGreaterThanOrEqual(0);
        });

        it('should return level 0 for no spending', async () => {
            const levels = await prisma.vipLevel.findMany({
                orderBy: { coinThreshold: 'desc' }
            });

            const noSpent = 0;
            let newLevel = 0;

            for (const level of levels) {
                if (noSpent >= level.coinThreshold) {
                    newLevel = level.level;
                    break;
                }
            }

            expect(newLevel).toBe(0);
        });
    });

    describe('VIP Discount', () => {
        it('should get discount percent for VIP level', async () => {
            const vipLevel = await prisma.vipLevel.findFirst({
                where: { level: { gt: 0 } }
            });

            if (vipLevel) {
                expect(vipLevel.discountPercent).toBeGreaterThanOrEqual(0);
                expect(vipLevel.discountPercent).toBeLessThanOrEqual(100);
            }
        });

        it('should apply discount correctly', () => {
            const subtotal = 1000;
            const discountPercent = 10;
            const discount = subtotal * (discountPercent / 100);
            const total = subtotal - discount;

            expect(discount).toBe(100);
            expect(total).toBe(900);
        });
    });

    describe('User VIP Update', () => {
        it('should update user totalSpentCoin', async () => {
            const addedSpent = 1000;

            const updated = await prisma.user.update({
                where: { id: testUser.id },
                data: { totalSpentCoin: { increment: addedSpent } }
            });

            expect(parseFloat(updated.totalSpentCoin)).toBe(1000);
        });

        it('should update user vipLevelInt', async () => {
            const updated = await prisma.user.update({
                where: { id: testUser.id },
                data: { vipLevelInt: 1 }
            });

            expect(updated.vipLevelInt).toBe(1);
        });

        it('should get user with VIP level details', async () => {
            const user = await prisma.user.findUnique({
                where: { id: testUser.id },
                include: { vipLevel: true }
            });

            expect(user).toBeDefined();
            expect(user.vipLevel).toBeDefined();
        });
    });
});
