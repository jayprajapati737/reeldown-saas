const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Download = require('../models/Download');

// @route   GET /api/admin
// @desc    Get admin API info
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
    res.json({
        status: 'success',
        message: 'Admin API',
        endpoints: {
            users: 'GET /api/admin/users',
            analytics: 'GET /api/admin/analytics',
            updateUser: 'PUT /api/admin/users/:id',
            deleteUser: 'DELETE /api/admin/users/:id'
        }
    });
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Only show active users by default
        const users = await User.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .select('-password');

        const total = await User.countDocuments({ isActive: true });

        res.json({
            status: 'success',
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching users'
        });
    }
});

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
// @access  Private/Admin
router.get('/analytics', protect, adminOnly, async (req, res) => {
    try {
        // Total users
        const totalUsers = await User.countDocuments();
        const freeUsers = await User.countDocuments({ plan: 'free' });
        const premiumUsers = await User.countDocuments({ plan: 'premium' });

        // Total downloads
        const totalDownloads = await Download.countDocuments();

        // Today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayDownloads = await Download.countDocuments({
            timestamp: { $gte: today }
        });

        const todaySignups = await User.countDocuments({
            createdAt: { $gte: today }
        });

        // This week's stats
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const weekDownloads = await Download.countDocuments({
            timestamp: { $gte: weekAgo }
        });

        const weekSignups = await User.countDocuments({
            createdAt: { $gte: weekAgo }
        });

        // Downloads by day (last 7 days)
        const downloadsByDay = await Download.aggregate([
            {
                $match: {
                    timestamp: { $gte: weekAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Most active users
        const topUsers = await Download.aggregate([
            {
                $group: {
                    _id: '$user',
                    downloadCount: { $sum: 1 }
                }
            },
            {
                $sort: { downloadCount: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $unwind: '$userInfo'
            },
            {
                $project: {
                    email: '$userInfo.email',
                    name: '$userInfo.name',
                    plan: '$userInfo.plan',
                    downloadCount: 1
                }
            }
        ]);

        res.json({
            status: 'success',
            data: {
                users: {
                    total: totalUsers,
                    free: freeUsers,
                    premium: premiumUsers
                },
                downloads: {
                    total: totalDownloads,
                    today: todayDownloads,
                    thisWeek: weekDownloads
                },
                signups: {
                    today: todaySignups,
                    thisWeek: weekSignups
                },
                charts: {
                    downloadsByDay,
                    topUsers
                }
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching analytics'
        });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user plan
// @access  Private/Admin
router.put('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const { plan } = req.body;

        if (!['free', 'premium', 'admin'].includes(plan)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid plan type'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        user.plan = plan;

        // Set limits based on plan
        if (plan === 'premium' || plan === 'admin') {
            user.downloadsLimit = 999999; // Essentially unlimited
        } else {
            user.downloadsLimit = 10;
        }

        await user.save();

        res.json({
            status: 'success',
            message: 'User plan updated successfully',
            user
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating user'
        });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Disable user (soft delete)
// @access  Private/Admin
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const { generateRecoveryToken, sendRecoveryEmail } = require('../services/emailService');

        const userToDelete = await User.findById(req.params.id);

        if (!userToDelete) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Check if trying to disable a superadmin
        if (userToDelete.role === 'superadmin') {
            // Count active superadmins
            const activeSuperAdmins = await User.countDocuments({
                role: 'superadmin',
                isActive: true
            });

            // Prevent disabling the last superadmin
            if (activeSuperAdmins <= 1) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Cannot disable the last superadmin account'
                });
            }

            // Generate recovery token
            const recoveryToken = generateRecoveryToken();
            userToDelete.recoveryToken = recoveryToken;
            userToDelete.recoveryTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

            // Send recovery email
            await sendRecoveryEmail(userToDelete, recoveryToken);
        }

        // Soft delete - set isActive to false
        userToDelete.isActive = false;
        await userToDelete.save();

        res.json({
            status: 'success',
            message: userToDelete.role === 'superadmin'
                ? 'Superadmin account disabled. Recovery email sent.'
                : 'User account disabled successfully'
        });
    } catch (error) {
        console.error('Disable user error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error disabling user'
        });
    }
});

// @route   GET /api/admin/users/disabled
// @desc    Get all disabled users
// @access  Private/Superadmin
router.get('/users/disabled', protect, async (req, res) => {
    try {
        const { superAdminOnly } = require('../middleware/auth');

        // Check superadmin access
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Superadmin privileges required.'
            });
        }

        const disabledUsers = await User.find({ isActive: false })
            .sort({ updatedAt: -1 })
            .select('-password');

        res.json({
            status: 'success',
            data: {
                users: disabledUsers,
                count: disabledUsers.length
            }
        });
    } catch (error) {
        console.error('Get disabled users error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching disabled users'
        });
    }
});

// @route   PUT /api/admin/users/:id/restore
// @desc    Restore disabled user
// @access  Private/Superadmin
router.put('/users/:id/restore', protect, async (req, res) => {
    try {
        // Check superadmin access
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Superadmin privileges required.'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        user.isActive = true;
        user.recoveryToken = null;
        user.recoveryTokenExpiry = null;
        await user.save();

        res.json({
            status: 'success',
            message: 'User account restored successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Restore user error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error restoring user'
        });
    }
});

// @route   POST /api/admin/approve-superadmin/:id
// @desc    Approve superadmin restoration
// @access  Private/Superadmin
router.post('/approve-superadmin/:id', protect, async (req, res) => {
    try {
        const { sendApprovalConfirmation } = require('../services/emailService');

        // Check superadmin access
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Superadmin privileges required.'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Restore full superadmin privileges
        user.role = 'superadmin';
        user.isActive = true;
        await user.save();

        // Send confirmation email
        await sendApprovalConfirmation(user);

        res.json({
            status: 'success',
            message: 'Superadmin access restored successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Approve superadmin error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error approving superadmin'
        });
    }
});

module.exports = router;
