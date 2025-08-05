require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');
const followRoutes = require('./routes/follows');
const searchRoutes = require('./routes/search');
const authMiddleware = require('./middlewares/authMiddleware');
const { authLimiter, apiLimiter, uploadLimiter } = require('./middlewares/rateLimiter');
const { accessLogger, errorLogger } = require('./middlewares/logger');

const app = express();
const PORT = config.server.port;

// Logging middleware
app.use(accessLogger);

// Security middleware
app.use(helmet());
app.use(cors(config.server.cors));

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/videos', uploadLimiter);
app.use('/api/', apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TikTok Clone API',
      version: '1.0.0',
      description: 'API documentation for TikTok Clone',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to your route files for auto doc comments
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve docs publicly (adjust path if needed)
app.use('/docs', express.static('docs'));

// Only protect API routes that need authentication
app.use('/api/videos', authMiddleware, videoRoutes);
app.use('/api/comments', authMiddleware, commentRoutes);
app.use('/api/likes', authMiddleware, likeRoutes);
app.use('/api/follow', authMiddleware, followRoutes);
app.use('/api/search', searchRoutes);

// Auth routes should be public
app.use('/api/auth', authRoutes);

// Error logging middleware
app.use(errorLogger);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: config.server.nodeEnv === 'production' ? {} : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Connect to database only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  // Remove deprecated options
  const dbOptions = {
    // Remove deprecated options
  };
  
  mongoose.connect(config.database.url, dbOptions)
      .then(() => console.log('MongoDB connected'))
      .catch(err => console.error('MongoDB connection error:', err));

  // Handle port in use error
  const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is already in use. Trying ${PORT + 1}...`);
      server.close();
      app.listen(PORT + 1, () => {
        console.log(`Server is running on port ${PORT + 1}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
}

// Export app for testing
module.exports = app;