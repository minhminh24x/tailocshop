// File: backend/server/lib/cache.js
// Simple in-memory cache with TTL support
// Note: For production, replace with Redis using ioredis package

class MemoryCache {
    constructor() {
        this.cache = new Map();
        this.timers = new Map();
    }

    /**
     * Get cached value
     * @param {string} key 
     * @returns {any|null}
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        // Check if expired
        if (item.expiry && Date.now() > item.expiry) {
            this.del(key);
            return null;
        }

        return item.value;
    }

    /**
     * Set cached value
     * @param {string} key 
     * @param {any} value 
     * @param {number} ttlSeconds - Time to live in seconds (default: 5 minutes)
     */
    set(key, value, ttlSeconds = 300) {
        // Clear existing timer if any
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
        }

        const expiry = Date.now() + (ttlSeconds * 1000);
        this.cache.set(key, { value, expiry });

        // Auto-delete after TTL
        const timer = setTimeout(() => {
            this.del(key);
        }, ttlSeconds * 1000);

        this.timers.set(key, timer);
        return true;
    }

    /**
     * Delete cached value
     * @param {string} key 
     */
    del(key) {
        this.cache.delete(key);
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
        return true;
    }

    /**
     * Delete all keys matching a pattern
     * @param {string} pattern - Pattern with * as wildcard
     */
    delPattern(pattern) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        let count = 0;

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.del(key);
                count++;
            }
        }

        return count;
    }

    /**
     * Check if key exists
     * @param {string} key 
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Clear all cache
     */
    flush() {
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        this.cache.clear();
        this.timers.clear();
        return true;
    }

    /**
     * Get cache stats
     */
    stats() {
        return {
            keys: this.cache.size,
            memoryUsage: process.memoryUsage().heapUsed
        };
    }
}

// Singleton instance
const cache = new MemoryCache();

/**
 * Cache wrapper function for async operations
 * @param {string} key - Cache key
 * @param {Function} fn - Async function to execute if cache miss
 * @param {number} ttl - TTL in seconds
 */
export const cacheWrapper = async (key, fn, ttl = 300) => {
    const cached = cache.get(key);
    if (cached !== null) {
        return cached;
    }

    const result = await fn();
    cache.set(key, result, ttl);
    return result;
};

export default cache;
