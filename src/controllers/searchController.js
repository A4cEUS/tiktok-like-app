const User = require('../models/user');
const Video = require('../models/video');
const { parseHashtags } = require('../utils');

// Search users
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        
        // Search by username or full name
        const searchFilter = {
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { fullName: { $regex: query, $options: 'i' } }
            ]
        };
        
        const users = await User.find(searchFilter)
            .select('username fullName bio avatar isVerified createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        // Get total count for pagination
        const total = await User.countDocuments(searchFilter);
        
        res.status(200).json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error searching users', 
            error: error.message 
        });
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
        res.status(500).json({ 
            message: 'Error searching videos', 
            error: error.message 
        });
    }
};

// Search hashtags
exports.searchHashtags = async (req, res) => {
    try {
        const { query } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        
        // Search for hashtags in videos
        const hashtagRegex = new RegExp(query, 'i');
        const hashtagFilter = {
            hashtags: { $regex: hashtagRegex }
        };
        
        // Aggregate to get hashtag counts
        const hashtags = await Video.aggregate([
            { $match: hashtagFilter },
            { $unwind: '$hashtags' },
            { $match: { 'hashtags': { $regex: hashtagRegex } } },
            {
                $group: {
                    _id: '$hashtags',
                    count: { $sum: 1 },
                    lastUsed: { $max: '$createdAt' }
                }
            },
            { $sort: { count: -1, lastUsed: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);
        
        // Format results
        const formattedHashtags = hashtags.map(tag => ({
            tag: tag._id,
            count: tag.count,
            lastUsed: tag.lastUsed
        }));
        
        // Get total count for pagination
        const totalCount = await Video.countDocuments(hashtagFilter);
        
        res.status(200).json({
            hashtags: formattedHashtags,
            pagination: {
                page,
                limit,
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error searching hashtags', 
            error: error.message 
        });
    }
};

// Get trending hashtags
exports.getTrendingHashtags = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        // Get trending hashtags from the last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const hashtags = await Video.aggregate([
            { $match: { createdAt: { $gte: oneWeekAgo } } },
            { $unwind: '$hashtags' },
            {
                $group: {
                    _id: '$hashtags',
                    count: { $sum: 1 },
                    lastUsed: { $max: '$createdAt' }
                }
            },
            { $sort: { count: -1, lastUsed: -1 } },
            { $limit: limit }
        ]);
        
        // Format results
        const formattedHashtags = hashtags.map(tag => ({
            tag: tag._id,
            count: tag.count,
            lastUsed: tag.lastUsed
        }));
        
        res.status(200).json({
            hashtags: formattedHashtags
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error retrieving trending hashtags', 
            error: error.message 
        });
    }
};