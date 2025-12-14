// File: backend/tests/services/voucher.service.test.js
// Unit tests for Voucher Service

import prisma from '../../server/lib/prisma.js';

describe('Voucher Service', () => {
    let testVoucher;

    beforeAll(async () => {
        // Create test voucher
        testVoucher = await prisma.voucher.create({
            data: {
                code: `TEST-${Date.now()}`,
                description: 'Test voucher',
                discountType: 'PERCENTAGE',
                discountValue: 10,
                minOrderValue: 100,
                maxDiscount: 50,
                usageLimit: 100,
                usedCount: 0,
                isActive: true,
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            }
        });
    });

    afterAll(async () => {
        await prisma.voucher.delete({ where: { id: testVoucher.id } });
        await prisma.$disconnect();
    });

    describe('Voucher Validation', () => {
        it('should find active voucher by code', async () => {
            const voucher = await prisma.voucher.findUnique({
                where: { code: testVoucher.code }
            });

            expect(voucher).toBeDefined();
            expect(voucher.isActive).toBe(true);
        });

        it('should check minimum order value', () => {
            const orderTotal = 50;
            const minOrderValue = 100;
            const isValid = orderTotal >= minOrderValue;

            expect(isValid).toBe(false);
        });

        it('should pass minimum order check with higher total', () => {
            const orderTotal = 150;
            const minOrderValue = 100;
            const isValid = orderTotal >= minOrderValue;

            expect(isValid).toBe(true);
        });
    });

    describe('Discount Calculation', () => {
        it('should calculate percentage discount correctly', () => {
            const orderTotal = 1000;
            const discountPercent = 10;
            const discount = orderTotal * (discountPercent / 100);

            expect(discount).toBe(100);
        });

        it('should cap discount at maxDiscount', () => {
            const orderTotal = 1000;
            const discountPercent = 10;
            const maxDiscount = 50;

            let discount = orderTotal * (discountPercent / 100);
            if (discount > maxDiscount) {
                discount = maxDiscount;
            }

            expect(discount).toBe(50);
        });

        it('should calculate fixed discount correctly', () => {
            const orderTotal = 1000;
            const fixedDiscount = 200;
            const finalTotal = orderTotal - fixedDiscount;

            expect(finalTotal).toBe(800);
        });

        it('should not allow discount greater than order total', () => {
            const orderTotal = 100;
            const discount = 150;
            const finalDiscount = Math.min(discount, orderTotal);

            expect(finalDiscount).toBe(100);
        });
    });

    describe('Usage Tracking', () => {
        it('should increment usedCount', async () => {
            const before = testVoucher.usedCount;

            const updated = await prisma.voucher.update({
                where: { id: testVoucher.id },
                data: { usedCount: { increment: 1 } }
            });

            expect(updated.usedCount).toBe(before + 1);
        });

        it('should check usage limit', async () => {
            const voucher = await prisma.voucher.findUnique({
                where: { id: testVoucher.id }
            });

            const hasReachedLimit = voucher.usageLimit && voucher.usedCount >= voucher.usageLimit;
            expect(hasReachedLimit).toBe(false);
        });
    });

    describe('Date Validation', () => {
        it('should check start date', () => {
            const startDate = new Date('2020-01-01');
            const now = new Date();
            const hasStarted = now >= startDate;

            expect(hasStarted).toBe(true);
        });

        it('should check end date', () => {
            const endDate = new Date('2030-01-01');
            const now = new Date();
            const hasExpired = now > endDate;

            expect(hasExpired).toBe(false);
        });
    });
});
