const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { exec } = require('child_process');
const { promisify } = require('util');
const validator = require('validator');
const { protect } = require('../middleware/auth');
const Download = require('../models/Download');

const execPromise = promisify(exec);

// URL Validation Function
function validateInstagramUrl(url) {
    if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
        return { valid: false, error: 'Invalid URL format' };
    }

    const instagramPattern = /^https?:\/\/(www\.)?instagram\.com\/reel\/[a-zA-Z0-9_-]+\/?(\?.*)?$/;
    if (!instagramPattern.test(url)) {
        return { valid: false, error: 'URL must be a valid Instagram Reel link' };
    }

    const suspiciousPatterns = [/[;|`$()]/, /\<script\>/i, /\.\./];
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(url)) {
            return { valid: false, error: 'URL contains invalid characters' };
        }
    }

    return { valid: true };
}

// Sanitize URL
function sanitizeUrl(url) {
    return url.replace(/[^a-zA-Z0-9\-_./:?=&]/g, '');
}

// @route   POST /api/downloads
// @desc    Download a reel (with limits for free users)
// @access  Private
router.post('/', protect, [
    body('url').notEmpty().withMessage('URL is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: errors.array()[0].msg
            });
        }

        const { url } = req.body;

        // Validate URL
        const validation = validateInstagramUrl(url);
        if (!validation.valid) {
            return res.status(400).json({
                status: 'error',
                message: validation.error
            });
        }

        // Check if user can download
        if (!req.user.canDownload()) {
            const hoursUntilReset = Math.ceil((req.user.resetDate - new Date()) / (1000 * 60 * 60));
            return res.status(429).json({
                status: 'error',
                message: `Daily download limit reached. Resets in ${hoursUntilReset} hours.`,
                upgradeRequired: true,
                resetDate: req.user.resetDate
            });
        }

        console.log(`Processing download for user ${req.user.email}: ${url}`);

        // Sanitize URL
        const sanitizedUrl = sanitizeUrl(url);

        // Use yt-dlp to get download URL
        const command = `yt-dlp -f best --get-url --no-warnings "${sanitizedUrl}"`;

        const { stdout, stderr } = await execPromise(command, {
            timeout: 30000,
            maxBuffer: 1024 * 1024,
            shell: false
        });

        if (stderr && !stdout) {
            console.error('yt-dlp error:', stderr);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to fetch video. Please check the URL and try again.'
            });
        }

        const downloadUrl = stdout.trim();

        if (!downloadUrl || !validator.isURL(downloadUrl)) {
            return res.status(500).json({
                status: 'error',
                message: 'Could not retrieve download URL'
            });
        }

        // Increment user's download count
        await req.user.incrementDownloads();

        // Save download record
        await Download.create({
            user: req.user._id,
            reelUrl: url,
            downloadUrl: downloadUrl,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'] || ''
        });

        console.log('Download URL retrieved successfully');

        res.json({
            status: 'success',
            downloadUrl: downloadUrl,
            message: 'Video URL retrieved successfully',
            downloadsRemaining: req.user.plan === 'free' ?
                req.user.downloadsLimit - req.user.downloadsUsed : 'unlimited'
        });

    } catch (error) {
        console.error('Download error:', error);

        if (error.killed) {
            return res.status(408).json({
                status: 'error',
                message: 'Request timeout. Please try again.'
            });
        }

        if (error.code === 'ENOENT') {
            return res.status(500).json({
                status: 'error',
                message: 'yt-dlp is not installed.'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'An error occurred while processing your request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @route   GET /api/downloads/history
// @desc    Get user's download history
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const downloads = await Download.find({ user: req.user._id })
            .sort({ timestamp: -1 })
            .limit(limit)
            .skip(skip)
            .select('-__v');

        const total = await Download.countDocuments({ user: req.user._id });

        res.json({
            status: 'success',
            data: {
                downloads,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching download history'
        });
    }
});

// @route   GET /api/downloads/stats
// @desc    Get user's download statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const totalDownloads = await Download.countDocuments({ user: req.user._id });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayDownloads = await Download.countDocuments({
            user: req.user._id,
            timestamp: { $gte: today }
        });

        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weekDownloads = await Download.countDocuments({
            user: req.user._id,
            timestamp: { $gte: weekAgo }
        });

        res.json({
            status: 'success',
            data: {
                totalDownloads,
                todayDownloads,
                weekDownloads,
                downloadsUsed: req.user.downloadsUsed,
                downloadsLimit: req.user.downloadsLimit,
                plan: req.user.plan,
                resetDate: req.user.resetDate
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching statistics'
        });
    }
});

module.exports = router;
