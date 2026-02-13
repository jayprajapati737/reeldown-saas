const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reelUrl: {
        type: String,
        required: true
    },
    downloadUrl: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
downloadSchema.index({ user: 1, timestamp: -1 });
downloadSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Download', downloadSchema);
