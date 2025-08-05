const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;

class VideoProcessingService {
    constructor() {
        this.uploadDir = path.join(__dirname, '../../uploads');
        this.videoDir = path.join(this.uploadDir, 'videos');
        this.thumbnailDir = path.join(this.uploadDir, 'thumbnails');
    }
    
    // Generate thumbnail from video
    async generateThumbnail(videoPath, thumbnailPath) {
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .screenshots({
                    count: 1,
                    folder: this.thumbnailDir,
                    filename: thumbnailPath,
                    size: '320x240'
                })
                .on('end', () => {
                    resolve(path.join(this.thumbnailDir, thumbnailPath));
                })
                .on('error', (err) => {
                    reject(err);
                });
        });
    }
    
    // Transcode video to multiple formats/resolutions
    async transcodeVideo(inputPath, outputBaseName) {
        const outputs = [];
        
        // Create different resolutions
        const resolutions = [
            { name: '360p', width: 640, height: 360 },
            { name: '480p', width: 854, height: 480 },
            { name: '720p', width: 1280, height: 720 },
            { name: '1080p', width: 1920, height: 1080 }
        ];
        
        // For each resolution, create a promise for transcoding
        const transcodePromises = resolutions.map(resolution => {
            return new Promise((resolve, reject) => {
                const outputPath = `${outputBaseName}_${resolution.name}.mp4`;
                const fullOutputPath = path.join(this.videoDir, outputPath);
                
                ffmpeg(inputPath)
                    .output(fullOutputPath)
                    .videoCodec('libx264')
                    .size(`${resolution.width}x${resolution.height}`)
                    .on('end', () => {
                        outputs.push({
                            resolution: resolution.name,
                            path: `/uploads/videos/${outputPath}`
                        });
                        resolve();
                    })
                    .on('error', (err) => {
                        reject(err);
                    })
                    .run();
            });
        });
        
        try {
            await Promise.all(transcodePromises);
            return outputs;
        } catch (error) {
            throw new Error(`Video transcoding failed: ${error.message}`);
        }
    }
    
    // Get video metadata
    async getVideoMetadata(videoPath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(metadata);
                }
            });
        });
    }
    
    // Process uploaded video
    async processVideo(filename) {
        try {
            const inputPath = path.join(this.videoDir, filename);
            const outputBaseName = filename.replace(path.extname(filename), '');
            
            // Get video metadata
            const metadata = await this.getVideoMetadata(inputPath);
            
            // Generate thumbnail
            const thumbnailName = `${outputBaseName}_thumb.jpg`;
            await this.generateThumbnail(inputPath, thumbnailName);
            
            // Transcode video to multiple resolutions
            const transcodedVideos = await this.transcodeVideo(inputPath, outputBaseName);
            
            return {
                duration: metadata.format.duration,
                thumbnailUrl: `/uploads/thumbnails/${thumbnailName}`,
                transcodedVideos
            };
        } catch (error) {
            throw new Error(`Video processing failed: ${error.message}`);
        }
    }
}

module.exports = new VideoProcessingService();