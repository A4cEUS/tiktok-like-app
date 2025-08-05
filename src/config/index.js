module.exports = {
    // Server configuration
    server: {
        port: process.env.PORT || 5000,
        nodeEnv: process.env.NODE_ENV || 'development',
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true
        }
    },
    
    // Database configuration
    database: {
        url: process.env.DATABASE_URL,
        options: {
            // Remove deprecated options
        }
    },
    
    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    
    // Security configuration
    security: {
        saltRounds: parseInt(process.env.SALT_ROUNDS) || 10,
        rateLimit: {
            auth: {
                windowMs: 15 * 60 * 1000, // 15 minutes
                max: parseInt(process.env.AUTH_RATE_LIMIT) || 5
            },
            api: {
                windowMs: 15 * 60 * 1000, // 15 minutes
                max: parseInt(process.env.API_RATE_LIMIT) || 100
            },
            upload: {
                windowMs: 60 * 60 * 1000, // 1 hour
                max: parseInt(process.env.UPLOAD_RATE_LIMIT) || 20
            }
        }
    },
    
    // File upload configuration
    upload: {
        limits: {
            fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB
        },
        paths: {
            videos: process.env.VIDEO_UPLOAD_PATH || 'uploads/videos/',
            thumbnails: process.env.THUMBNAIL_UPLOAD_PATH || 'uploads/thumbnails/'
        }
    },
    
    // Cache configuration
    cache: {
        stdTTL: parseInt(process.env.CACHE_TTL) || 600, // 10 minutes
        checkperiod: parseInt(process.env.CACHE_CHECK_PERIOD) || 120
    },
    
    // Pagination configuration
    pagination: {
        defaultLimit: parseInt(process.env.DEFAULT_PAGINATION_LIMIT) || 10,
        maxLimit: parseInt(process.env.MAX_PAGINATION_LIMIT) || 50
    }
};