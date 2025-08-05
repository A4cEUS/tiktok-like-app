const Comment = require('../models/comment');
const Video = require('../models/video');
const { invalidateCachePattern } = require('../middlewares/cache');

// Add a new comment
exports.addComment = async (req, res) => {
    try {
        const { content, videoId } = req.body;
        const userId = req.userId;
        
        // Check if the video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        
        const newComment = new Comment({
            content,
            videoId,
            userId
        });
        
        await newComment.save();
        
        // Increment comments count on video
        video.commentsCount += 1;
        await video.save();
        
        // Populate user info
        await newComment.populate('userId', 'username fullName avatar isVerified').execPopulate();
        
        // Invalidate cache for this video
        invalidateCachePattern(`/api/videos/${videoId}`);
        
        res.status(201).json({
            message: 'Comment added successfully',
            comment: newComment
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};

// Get comments for a video with pagination
exports.getComments = async (req, res) => {
    try {
        const { videoId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Check if the video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        
        const comments = await Comment.find({ videoId })
            .populate('userId', 'username fullName avatar isVerified')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        // Get total count for pagination
        const total = await Comment.countDocuments({ videoId });
        
        res.status(200).json({
            comments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving comments', error: error.message });
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.userId;
        
        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        // Check if user owns the comment or is admin
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this comment' });
        }
        
        // Delete comment
        await Comment.findByIdAndDelete(commentId);
        
        // Decrement comments count on video
        const video = await Video.findById(comment.videoId);
        if (video) {
            video.commentsCount = Math.max(0, video.commentsCount - 1);
            await video.save();
            
            // Invalidate cache for this video
            invalidateCachePattern(`/api/videos/${comment.videoId}`);
        }
        
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
};

// Update a comment
exports.updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.userId;
        
        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        // Check if user owns the comment
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to update this comment' });
        }
        
        // Update comment
        comment.content = content;
        await comment.save();
        
        // Populate user info
        await comment.populate('userId', 'username fullName avatar isVerified').execPopulate();
        
        res.status(200).json({
            message: 'Comment updated successfully',
            comment
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating comment', error: error.message });
    }
};