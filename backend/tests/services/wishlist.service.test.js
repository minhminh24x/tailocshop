// File: backend/tests/services/wishlist.service.test.js
// Unit tests for Wishlist Service

import prisma from '../../server/lib/prisma.js';
import { generateRandomEmail } from '../setup.js';

describe('Wishlist Service', () => {
    let testUser;
    let testItem;
    let testCategory;

    beforeAll(async () => {
        // Create test category
        testCategory = await prisma.category.create({
            data: {
                name: `WishlistTestCat-${Date.now()}`,
                slug: `wishlist-test-cat-${Date.now()}`
            }
        });

        // Create test item
        testItem = await prisma.item.create({
            data: {
                name: `WishlistTestItem-${Date.now()}`,
                slug: `wishlist-test-item-${Date.now()}`,
                unit: 'unit',
                priceCoin: 100,
                stockQuantity: 10,
                categoryId: testCategory.id
            }
        });

        // Create test user
        testUser = await prisma.user.create({
            data: {
                email: generateRandomEmail(),
                password: 'hash',
                inGameName: 'WishlistTestUser'
            }
        });
    });

    afterAll(async () => {
        await prisma.wishlist.deleteMany({ where: { userId: testUser.id } });
        await prisma.item.delete({ where: { id: testItem.id } });
        await prisma.category.delete({ where: { id: testCategory.id } });
        await prisma.user.delete({ where: { id: testUser.id } });
        await prisma.$disconnect();
    });

    describe('Add to Wishlist', () => {
        it('should add item to wishlist', async () => {
            const wishlistItem = await prisma.wishlist.create({
                data: {
                    userId: testUser.id,
                    itemId: testItem.id
                }
            });

            expect(wishlistItem).toBeDefined();
            expect(wishlistItem.userId).toBe(testUser.id);
            expect(wishlistItem.itemId).toBe(testItem.id);
        });

        it('should prevent duplicate wishlist entries', async () => {
            await expect(
                prisma.wishlist.create({
                    data: {
                        userId: testUser.id,
                        itemId: testItem.id
                    }
                })
            ).rejects.toThrow();
        });
    });

    describe('Get Wishlist', () => {
        it('should get user wishlist', async () => {
            const wishlist = await prisma.wishlist.findMany({
                where: { userId: testUser.id },
                include: { item: true }
            });

            expect(wishlist).toBeDefined();
            expect(Array.isArray(wishlist)).toBe(true);
            expect(wishlist.length).toBeGreaterThan(0);
        });

        it('should include item details', async () => {
            const wishlist = await prisma.wishlist.findMany({
                where: { userId: testUser.id },
                include: { item: true }
            });

            expect(wishlist[0].item).toBeDefined();
            expect(wishlist[0].item.name).toContain('WishlistTestItem');
        });
    });

    describe('Check in Wishlist', () => {
        it('should find existing wishlist item', async () => {
            const exists = await prisma.wishlist.findUnique({
                where: {
                    userId_itemId: {
                        userId: testUser.id,
                        itemId: testItem.id
                    }
                }
            });

            expect(exists).toBeDefined();
        });

        it('should return null for non-existent item', async () => {
            const exists = await prisma.wishlist.findUnique({
                where: {
                    userId_itemId: {
                        userId: testUser.id,
                        itemId: '00000000-0000-0000-0000-000000000000'
                    }
                }
            });

            expect(exists).toBeNull();
        });
    });

    describe('Remove from Wishlist', () => {
        it('should remove item from wishlist', async () => {
            await prisma.wishlist.delete({
                where: {
                    userId_itemId: {
                        userId: testUser.id,
                        itemId: testItem.id
                    }
                }
            });

            const exists = await prisma.wishlist.findUnique({
                where: {
                    userId_itemId: {
                        userId: testUser.id,
                        itemId: testItem.id
                    }
                }
            });

            expect(exists).toBeNull();
        });
    });
});
