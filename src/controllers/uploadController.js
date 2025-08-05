const multer = require('multer');
const path = require('path');
const Video = require('../models/video');
const User = require('../models/user');
const videoProcessingService = require('../services/videoProcessing');
const { invalidateCachePattern } = require('../middlewares/cache');

// Configure multer for video uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/videos/');
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only allow video files
const fileFilter = (req, file, cb) => {
    // Accept video files only
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only video files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Upload video
exports.uploadVideo = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: 'No video file provided'
            });
        }

        const { title, description, hashtags, location, visibility } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!title) {
            return res.status(400).json({
                message: 'Title is required'
            });
        }

        // Process hashtags
        let processedHashtags = [];
        if (hashtags) {
            // Convert hashtags string to array and clean them
            processedHashtags = hashtags.split(',')
                .map(tag => tag.trim().toLowerCase())
                .filter(tag => tag.length > 0);
        }

        // Process video (generate thumbnail, transcode, etc.)
        let processedVideoData = {};
        try {
            processedVideoData = await videoProcessingService.processVideo(req.file.filename);
        } catch (processingError) {
            console.error('Video processing error:', processingError);
            // Continue with upload even if processing fails
        }

        // Create video record
        const video = new Video({
            title,
            description,
            videoUrl: `/uploads/videos/${req.file.filename}`,
            thumbnailUrl: processedVideoData.thumbnailUrl,
            userId,
            hashtags: processedHashtags,
            location,
            visibility: visibility || 'public',
            duration: processedVideoData.duration
        });

        await video.save();

        // Populate user info
        await video.populate('user', 'username fullName avatar isVerified').execPopulate();

        // Invalidate cache for video lists
        invalidateCachePattern('/api/videos');
        invalidateCachePattern('/api/videos/trending');
        invalidateCachePattern(`/api/videos/feed/my`);

        res.status(201).json({
            message: 'Video uploaded successfully',
            video
        });
    } catch (error) {
        // Handle multer errors
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    message: 'File size too large. Maximum file size is 100MB.'
                });
            }
        }
        
        res.status(500).json({
            message: 'Error uploading video',
            error: error.message
        });
    }
};

// Get upload middleware
exports.getUploadMiddleware = () => {
    return upload.single('video');
};

// Update video
exports.updateVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { title, description, hashtags, location, visibility } = req.body;
        const userId = req.userId;

        // Find video
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({
                message: 'Video not found'
            });
        }

        // Check if user owns the video
        if (video.userId.toString() !== userId) {
            return res.status(403).json({
                message: 'You are not authorized to update this video'
            });
        }

        // Update fields
        if (title !== undefined) video.title = title;
        if (description !== undefined) video.description = description;
        if (location !== undefined) video.location = location;
        if (visibility !== undefined) video.visibility = visibility;

        // Process hashtags
        if (hashtags !== undefined) {
            let processedHashtags = [];
            if (hashtags) {
                processedHashtags = hashtags.split(',')
                    .map(tag => tag.trim().toLowerCase())
                    .filter(tag => tag.length > 0);
            }
            video.hashtags = processedHashtags;
        }

        await video.save();

        // Populate user info
        await video.populate('user', 'username fullName avatar isVerified').execPopulate();

        // Invalidate cache for this video and video lists
        invalidateCachePattern(`/api/videos/${videoId}`);
        invalidateCachePattern('/api/videos');
        invalidateCachePattern('/api/videos/trending');

        res.status(200).json({
            message: 'Video updated successfully',
            video
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating video',
            error: error.message
        });
    }
};

// Delete video
exports.deleteVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.userId;

        // Find video
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({
                message: 'Video not found'
            });
        }

        // Check if user owns the video
        if (video.userId.toString() !== userId) {
            return res.status(403).json({
                message: 'You are not authorized to delete this video'
            });
        }

        // Delete video
        await Video.findByIdAndDelete(videoId);

        // Invalidate cache for this video and video lists
        invalidateCachePattern(`/api/videos/${videoId}`);
        invalidateCachePattern('/api/videos');
        invalidateCachePattern('/api/videos/trending');
        invalidateCachePattern(`/api/videos/feed/my`);

        res.status(200).json({
            message: 'Video deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting video',
            error: error.message
        });
    }
};