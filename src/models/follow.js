const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { 
    timestamps: true,
    // Ensure a user can't follow another user multiple times
    indexes: [{ follower: 1, following: 1, unique: true }]
});

// Ensure a user can't follow themselves
followSchema.pre('validate', function(next) {
    if (this.follower.equals(this.following)) {
        next(new Error('You cannot follow yourself'));
    } else {
        next();
    }
});

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;