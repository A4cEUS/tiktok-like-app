const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middlewares/authMiddleware');
const { cacheMiddleware, cacheMiddlewareWithTTL } = require('../middlewares/cache');

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Get all videos
 *     responses:
 *       200:
 *         description: List of videos
 */

// Route to upload a video
router.post('/', authMiddleware, uploadController.getUploadMiddleware(), uploadController.uploadVideo);

// Route to get all videos (public) - cache for 5 minutes
router.get('/', cacheMiddlewareWithTTL(300), videoController.listVideos);

// Route to get a specific video by ID (public) - cache for 10 minutes
router.get('/:id', cacheMiddlewareWithTTL(600), videoController.getVideoById);

// Route to update a video
router.put('/:id', authMiddleware, uploadController.updateVideo);

// Route to delete a video
router.delete('/:id', authMiddleware, uploadController.deleteVideo);

// Route to get user's feed - cache for 2 minutes
router.get('/feed/my', authMiddleware, cacheMiddlewareWithTTL(120), videoController.getFeed);

// Route to search videos - cache for 3 minutes
router.get('/search', cacheMiddlewareWithTTL(180), videoController.searchVideos);

// Route to get trending videos - cache for 5 minutes
router.get('/trending', cacheMiddlewareWithTTL(300), videoController.getTrending);

module.exports = router;