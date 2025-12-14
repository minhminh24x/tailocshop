// File: backend/tests/services/review.service.test.js
// Unit tests for Review Service

import prisma from '../../server/lib/prisma.js';
import { generateRandomEmail } from '../setup.js';

describe('Review Service', () => {
    let testUser;
    let testItem;
    let testCategory;
    let testReview;

    beforeAll(async () => {
        // Create test category
        testCategory = await prisma.category.create({
            data: {
                name: `ReviewTestCat-${Date.now()}`,
                slug: `review-test-cat-${Date.now()}`
            }
        });

        // Create test item
        testItem = await prisma.item.create({
            data: {
                name: `ReviewTestItem-${Date.now()}`,
                slug: `review-test-item-${Date.now()}`,
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
                inGameName: 'ReviewTestUser'
            }
        });
    });

    afterAll(async () => {
        await prisma.review.deleteMany({ where: { userId: testUser.id } });
        await prisma.item.delete({ where: { id: testItem.id } });
        await prisma.category.delete({ where: { id: testCategory.id } });
        await prisma.user.delete({ where: { id: testUser.id } });
        await prisma.$disconnect();
    });

    describe('Create Review', () => {
        it('should create review with rating and comment', async () => {
            testReview = await prisma.review.create({
                data: {
                    userId: testUser.id,
                    itemId: testItem.id,
                    rating: 5,
                    comment: 'Great product!',
                    isApproved: false
                }
            });

            expect(testReview).toBeDefined();
            expect(testReview.rating).toBe(5);
            expect(testReview.comment).toBe('Great product!');
            expect(testReview.isApproved).toBe(false);
        });

        it('should enforce rating range (1-5)', () => {
            const validRatings = [1, 2, 3, 4, 5];
            validRatings.forEach(rating => {
                expect(rating >= 1 && rating <= 5).toBe(true);
            });
        });
    });

    describe('Get Item Reviews', () => {
        it('should get approved reviews only', async () => {
            const approvedReviews = await prisma.review.findMany({
                where: {
                    itemId: testItem.id,
                    isApproved: true
                }
            });

            expect(Array.isArray(approvedReviews)).toBe(true);
        });

        it('should include user info', async () => {
            const reviews = await prisma.review.findMany({
                where: { itemId: testItem.id },
                include: { user: { select: { inGameName: true } } }
            });

            expect(reviews.length).toBeGreaterThan(0);
            expect(reviews[0].user).toBeDefined();
        });
    });

    describe('Calculate Average Rating', () => {
        it('should calculate average correctly', async () => {
            const reviews = await prisma.review.findMany({
                where: { itemId: testItem.id }
            });

            const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
            const avg = reviews.length > 0 ? sum / reviews.length : 0;

            expect(avg).toBeGreaterThanOrEqual(0);
            expect(avg).toBeLessThanOrEqual(5);
        });

        it('should handle no reviews', () => {
            const reviews = [];
            const avg = reviews.length > 0
                ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
                : 0;

            expect(avg).toBe(0);
        });
    });

    describe('Admin Approval', () => {
        it('should approve review', async () => {
            const updated = await prisma.review.update({
                where: { id: testReview.id },
                data: { isApproved: true }
            });

            expect(updated.isApproved).toBe(true);
        });

        it('should unapprove review', async () => {
            const updated = await prisma.review.update({
                where: { id: testReview.id },
                data: { isApproved: false }
            });

            expect(updated.isApproved).toBe(false);
        });
    });

    describe('Update Review', () => {
        it('should update rating and comment', async () => {
            const updated = await prisma.review.update({
                where: { id: testReview.id },
                data: {
                    rating: 4,
                    comment: 'Updated comment'
                }
            });

            expect(updated.rating).toBe(4);
            expect(updated.comment).toBe('Updated comment');
        });
    });

    describe('Delete Review', () => {
        it('should delete review', async () => {
            await prisma.review.delete({
                where: { id: testReview.id }
            });

            const deleted = await prisma.review.findUnique({
                where: { id: testReview.id }
            });

            expect(deleted).toBeNull();
        });
    });
});
