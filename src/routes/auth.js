const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// User registration route
router.post('/register', authController.register);

// User login route
router.post('/login', authController.login);

// Get user profile (protected route)
router.get('/profile', authMiddleware, authController.getProfile);

// Update user profile (protected route)
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;