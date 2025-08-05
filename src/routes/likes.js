const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/:videoId/like', authMiddleware, likeController.likeVideo);
router.delete('/:videoId/unlike', authMiddleware, likeController.unlikeVideo);
router.get('/:videoId/likes', likeController.getLikesForVideo);
router.get('/:videoId/status', authMiddleware, likeController.getLikeStatus);

module.exports = router;