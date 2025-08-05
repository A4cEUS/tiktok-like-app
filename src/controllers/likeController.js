const Like = require('../models/like');
const Video = require('../models/video');
const { invalidateCachePattern } = require('../middlewares/cache');

// Like a video
exports.likeVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.userId;
        
        // Check if the video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        
        // Check if the user has already liked the video
        const existingLike = await Like.findOne({ videoId, userId });
        if (existingLike) {
            return res.status(400).json({ message: 'You have already liked this video' });
        }
        
        // Create a new like
        const like = new Like({ videoId, userId });
        await like.save();
        
        // Increment likes count on video
        video.likesCount += 1;
        await video.save();
        
        // Invalidate cache for this video
        invalidateCachePattern(`/api/videos/${videoId}`);
        invalidateCachePattern('/api/videos/trending');
        
        return res.status(201).json({
            message: 'Video liked successfully',
            likesCount: video.likesCount
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Unlike a video
exports.unlikeVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.userId;
        
        // Check if the video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        
        // Check if the like exists
        const like = await Like.findOneAndDelete({ videoId, userId });
        if (!like) {
            return res.status(404).json({ message: 'Like not found' });
        }
        
        // Decrement likes count on video
        video.likesCount = Math.max(0, video.likesCount - 1);
        await video.save();
        
        // Invalidate cache for this video
        invalidateCachePattern(`/api/videos/${videoId}`);
        invalidateCachePattern('/api/videos/trending');
        
        return res.status(200).json({
            message: 'Video unliked successfully',
            likesCount: video.likesCount
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get likes for a video
exports.getLikesForVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        
        // Check if the video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        
        const likes = await Like.find({ videoId })
            .populate('userId', 'username fullName avatar isVerified')
            .select('createdAt');
        
        return res.status(200).json({
            likes,
            count: likes.length
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Check if user liked a video
exports.getLikeStatus = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.userId;
        
        // Check if the video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        
        // Check if user liked the video
        const like = await Like.findOne({ videoId, userId });
        
        return res.status(200).json({
            isLiked: !!like
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};