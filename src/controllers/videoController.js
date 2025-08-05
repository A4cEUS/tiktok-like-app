const Video = require('../models/video');
const User = require('../models/user');
const { cacheMiddleware, invalidateCache } = require('../middlewares/cache');

// Get video details by ID
exports.getVideoById = async (req, res) => {
    try {
        const videoId = req.params.id;
        
        // Find video and populate user info
        const video = await Video.findById(videoId)
            .populate('user', 'username fullName avatar isVerified');
        
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        
        // Increment view count
        video.viewsCount += 1;
        await video.save();
        
        res.status(200).json(video);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving video', error: error.message });
    }
};

// List videos with pagination and filtering
exports.listVideos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build filter
        const filter = { visibility: 'public' };
        
        // Add hashtag filter if provided
        if (req.query.hashtag) {
            filter.hashtags = req.query.hashtag.toLowerCase();
        }
        
        // Add user filter if provided
        if (req.query.userId) {
            filter.userId = req.query.userId;
        }
        
        // Get videos
        const videos = await Video.find(filter)
            .populate('user', 'username fullName avatar isVerified')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        // Get total count for pagination
        const total = await Video.countDocuments(filter);
        
        res.status(200).json({
            videos,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving videos', error: error.message });
    }
};

// Get videos for user's feed (following users)
exports.getFeed = async (req, res) => {
    try {
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Get users that current user is following
        const Follow = require('../models/follow');
        const following = await Follow.find({ follower: userId })
            .select('following');
        
        const followingIds = following.map(f => f.following);
        // Include user's own videos
        followingIds.push(userId);
        
        // Get videos from followed users
        const videos = await Video.find({
            userId: { $in: followingIds },
            visibility: 'public'
        })
        .populate('user', 'username fullName avatar isVerified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
        
        // Get total count for pagination
        const total = await Video.countDocuments({
            userId: { $in: followingIds },
            visibility: 'public'
        });
        
        res.status(200).json({
            videos,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving feed', error: error.message });
    }
};

// Search videos
exports.searchVideos = async (req, res) => {
    try {
        const { query } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        
        // Search by title, description, or hashtags
        const searchFilter = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { hashtags: { $in: [query.toLowerCase()] } }
            ],
            visibility: 'public'
        };
        
        const videos = await Video.find(searchFilter)
            .populate('user', 'username fullName avatar isVerified')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        // Get total count for pagination
        const total = await Video.countDocuments(searchFilter);
        
        res.status(200).json({
            videos,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error searching videos', error: error.message });
    }
};

// Get trending videos
exports.getTrending = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Get videos sorted by views and likes in the last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const videos = await Video.find({
            visibility: 'public',
            createdAt: { $gte: oneWeekAgo }
        })
        .populate('user', 'username fullName avatar isVerified')
        .sort({ viewsCount: -1, likesCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);
        
        // Get total count for pagination
        const total = await Video.countDocuments({
            visibility: 'public',
            createdAt: { $gte: oneWeekAgo }
        });
        
        res.status(200).json({
            videos,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving trending videos', error: error.message });
    }
};