// File: backend/tests/setup.js
// Test setup file
import prisma from '../server/lib/prisma.js';

// Increase timeout for database operations
jest.setTimeout(30000);

// Clean up database connection after all tests
afterAll(async () => {
    await prisma.$disconnect();
});

// Helper functions for tests
export const createTestUser = async (overrides = {}) => {
    const timestamp = Date.now();
    return prisma.user.create({
        data: {
            email: `test-${timestamp}@example.com`,
            password: '$2a$10$hashedpassword',
            inGameName: `TestUser${timestamp}`,
            role: 'CUSTOMER',
            ...overrides
        }
    });
};

export const deleteTestUser = async (email) => {
    try {
        await prisma.user.delete({ where: { email } });
    } catch (e) {
        // Ignore if not found
    }
};

export const generateRandomEmail = () => {
    return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
};

export default prisma;
