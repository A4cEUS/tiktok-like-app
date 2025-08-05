# TikTok Clone API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Video Management](#video-management)
4. [Comments](#comments)
5. [Likes](#likes)
6. [Follow System](#follow-system)
7. [Search](#search)
8. [Error Responses](#error-responses)

## Authentication

### Register User
**POST** `/api/auth/register`

Registers a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "fullName": "string",
    "bio": "string",
    "avatar": "string",
    "isVerified": "boolean",
    "createdAt": "date"
  }
}
```

### Login User
**POST** `/api/auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "fullName": "string",
    "bio": "string",
    "avatar": "string",
    "isVerified": "boolean",
    "createdAt": "date"
  }
}
```

### Get User Profile
**GET** `/api/auth/profile`

Retrieves the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "fullName": "string",
    "bio": "string",
    "avatar": "string",
    "isVerified": "boolean",
    "createdAt": "date"
  }
}
```

### Update User Profile
**PUT** `/api/auth/profile`

Updates the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "string",
  "bio": "string",
  "avatar": "string"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "string",
    "username": "string",
    "fullName": "string",
    "bio": "string",
    "avatar": "string",
    "isVerified": "boolean",
    "createdAt": "date"
  }
}
```

## User Management

### Get User by ID
**GET** `/api/users/{userId}`

Retrieves a user's public profile by ID.

**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "fullName": "string",
    "bio": "string",
    "avatar": "string",
    "isVerified": "boolean",
    "createdAt": "date"
  }
}
```

## Video Management

### Upload Video
**POST** `/api/videos`

Uploads a new video.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `video`: File (required)
- `title`: String (required)
- `description`: String
- `hashtags`: String (comma-separated)
- `location`: String
- `visibility`: String (public, private, friends)

**Response:**
```json
{
  "message": "Video uploaded successfully",
  "video": {
    "id": "string",
    "title": "string",
    "description": "string",
    "videoUrl": "string",
    "thumbnailUrl": "string",
    "userId": "string",
    "likesCount": "number",
    "commentsCount": "number",
    "viewsCount": "number",
    "duration": "number",
    "visibility": "string",
    "hashtags": ["string"],
    "location": "string",
    "createdAt": "date",
    "updatedAt": "date",
    "user": {
      "id": "string",
      "username": "string",
      "fullName": "string",
      "avatar": "string",
      "isVerified": "boolean"
    }
  }
}
```

### Get Video by ID
**GET** `/api/videos/{videoId}`

Retrieves a video by ID.

**Response:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "videoUrl": "string",
  "thumbnailUrl": "string",
  "userId": "string",
  "likesCount": "number",
  "commentsCount": "number",
  "viewsCount": "number",
  "duration": "number",
  "visibility": "string",
  "hashtags": ["string"],
  "location": "string",
  "createdAt": "date",
  "updatedAt": "date",
  "user": {
    "id": "string",
    "username": "string",
    "fullName": "string",
    "avatar": "string",
    "isVerified": "boolean"
  }
}
```

### List Videos
**GET** `/api/videos`

Retrieves a list of videos with pagination.

**Query Parameters:**
- `page`: Number (default: 1)
- `limit`: Number (default: 10, max: 50)
- `hashtag`: String
- `userId`: String

**Response:**
```json
{
  "videos": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "videoUrl": "string",
      "thumbnailUrl": "string",
      "userId": "string",
      "likesCount": "number",
      "commentsCount": "number",
      "viewsCount": "number",
      "duration": "number",
      "visibility": "string",
      "hashtags": ["string"],
      "location": "string",
      "createdAt": "date",
      "updatedAt": "date",
      "user": {
        "id": "string",
        "username": "string",
        "fullName": "string",
        "avatar": "string",
        "isVerified": "boolean"
      }
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  }
}
```

### Update Video
**PUT** `/api/videos/{videoId}`

Updates a video.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "hashtags": "string", (comma-separated)
  "location": "string",
  "visibility": "string"
}
```

**Response:**
```json
{
  "message": "Video updated successfully",
  "video": {
    "id": "string",
    "title": "string",
    "description": "string",
    "videoUrl": "string",
    "thumbnailUrl": "string",
    "userId": "string",
    "likesCount": "number",
    "commentsCount": "number",
    "viewsCount": "number",
    "duration": "number",
    "visibility": "string",
    "hashtags": ["string"],
    "location": "string",
    "createdAt": "date",
    "updatedAt": "date",
    "user": {
      "id": "string",
      "username": "string",
      "fullName": "string",
      "avatar": "string",
      "isVerified": "boolean"
    }
  }
}
```

### Delete Video
**DELETE** `/api/videos/{videoId}`

Deletes a video.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Video deleted successfully"
}
```

### Get User Feed
**GET** `/api/videos/feed/my`

Retrieves the authenticated user's feed.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Number (default: 1)
- `limit`: Number (default: 10, max: 50)

**Response:**
```json
{
  "videos": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "videoUrl": "string",
      "thumbnailUrl": "string",
      "userId": "string",
      "likesCount": "number",
      "commentsCount": "number",
      "viewsCount": "number",
      "duration": "number",
      "visibility": "string",
      "hashtags": ["string"],
      "location": "string",
      "createdAt": "date",
      "updatedAt": "date",
      "user": {
        "id": "string",
        "username": "string",
        "fullName": "string",
        "avatar": "string",
        "isVerified": "boolean"
      }
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  }
}
```

### Search Videos
**GET** `/api/videos/search`

Searches for videos.

**Query Parameters:**
- `query`: String (required)
- `page`: Number (default: 1)
- `limit`: Number (default: 10, max: 50)

**Response:**
```json
{
  "videos": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "videoUrl": "string",
      "thumbnailUrl": "string",
      "userId": "string",
      "likesCount": "number",
      "commentsCount": "number",
      "viewsCount": "number",
      "duration": "number",
      "visibility": "string",
      "hashtags": ["string"],
      "location": "string",
      "createdAt": "date",
      "updatedAt": "date",
      "user": {
        "id": "string",
        "username": "string",
        "fullName": "string",
        "avatar": "string",
        "isVerified": "boolean"
      }
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  }
}
```

### Get Trending Videos
**GET** `/api/videos/trending`

Retrieves trending videos.

**Query Parameters:**
- `page`: Number (default: 1)
- `limit`: Number (default: 10, max: 50)

**Response:**
```json
{
  "videos": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "videoUrl": "string",
      "thumbnailUrl": "string",
      "userId": "string",
      "likesCount": "number",
      "commentsCount": "number",
      "viewsCount": "number",
      "duration": "number",
      "visibility": "string",
      "hashtags": ["string"],
      "location": "string",
      "createdAt": "date",
      "updatedAt": "date",
      "user": {
        "id": "string",
        "username": "string",
        "fullName": "string",
        "avatar": "string",
        "isVerified": "boolean"
      }
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  }
}
```

## Comments

### Add Comment
**POST** `/api/comments/{videoId}`

Adds a comment to a video.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "string"
}
```

**Response:**
```json
{
  "message": "Comment added successfully",
  "comment": {
    "id": "string",
    "content": "string",
    "videoId": "string",
    "userId": "string",
    "createdAt": "date",
    "updatedAt": "date",
    "userId": {
      "id": "string",
      "username": "string",
      "fullName": "string",
      "avatar": "string",
      "isVerified": "boolean"
    }
  }
}
```

### Get Comments for Video
**GET** `/api/comments/{videoId}`

Retrieves comments for a video.

**Query Parameters:**
- `page`: Number (default: 1)
- `limit`: Number (default: 10, max: 50)

**Response:**
```json
{
  "comments": [
    {
      "id": "string",
      "content": "string",
      "videoId": "string",
      "userId": "string",
      "createdAt": "date",
      "updatedAt": "date",
      "userId": {
        "id": "string",
        "username": "string",
        "fullName": "string",
        "avatar": "string",
        "isVerified": "boolean"
      }
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  }
}
```

### Update Comment
**PUT** `/api/comments/{commentId}`

Updates a comment.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "string"
}
```

**Response:**
```json
{
  "message": "Comment updated successfully",
  "comment": {
    "id": "string",
    "content": "string",
    "videoId": "string",
    "userId": "string",
    "createdAt": "date",
    "updatedAt": "date",
    "userId": {
      "id": "string",
      "username": "string",
      "fullName": "string",
      "avatar": "string",
      "isVerified": "boolean"
    }
  }
}
```

### Delete Comment
**DELETE** `/api/comments/{commentId}`

Deletes a comment.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Comment deleted successfully"
}
```

## Likes

### Like Video
**POST** `/api/likes/{videoId}/like`

Likes a video.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Video liked successfully",
  "likesCount": "number"
}
```

### Unlike Video
**DELETE** `/api/likes/{videoId}/unlike`

Unlikes a video.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Video unliked successfully",
  "likesCount": "number"
}
```

### Get Likes for Video
**GET** `/api/likes/{videoId}/likes`

Retrieves likes for a video.

**Response:**
```json
{
  "likes": [
    {
      "id": "string",
      "userId": {
        "id": "string",
        "username": "string",
        "fullName": "string",
        "avatar": "string",
        "isVerified": "boolean"
      },
      "createdAt": "date"
    }
  ],
  "count": "number"
}
```

### Get Like Status
**GET** `/api/likes/{videoId}/status`

Checks if the authenticated user has liked a video.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "isLiked": "boolean"
}
```

## Follow System

### Follow User
**POST** `/api/follow/{userId}/follow`

Follows a user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Successfully followed user",
  "follow": {
    "id": "string",
    "follower": "string",
    "following": "string",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

### Unfollow User
**DELETE** `/api/follow/{userId}/unfollow`

Unfollows a user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Successfully unfollowed user"
}
```

### Get Followers
**GET** `/api/follow/{userId}/followers`

Retrieves followers for a user.

**Response:**
```json
{
  "followers": [
    {
      "id": "string",
      "follower": {
        "id": "string",
        "username": "string",
        "fullName": "string",
        "avatar": "string",
        "isVerified": "boolean"
      },
      "followedAt": "date"
    }
  ],
  "count": "number"
}
```

### Get Following
**GET** `/api/follow/{userId}/following`

Retrieves users that a user is following.

**Response:**
```json
{
  "following": [
    {
      "id": "string",
      "following": {
        "id": "string",
        "username": "string",
        "fullName": "string",
        "avatar": "string",
        "isVerified": "boolean"
      },
      "followedAt": "date"
    }
  ],
  "count": "number"
}
```

### Get Follow Status
**GET** `/api/follow/{userId}/status`

Checks if the authenticated user is following another user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "isFollowing": "boolean"
}
```

## Search

### Search Users
**GET** `/api/search/users`

Searches for users.

**Query Parameters:**
- `query`: String (required)
- `page`: Number (default: 1)
- `limit`: Number (default: 10, max: 50)

**Response:**
```json
{
  "users": [
    {
      "id": "string",
      "username": "string",
      "fullName": "string",
      "bio": "string",
      "avatar": "string",
      "isVerified": "boolean",
      "createdAt": "date"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  }
}
```

### Search Hashtags
**GET** `/api/search/hashtags`

Searches for hashtags.

**Query Parameters:**
- `query`: String (required)
- `page`: Number (default: 1)
- `limit`: Number (default: 10, max: 50)

**Response:**
```json
{
  "hashtags": [
    {
      "tag": "string",
      "count": "number",
      "lastUsed": "date"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "message": "Error message",
  "error": "Error details (only in development)"
}
```

### Common HTTP Status Codes:
- **400**: Bad Request - Invalid input or validation error
- **401**: Unauthorized - Missing or invalid authentication
- **403**: Forbidden - User doesn't have permission to perform action
- **404**: Not Found - Resource not found
- **500**: Internal Server Error - Unexpected server error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per 15 minutes
- **General API endpoints**: 100 requests per 15 minutes
- **Upload endpoints**: 20 requests per hour

Exceeding these limits will result in a 429 (Too Many Requests) response.