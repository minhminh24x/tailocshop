// File: backend/tests/services/auth.service.test.js
// Unit tests for authentication

import prisma from '../../server/lib/prisma.js';
import bcrypt from 'bcryptjs';
import { generateRandomEmail } from '../setup.js';

describe('Auth Service', () => {
    let testUserEmail;

    beforeAll(async () => {
        testUserEmail = generateRandomEmail();
    });

    afterAll(async () => {
        // Cleanup
        try {
            await prisma.user.deleteMany({
                where: { email: { startsWith: 'test-' } }
            });
        } catch (e) { }
        await prisma.$disconnect();
    });

    describe('User Registration', () => {
        it('should hash password correctly', async () => {
            const plainPassword = 'TestPassword123!';
            const hashedPassword = await bcrypt.hash(plainPassword, 12);

            expect(hashedPassword).not.toBe(plainPassword);
            expect(hashedPassword.length).toBeGreaterThan(50);
        });

        it('should verify password match', async () => {
            const plainPassword = 'TestPassword123!';
            const hashedPassword = await bcrypt.hash(plainPassword, 12);

            const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
            expect(isMatch).toBe(true);
        });

        it('should reject wrong password', async () => {
            const plainPassword = 'TestPassword123!';
            const hashedPassword = await bcrypt.hash(plainPassword, 12);

            const isMatch = await bcrypt.compare('WrongPassword', hashedPassword);
            expect(isMatch).toBe(false);
        });
    });

    describe('User Creation', () => {
        it('should create user with required fields', async () => {
            const user = await prisma.user.create({
                data: {
                    email: testUserEmail,
                    password: await bcrypt.hash('password', 12),
                    inGameName: 'TestPlayer'
                }
            });

            expect(user).toBeDefined();
            expect(user.email).toBe(testUserEmail);
            expect(user.role).toBe('CUSTOMER');
            expect(user.inGameName).toBe('TestPlayer');
        });

        it('should reject duplicate email', async () => {
            await expect(
                prisma.user.create({
                    data: {
                        email: testUserEmail,
                        password: 'hash',
                        inGameName: 'AnotherPlayer'
                    }
                })
            ).rejects.toThrow();
        });

        it('should default vipLevelInt to 0', async () => {
            const user = await prisma.user.findUnique({
                where: { email: testUserEmail }
            });

            expect(user.vipLevelInt).toBe(0);
        });
    });
});
