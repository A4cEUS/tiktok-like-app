const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const authMiddleware = require('../middlewares/authMiddleware');
const { cacheMiddleware, cacheMiddlewareWithTTL, invalidateCachePattern } = require('../middlewares/cache');

// Follow a user
router.post('/:userId/follow', authMiddleware, followController.followUser);

// Unfollow a user
router.delete('/:userId/unfollow', authMiddleware, followController.unfollowUser);

// Get followers for a user - cache for 2 minutes
router.get('/:userId/followers', cacheMiddlewareWithTTL(120), followController.getFollowers);

// Get following for a user - cache for 2 minutes
router.get('/:userId/following', cacheMiddlewareWithTTL(120), followController.getFollowing);

// Get follow status between current user and another user
router.get('/:userId/status', authMiddleware, followController.getFollowStatus);

module.exports = router;