// File: backend/tests/services/item.service.test.js
// Unit tests for Item Service

import prisma from '../../server/lib/prisma.js';

describe('Item Service', () => {
    let testCategory;
    let testItem;

    beforeAll(async () => {
        // Create test category
        testCategory = await prisma.category.create({
            data: {
                name: `ItemTestCat-${Date.now()}`,
                slug: `item-test-cat-${Date.now()}`
            }
        });

        // Create test item
        testItem = await prisma.item.create({
            data: {
                name: `TestItem-${Date.now()}`,
                slug: `test-item-${Date.now()}`,
                unit: 'piece',
                description: 'Test description',
                priceCoin: 100,
                priceUsd: 5.99,
                stockQuantity: 50,
                isActive: true,
                categoryId: testCategory.id
            }
        });
    });

    afterAll(async () => {
        await prisma.item.delete({ where: { id: testItem.id } });
        await prisma.category.delete({ where: { id: testCategory.id } });
        await prisma.$disconnect();
    });

    describe('Item CRUD', () => {
        it('should create item with all fields', () => {
            expect(testItem).toBeDefined();
            expect(testItem.name).toContain('TestItem');
            expect(testItem.priceCoin).toBe(100);
            expect(testItem.stockQuantity).toBe(50);
        });

        it('should find item by slug and unit', async () => {
            const item = await prisma.item.findFirst({
                where: {
                    slug: testItem.slug,
                    unit: testItem.unit
                }
            });

            expect(item).toBeDefined();
            expect(item.id).toBe(testItem.id);
        });

        it('should update item stock', async () => {
            const updated = await prisma.item.update({
                where: { id: testItem.id },
                data: { stockQuantity: 45 }
            });

            expect(updated.stockQuantity).toBe(45);

            // Restore
            await prisma.item.update({
                where: { id: testItem.id },
                data: { stockQuantity: 50 }
            });
        });
    });

    describe('Item Filtering', () => {
        it('should filter by category', async () => {
            const items = await prisma.item.findMany({
                where: { categoryId: testCategory.id }
            });

            expect(items.length).toBeGreaterThan(0);
            expect(items[0].categoryId).toBe(testCategory.id);
        });

        it('should filter active items only', async () => {
            const items = await prisma.item.findMany({
                where: { isActive: true }
            });

            items.forEach(item => {
                expect(item.isActive).toBe(true);
            });
        });

        it('should filter by price range', async () => {
            const minPrice = 50;
            const maxPrice = 150;

            const items = await prisma.item.findMany({
                where: {
                    priceCoin: {
                        gte: minPrice,
                        lte: maxPrice
                    }
                }
            });

            items.forEach(item => {
                expect(parseFloat(item.priceCoin)).toBeGreaterThanOrEqual(minPrice);
                expect(parseFloat(item.priceCoin)).toBeLessThanOrEqual(maxPrice);
            });
        });
    });

    describe('Item Pricing', () => {
        it('should have valid coin price', () => {
            expect(parseFloat(testItem.priceCoin)).toBeGreaterThan(0);
        });

        it('should have valid USD price', () => {
            expect(parseFloat(testItem.priceUsd)).toBeGreaterThan(0);
        });

        it('should handle null USD price', async () => {
            const itemWithoutUsd = await prisma.item.create({
                data: {
                    name: `NullUsdItem-${Date.now()}`,
                    slug: `null-usd-item-${Date.now()}`,
                    unit: 'piece',
                    priceCoin: 100,
                    priceUsd: null,
                    stockQuantity: 10,
                    categoryId: testCategory.id
                }
            });

            expect(itemWithoutUsd.priceUsd).toBeNull();

            await prisma.item.delete({ where: { id: itemWithoutUsd.id } });
        });
    });

    describe('Stock Management', () => {
        it('should check low stock threshold', async () => {
            const threshold = 10;
            const lowStockItems = await prisma.item.findMany({
                where: {
                    stockQuantity: { lte: threshold },
                    isActive: true
                }
            });

            lowStockItems.forEach(item => {
                expect(item.stockQuantity).toBeLessThanOrEqual(threshold);
            });
        });

        it('should decrement stock correctly', async () => {
            const quantity = 5;
            const before = testItem.stockQuantity;

            await prisma.item.update({
                where: { id: testItem.id },
                data: { stockQuantity: { decrement: quantity } }
            });

            const after = await prisma.item.findUnique({
                where: { id: testItem.id }
            });

            expect(after.stockQuantity).toBe(before - quantity);

            // Restore
            await prisma.item.update({
                where: { id: testItem.id },
                data: { stockQuantity: before }
            });
        });
    });
});
