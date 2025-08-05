# TikTok Clone App

This project is a TikTok-like application that allows users to upload videos, comment on them, like them, and share them with others. The application is built using Node.js as the backend framework with a MongoDB database.

## Features

- User authentication (registration and login)
- Video upload and retrieval
- Commenting on videos
- Liking and unliking videos
- Following/unfollowing users
- Video feed with pagination
- Search functionality for videos and users
- Video processing and transcoding
- Caching for better performance
- Rate limiting and security enhancements
- Comprehensive error handling
- Logging and monitoring
- API documentation

## Project Structure

```
tiktok-clone-app
├── src
│   ├── controllers
│   │   ├── authController.js
│   │   ├── videoController.js
│   │   ├── commentController.js
│   │   ├── likeController.js
│   │   ├── followController.js
│   │   ├── searchController.js
│   │   └── uploadController.js
│   ├── models
│   │   ├── user.js
│   │   ├── video.js
│   │   ├── comment.js
│   │   ├── like.js
│   │   └── follow.js
│   ├── routes
│   │   ├── auth.js
│   │   ├── videos.js
│   │   ├── comments.js
│   │   ├── likes.js
│   │   ├── follows.js
│   │   └── search.js
│   ├── middlewares
│   │   ├── authMiddleware.js
│   │   ├── rateLimiter.js
│   │   ├── logger.js
│   │   └── cache.js
│   ├── services
│   │   └── videoProcessing.js
│   ├── config
│   │   └── index.js
│   ├── utils
│   │   └── index.js
│   └── app.js
├── tests
│   └── api.test.js
├── docs
│   └── api.md
├── uploads
│   ├── videos
│   └── thumbnails
├── logs
├── package.json
├── .env
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd tiktok-clone-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory and add your environment variables (e.g., database connection strings, secret keys).

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
TEST_DATABASE_URL=your_test_mongodb_connection_string
```

## Usage

To start the application, run the following command:

```
npm start
```

For development with auto-restart:

```
npm run dev
```

The server will start, and you can access the API endpoints for user authentication, video management, commenting, and liking.

## API Documentation

API documentation is available in the `docs/api.md` file and through the Swagger UI at `/api-docs` endpoint.

## Testing

To run tests:

```
npm test
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License.