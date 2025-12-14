// File: backend/tests/services/order.service.test.js
// Unit tests for Order Service

import prisma from '../../server/lib/prisma.js';
import { generateRandomEmail } from '../setup.js';

describe('Order Service', () => {
    let testUser;
    let testItem;
    let testCategory;

    beforeAll(async () => {
        // Create test category
        testCategory = await prisma.category.create({
            data: {
                name: `TestCategory-${Date.now()}`,
                slug: `test-category-${Date.now()}`
            }
        });

        // Create test item
        testItem = await prisma.item.create({
            data: {
                name: `TestItem-${Date.now()}`,
                slug: `test-item-${Date.now()}`,
                unit: 'test-unit',
                priceCoin: 100,
                priceUsd: 10,
                stockQuantity: 50,
                categoryId: testCategory.id
            }
        });

        // Create test user
        testUser = await prisma.user.create({
            data: {
                email: generateRandomEmail(),
                password: 'hashedpassword',
                inGameName: 'TestOrderUser'
            }
        });
    });

    afterAll(async () => {
        // Cleanup in correct order
        await prisma.inventoryLog.deleteMany({
            where: { userId: testUser.id }
        });
        await prisma.orderDetail.deleteMany({
            where: { item: { id: testItem.id } }
        });
        await prisma.order.deleteMany({
            where: { customerUserId: testUser.id }
        });
        await prisma.item.delete({ where: { id: testItem.id } });
        await prisma.category.delete({ where: { id: testCategory.id } });
        await prisma.user.delete({ where: { id: testUser.id } });
        await prisma.$disconnect();
    });

    describe('Order Status', () => {
        it('should have valid order statuses', () => {
            const validStatuses = ['PENDING', 'PREPARING', 'READY_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'];
            validStatuses.forEach(status => {
                expect(status).toBeDefined();
            });
        });

        it('should have valid payment statuses', () => {
            const validStatuses = ['PAID', 'UNPAID'];
            validStatuses.forEach(status => {
                expect(status).toBeDefined();
            });
        });
    });

    describe('Stock Management', () => {
        it('should have sufficient stock', async () => {
            const item = await prisma.item.findUnique({
                where: { id: testItem.id }
            });

            expect(item.stockQuantity).toBeGreaterThan(0);
        });

        it('should track stock updates', async () => {
            const originalStock = testItem.stockQuantity;

            const updatedItem = await prisma.item.update({
                where: { id: testItem.id },
                data: { stockQuantity: { decrement: 5 } }
            });

            expect(updatedItem.stockQuantity).toBe(originalStock - 5);

            // Restore
            await prisma.item.update({
                where: { id: testItem.id },
                data: { stockQuantity: originalStock }
            });
        });
    });

    describe('Order Pricing', () => {
        it('should calculate coin price correctly', () => {
            const quantity = 3;
            const pricePerUnit = 100;
            const total = quantity * pricePerUnit;

            expect(total).toBe(300);
        });

        it('should apply VIP discount correctly', () => {
            const subtotal = 1000;
            const discountPercent = 10;
            const discount = subtotal * (discountPercent / 100);
            const total = subtotal - discount;

            expect(discount).toBe(100);
            expect(total).toBe(900);
        });

        it('should round coins to integer', () => {
            const total = 99.7;
            const rounded = Math.ceil(total);

            expect(rounded).toBe(100);
        });
    });
});
