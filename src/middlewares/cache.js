const NodeCache = require('node-cache');

// Create cache instance with default TTL of 10 minutes
const cache = new NodeCache({
    stdTTL: 600,
    checkperiod: 120
});

// Cache middleware
const cacheMiddleware = (req, res, next) => {
    const key = req.originalUrl;
    
    // Try to get cached response
    const cachedResponse = cache.get(key);
    if (cachedResponse) {
        // Return cached response
        return res.status(200).json(cachedResponse);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function (data) {
        // Cache the response for GET requests only
        if (req.method === 'GET') {
            cache.set(key, data);
        }
        // Call original json method
        originalJson.call(this, data);
    };
    
    next();
};

// Invalidate cache for a specific key
const invalidateCache = (key) => {
    cache.del(key);
};

// Invalidate cache for keys matching a pattern
const invalidateCachePattern = (pattern) => {
    const keys = cache.keys();
    const regex = new RegExp(pattern);
    keys.forEach(key => {
        if (regex.test(key)) {
            cache.del(key);
        }
    });
};

// Clear all cache
const clearCache = () => {
    cache.flushAll();
};

// Cache middleware with custom TTL
const cacheMiddlewareWithTTL = (ttlSeconds) => {
    return (req, res, next) => {
        const key = req.originalUrl;
        
        // Try to get cached response
        const cachedResponse = cache.get(key);
        if (cachedResponse) {
            // Return cached response
            return res.status(200).json(cachedResponse);
        }
        
        // Override res.json to cache the response
        const originalJson = res.json;
        res.json = function (data) {
            // Cache the response for GET requests only
            if (req.method === 'GET') {
                cache.set(key, data, ttlSeconds);
            }
            // Call original json method
            originalJson.call(this, data);
        };
        
        next();
    };
};

module.exports = {
    cacheMiddleware,
    cacheMiddlewareWithTTL,
    invalidateCache,
    invalidateCachePattern,
    clearCache
};