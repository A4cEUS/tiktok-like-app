const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route to add a comment
router.post('/:videoId', authMiddleware, commentController.addComment);

// Route to get comments for a video
router.get('/:videoId', commentController.getComments);

// Route to delete a comment
router.delete('/:commentId', authMiddleware, commentController.deleteComment);

// Route to update a comment
router.put('/:commentId', authMiddleware, commentController.updateComment);

module.exports = router;