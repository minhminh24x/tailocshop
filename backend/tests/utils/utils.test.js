// File: backend/tests/utils/utils.test.js
// Unit tests for utility functions

describe('Utility Functions', () => {
    describe('Number Formatting', () => {
        it('should format numbers with separators', () => {
            const formatNumber = (num) => {
                return num.toLocaleString('vi-VN');
            };

            expect(formatNumber(1000)).toBe('1.000');
            expect(formatNumber(1000000)).toBe('1.000.000');
        });

        it('should round decimals', () => {
            expect(Math.round(9.99)).toBe(10);
            expect(Math.ceil(9.01)).toBe(10);
            expect(Math.floor(9.99)).toBe(9);
        });
    });

    describe('Date Validation', () => {
        it('should check if date is in past', () => {
            const pastDate = new Date('2020-01-01');
            const isInPast = pastDate < new Date();
            expect(isInPast).toBe(true);
        });

        it('should check if date is in future', () => {
            const futureDate = new Date('2030-01-01');
            const isInFuture = futureDate > new Date();
            expect(isInFuture).toBe(true);
        });

        it('should calculate date difference', () => {
            const start = new Date('2024-01-01');
            const end = new Date('2024-01-08');
            const diffMs = end - start;
            const diffDays = diffMs / (1000 * 60 * 60 * 24);

            expect(diffDays).toBe(7);
        });
    });

    describe('String Validation', () => {
        it('should validate email format', () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            expect(emailRegex.test('test@example.com')).toBe(true);
            expect(emailRegex.test('invalid')).toBe(false);
            expect(emailRegex.test('test@.com')).toBe(false);
        });

        it('should validate password strength', () => {
            const isStrongPassword = (password) => {
                return password.length >= 8;
            };

            expect(isStrongPassword('short')).toBe(false);
            expect(isStrongPassword('longenough')).toBe(true);
        });

        it('should generate slug from string', () => {
            const slugify = (str) => {
                return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            };

            expect(slugify('Hello World')).toBe('hello-world');
            expect(slugify('Test Item 123')).toBe('test-item-123');
        });
    });

    describe('Array Operations', () => {
        it('should paginate array', () => {
            const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const page = 2;
            const limit = 3;
            const skip = (page - 1) * limit;
            const paginated = items.slice(skip, skip + limit);

            expect(paginated).toEqual([4, 5, 6]);
        });

        it('should calculate total pages', () => {
            const total = 25;
            const limit = 10;
            const totalPages = Math.ceil(total / limit);

            expect(totalPages).toBe(3);
        });

        it('should sort items by price', () => {
            const items = [
                { name: 'B', price: 30 },
                { name: 'A', price: 10 },
                { name: 'C', price: 20 }
            ];

            const sorted = [...items].sort((a, b) => a.price - b.price);

            expect(sorted[0].name).toBe('A');
            expect(sorted[2].name).toBe('B');
        });
    });

    describe('Error Handling', () => {
        it('should create error with status code', () => {
            class ApiError extends Error {
                constructor(statusCode, message) {
                    super(message);
                    this.statusCode = statusCode;
                }
            }

            const error = new ApiError(404, 'Not found');
            expect(error.statusCode).toBe(404);
            expect(error.message).toBe('Not found');
        });
    });
});
