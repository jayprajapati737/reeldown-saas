const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Not authorized to access this route. Please login.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found. Please login again.'
            });
        }

        // Check if user account is active
        if (!req.user.isActive) {
            return res.status(403).json({
                status: 'error',
                message: 'Account has been disabled. Please contact support.'
            });
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token. Please login again.'
        });
    }
};

// Admin only middleware (admin, moderator, or superadmin)
const adminOnly = (req, res, next) => {
    if (req.user && ['superadmin', 'admin', 'moderator'].includes(req.user.role)) {
        next();
    } else {
        return res.status(403).json({
            status: 'error',
            message: 'Access denied. Admin privileges required.'
        });
    }
};

// Superadmin only middleware
const superAdminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin' && req.user.isActive) {
        next();
    } else {
        return res.status(403).json({
            status: 'error',
            message: 'Access denied. Superadmin privileges required.'
        });
    }
};

// Moderator or above middleware
const moderatorOrAbove = (req, res, next) => {
    if (req.user && ['superadmin', 'admin', 'moderator'].includes(req.user.role)) {
        next();
    } else {
        return res.status(403).json({
            status: 'error',
            message: 'Access denied. Moderator privileges or higher required.'
        });
    }
};

// Premium or Admin middleware
const premiumOrAdmin = (req, res, next) => {
    if (req.user && (req.user.plan === 'premium' || ['superadmin', 'admin', 'moderator'].includes(req.user.role))) {
        next();
    } else {
        return res.status(403).json({
            status: 'error',
            message: 'Access denied. Premium subscription required.'
        });
    }
};

module.exports = { protect, adminOnly, superAdminOnly, moderatorOrAbove, premiumOrAdmin };
