const Follow = require('../models/follow');
const User = require('../models/user');
const { invalidateCachePattern } = require('../middlewares/cache');

// Follow a user
exports.followUser = async (req, res) => {
    try {
        const { userId } = req.params; // ID of user to follow
        const followerId = req.userId; // ID of user making the request

        // Check if user is trying to follow themselves
        if (followerId === userId) {
            return res.status(400).json({
                message: 'You cannot follow yourself'
            });
        }

        // Check if user exists
        const userToFollow = await User.findById(userId);
        if (!userToFollow) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Check if already following
        const existingFollow = await Follow.findOne({
            follower: followerId,
            following: userId
        });

        if (existingFollow) {
            return res.status(400).json({
                message: 'You are already following this user'
            });
        }

        // Create follow relationship
        const follow = new Follow({
            follower: followerId,
            following: userId
        });

        await follow.save();

        // Invalidate cache for this user's followers and following
        invalidateCachePattern(`/api/follow/${userId}/followers`);
        invalidateCachePattern(`/api/follow/${followerId}/following`);
        
        // Invalidate feed cache for the follower
        invalidateCachePattern(`/api/videos/feed/my`);

        res.status(201).json({
            message: 'Successfully followed user',
            follow
        });
    } catch (error) {
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            message: 'Error following user',
            error: error.message
        });
    }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params; // ID of user to unfollow
        const followerId = req.userId; // ID of user making the request

        // Check if user exists
        const userToUnfollow = await User.findById(userId);
        if (!userToUnfollow) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Check if following relationship exists
        const follow = await Follow.findOneAndDelete({
            follower: followerId,
            following: userId
        });

        if (!follow) {
            return res.status(400).json({
                message: 'You are not following this user'
            });
        }

        // Invalidate cache for this user's followers and following
        invalidateCachePattern(`/api/follow/${userId}/followers`);
        invalidateCachePattern(`/api/follow/${followerId}/following`);
        
        // Invalidate feed cache for the follower
        invalidateCachePattern(`/api/videos/feed/my`);

        res.status(200).json({
            message: 'Successfully unfollowed user'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error unfollowing user',
            error: error.message
        });
    }
};

// Get followers for a user
exports.getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const followers = await Follow.find({ following: userId })
            .populate('follower', 'username fullName avatar isVerified')
            .select('createdAt');

        res.status(200).json({
            followers: followers.map(f => ({
                id: f._id,
                follower: f.follower,
                followedAt: f.createdAt
            })),
            count: followers.length
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving followers',
            error: error.message
        });
    }
};

// Get following for a user
exports.getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const following = await Follow.find({ follower: userId })
            .populate('following', 'username fullName avatar isVerified')
            .select('createdAt');

        res.status(200).json({
            following: following.map(f => ({
                id: f._id,
                following: f.following,
                followedAt: f.createdAt
            })),
            count: following.length
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving following',
            error: error.message
        });
    }
};

// Get follow status between two users
exports.getFollowStatus = async (req, res) => {
    try {
        const { userId } = req.params; // ID of user to check follow status for
        const currentUserId = req.userId; // ID of current user

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Check if following
        const follow = await Follow.findOne({
            follower: currentUserId,
            following: userId
        });

        res.status(200).json({
            isFollowing: !!follow
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving follow status',
            error: error.message
        });
    }
};