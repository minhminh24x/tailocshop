// File: backend/tests/lib/cache.test.js
// Unit tests for Cache utility

import cache, { cacheWrapper } from '../../server/lib/cache.js';

describe('Cache Utility', () => {
    beforeEach(() => {
        cache.flush();
    });

    afterAll(() => {
        cache.flush();
    });

    describe('Basic Operations', () => {
        it('should set and get value', () => {
            cache.set('test-key', 'test-value', 60);
            const value = cache.get('test-key');

            expect(value).toBe('test-value');
        });

        it('should return null for non-existent key', () => {
            const value = cache.get('non-existent');
            expect(value).toBeNull();
        });

        it('should delete value', () => {
            cache.set('to-delete', 'value', 60);
            cache.del('to-delete');

            expect(cache.get('to-delete')).toBeNull();
        });

        it('should check if key exists', () => {
            cache.set('exists', 'value', 60);

            expect(cache.has('exists')).toBe(true);
            expect(cache.has('not-exists')).toBe(false);
        });
    });

    describe('TTL', () => {
        it('should expire after TTL', async () => {
            cache.set('expire-test', 'value', 1); // 1 second TTL

            expect(cache.get('expire-test')).toBe('value');

            // Wait for expiry
            await new Promise(resolve => setTimeout(resolve, 1500));

            expect(cache.get('expire-test')).toBeNull();
        }, 5000);

        it('should use default TTL if not specified', () => {
            cache.set('default-ttl', 'value');
            expect(cache.get('default-ttl')).toBe('value');
        });
    });

    describe('Pattern Deletion', () => {
        it('should delete keys matching pattern', () => {
            cache.set('user:1', 'data1', 60);
            cache.set('user:2', 'data2', 60);
            cache.set('item:1', 'item1', 60);

            const deleted = cache.delPattern('user:*');

            expect(deleted).toBe(2);
            expect(cache.get('user:1')).toBeNull();
            expect(cache.get('user:2')).toBeNull();
            expect(cache.get('item:1')).toBe('item1');
        });
    });

    describe('Flush', () => {
        it('should clear all cache', () => {
            cache.set('key1', 'value1', 60);
            cache.set('key2', 'value2', 60);

            cache.flush();

            expect(cache.get('key1')).toBeNull();
            expect(cache.get('key2')).toBeNull();
        });
    });

    describe('Stats', () => {
        it('should return cache stats', () => {
            cache.set('stat-key', 'value', 60);

            const stats = cache.stats();

            expect(stats).toBeDefined();
            expect(stats.keys).toBe(1);
            expect(stats.memoryUsage).toBeGreaterThan(0);
        });
    });

    describe('Cache Wrapper', () => {
        it('should cache async function result', async () => {
            let callCount = 0;
            const asyncFn = async () => {
                callCount++;
                return 'result';
            };

            // First call - should execute function
            const result1 = await cacheWrapper('async-key', asyncFn, 60);
            expect(result1).toBe('result');
            expect(callCount).toBe(1);

            // Second call - should use cache
            const result2 = await cacheWrapper('async-key', asyncFn, 60);
            expect(result2).toBe('result');
            expect(callCount).toBe(1); // Still 1, not 2
        });
    });

    describe('Object Storage', () => {
        it('should store and retrieve objects', () => {
            const obj = { id: 1, name: 'test', nested: { value: true } };
            cache.set('object-key', obj, 60);

            const retrieved = cache.get('object-key');

            expect(retrieved).toEqual(obj);
            expect(retrieved.nested.value).toBe(true);
        });

        it('should store and retrieve arrays', () => {
            const arr = [1, 2, 3, { name: 'item' }];
            cache.set('array-key', arr, 60);

            const retrieved = cache.get('array-key');

            expect(retrieved).toEqual(arr);
            expect(retrieved.length).toBe(4);
        });
    });
});
