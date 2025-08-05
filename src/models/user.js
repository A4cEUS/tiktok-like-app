const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    fullName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 150
    },
    avatar: {
        type: String, // URL to avatar image
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
    const payload = {
        id: this._id,
        username: this.username,
        email: this.email
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Get public profile (exclude sensitive info)
userSchema.methods.getPublicProfile = function() {
    return {
        id: this._id,
        username: this.username,
        fullName: this.fullName,
        bio: this.bio,
        avatar: this.avatar,
        isVerified: this.isVerified,
        createdAt: this.createdAt
    };
};

const User = mongoose.model('User', userSchema);

module.exports = User;