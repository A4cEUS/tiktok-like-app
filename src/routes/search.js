const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const authMiddleware = require('../middlewares/authMiddleware');
const { cacheMiddleware, cacheMiddlewareWithTTL } = require('../middlewares/cache');

// Search users - cache for 3 minutes
router.get('/users', cacheMiddlewareWithTTL(180), searchController.searchUsers);

// Search videos - cache for 3 minutes
router.get('/videos', cacheMiddlewareWithTTL(180), searchController.searchVideos);

// Search hashtags - cache for 5 minutes
router.get('/hashtags', cacheMiddlewareWithTTL(300), searchController.searchHashtags);

// Get trending hashtags - cache for 10 minutes
router.get('/hashtags/trending', cacheMiddlewareWithTTL(600), searchController.getTrendingHashtags);

module.exports = router;