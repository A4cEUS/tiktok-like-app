const User = require('../models/user');

exports.register = async (req, res) => {
    try {
        const { username, password, email, fullName } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        
        if (existingUser) {
            return res.status(400).json({
                message: 'User with this email or username already exists'
            });
        }
        
        // Create new user
        const newUser = new User({ username, password, email, fullName });
        await newUser.save();
        
        // Generate auth token
        const token = newUser.generateAuthToken();
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: newUser.getPublicProfile()
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
            message: 'Error registering user',
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }
        
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }
        
        // Generate auth token
        const token = user.generateAuthToken();
        
        res.status(200).json({
            message: 'Login successful',
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error logging in',
            error: error.message
        });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            user: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving profile',
            error: error.message
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, bio, avatar } = req.body;
        
        // Only allow updating these fields
        const updates = {};
        if (fullName !== undefined) updates.fullName = fullName;
        if (bio !== undefined) updates.bio = bio;
        if (avatar !== undefined) updates.avatar = avatar;
        
        const user = await User.findByIdAndUpdate(
            req.userId,
            updates,
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            message: 'Profile updated successfully',
            user: user.getPublicProfile()
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
            message: 'Error updating profile',
            error: error.message
        });
    }
};