const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user');
const Video = require('../src/models/video');
const Comment = require('../src/models/comment');
const Like = require('../src/models/like');
const Follow = require('../src/models/follow');

// Test data
const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User'
};

const testVideo = {
    title: 'Test Video',
    description: 'This is a test video',
    hashtags: 'test,video'
};

let authToken;
let userId;
let videoId;

describe('TikTok Clone API', () => {
    // Connect to test database and clear collections before running tests
    beforeAll(async () => {
        // Connect to test database
        const testDbUrl = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/tiktok-test';
        await mongoose.connect(testDbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        // Clear database
        await User.deleteMany({});
        await Video.deleteMany({});
        await Comment.deleteMany({});
        await Like.deleteMany({});
        await Follow.deleteMany({});
    });

    // Close database connection after tests
    afterAll(async () => {
        await mongoose.connection.close();
    });

    // Test user registration
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser)
                .expect(201);
            
            expect(res.body).toHaveProperty('message', 'User registered successfully');
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('id');
            expect(res.body.user).toHaveProperty('username', testUser.username);
            
            authToken = res.body.token;
            userId = res.body.user.id;
        });

        it('should not register a user with existing email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser)
                .expect(400);
            
            expect(res.body).toHaveProperty('message');
        });
    });

    // Test user login
    describe('POST /api/auth/login', () => {
        it('should login an existing user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                })
                .expect(200);
            
            expect(res.body).toHaveProperty('message', 'Login successful');
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('user');
        });

        it('should not login with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                })
                .expect(401);
            
            expect(res.body).toHaveProperty('message', 'Invalid credentials');
        });
    });

    // Test get user profile
    describe('GET /api/auth/profile', () => {
        it('should get user profile', async () => {
            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('id', userId);
            expect(res.body.user).toHaveProperty('username', testUser.username);
        });

        // Test update user profile
        describe('PUT /api/auth/profile', () => {
            it('should update user profile', async () => {
                const res = await request(app)
                    .put('/api/auth/profile')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        fullName: 'Updated Test User',
                        bio: 'This is a test bio'
                    })
                    .expect(200);
                
                expect(res.body).toHaveProperty('message', 'Profile updated successfully');
                expect(res.body).toHaveProperty('user');
                expect(res.body.user).toHaveProperty('fullName', 'Updated Test User');
                expect(res.body.user).toHaveProperty('bio', 'This is a test bio');
            });
        });
    });

    // Test video management
    describe('Video Management', () => {
        // Test get video by ID
        describe('GET /api/videos/:id', () => {
            it('should get video by ID', async () => {
                // First create a video
                const video = new Video({
                    title: 'Test Video',
                    description: 'This is a test video',
                    videoUrl: '/uploads/videos/test.mp4',
                    userId: userId
                });
                await video.save();
                videoId = video._id;

                const res = await request(app)
                    .get(`/api/videos/${videoId}`)
                    .expect(200);
                
                expect(res.body).toHaveProperty('title', 'Test Video');
                expect(res.body).toHaveProperty('description', 'This is a test video');
            });
        });

        // Test list videos
        describe('GET /api/videos', () => {
            it('should list videos', async () => {
                const res = await request(app)
                    .get('/api/videos')
                    .expect(200);
                
                expect(res.body).toHaveProperty('videos');
                expect(res.body).toHaveProperty('pagination');
            });
        });

        // Test like video
        describe('POST /api/likes/:videoId/like', () => {
            it('should like a video', async () => {
                const res = await request(app)
                    .post(`/api/likes/${videoId}/like`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(201);
                
                expect(res.body).toHaveProperty('message', 'Video liked successfully');
            });
        });

        // Test get likes for video
        describe('GET /api/likes/:videoId/likes', () => {
            it('should get likes for a video', async () => {
                const res = await request(app)
                    .get(`/api/likes/${videoId}/likes`)
                    .expect(200);
                
                expect(res.body).toHaveProperty('likes');
                expect(res.body).toHaveProperty('count');
            });
        });

        // Test get like status
        describe('GET /api/likes/:videoId/status', () => {
            it('should get like status', async () => {
                const res = await request(app)
                    .get(`/api/likes/${videoId}/status`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(200);
                
                expect(res.body).toHaveProperty('isLiked', true);
            });
        });

        // Test unlike video
        describe('DELETE /api/likes/:videoId/unlike', () => {
            it('should unlike a video', async () => {
                const res = await request(app)
                    .delete(`/api/likes/${videoId}/unlike`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(200);
                
                expect(res.body).toHaveProperty('message', 'Video unliked successfully');
            });
        });

        // Test add comment
        describe('POST /api/comments/:videoId', () => {
            it('should add a comment', async () => {
                const res = await request(app)
                    .post(`/api/comments/${videoId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        content: 'This is a test comment'
                    })
                    .expect(201);
                
                expect(res.body).toHaveProperty('message', 'Comment added successfully');
                expect(res.body).toHaveProperty('comment');
            });
        });
    });

    // Test follow system
    describe('Follow System', () => {
        // Create another user for follow tests
        let otherUser;
        let otherUserId;
        let otherAuthToken;

        beforeAll(async () => {
            // Register another user
            const otherUserData = {
                username: 'otheruser',
                email: 'other@example.com',
                password: 'password123',
                fullName: 'Other User'
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(otherUserData);

            otherUserId = res.body.user.id;
            otherAuthToken = res.body.token;
        });

        // Test follow user
        describe('POST /api/follow/:userId/follow', () => {
            it('should follow a user', async () => {
                const res = await request(app)
                    .post(`/api/follow/${otherUserId}/follow`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(201);
                
                expect(res.body).toHaveProperty('message', 'Successfully followed user');
            });
        });

        // Test get follow status
        describe('GET /api/follow/:userId/status', () => {
            it('should get follow status', async () => {
                const res = await request(app)
                    .get(`/api/follow/${otherUserId}/status`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(200);
                
                expect(res.body).toHaveProperty('isFollowing', true);
            });
        });

        // Test get followers
        describe('GET /api/follow/:userId/followers', () => {
            it('should get followers', async () => {
                const res = await request(app)
                    .get(`/api/follow/${otherUserId}/followers`)
                    .expect(200);
                
                expect(res.body).toHaveProperty('followers');
                expect(res.body).toHaveProperty('count');
            });
        });

        // Test unfollow user
        describe('DELETE /api/follow/:userId/unfollow', () => {
            it('should unfollow a user', async () => {
                const res = await request(app)
                    .delete(`/api/follow/${otherUserId}/unfollow`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(200);
                
                expect(res.body).toHaveProperty('message', 'Successfully unfollowed user');
            });
        });
    });
});