/**
 * Simple In-Memory Cache Utility
 * 
 * Usage:
 * const cache = require('./cache');
 * cache.set('key', data, 3600); // TTL in seconds
 * const data = cache.get('key');
 */

class SimpleCache {
  constructor() {
    this.store = new Map();
  }

  /**
   * Set cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Data to cache
   * @param {number} ttl - Time to live in seconds
   */
  set(key, value, ttl = 3600) {
    const expiresAt = Date.now() + (ttl * 1000);
    this.store.set(key, {
      value,
      expiresAt
    });
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null if expired/not found
   */
  get(key) {
    const item = this.store.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Check if key exists and is valid
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.store.clear();
  }

  /**
   * Get cache stats
   */
  stats() {
    let valid = 0;
    let expired = 0;

    this.store.forEach((item) => {
      if (Date.now() > item.expiresAt) {
        expired++;
      } else {
        valid++;
      }
    });

    return {
      total: this.store.size,
      valid,
      expired
    };
  }
}

// Export singleton instance
module.exports = new SimpleCache();
