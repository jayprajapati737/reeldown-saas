const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET /api/recovery/verify/:token
// @desc    Verify recovery token and enable limited access
// @access  Public
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Find user with valid recovery token
        const user = await User.findOne({
            recoveryToken: token,
            recoveryTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or expired recovery token'
            });
        }

        // Set role to admin-limited and reactivate account
        user.role = 'admin';
        user.isActive = true;
        user.recoveryToken = null;
        user.recoveryTokenExpiry = null;
        await user.save();

        res.json({
            status: 'success',
            message: 'Account recovered with limited admin access. Please request full access approval from another superadmin.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Recovery verification error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error verifying recovery token'
        });
    }
});

// @route   POST /api/recovery/request-approval/:id
// @desc    Request full superadmin access restoration
// @access  Private
router.post('/request-approval/:id', async (req, res) => {
    try {
        const { sendApprovalNotification } = require('../services/emailService');

        const requestingUser = await User.findById(req.params.id);

        if (!requestingUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Find all active superadmins
        const activeSuperAdmins = await User.find({
            role: 'superadmin',
            isActive: true
        });

        if (activeSuperAdmins.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No active superadmins available to approve request'
            });
        }

        // Send approval notifications
        await sendApprovalNotification(activeSuperAdmins, requestingUser);

        res.json({
            status: 'success',
            message: 'Approval request sent to active superadmins'
        });
    } catch (error) {
        console.error('Request approval error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error requesting approval'
        });
    }
});

module.exports = router;
