const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();
console.log("MONGO URI:", process.env.MONGODB_URI);

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Allow video loading from external sources
}));

// CORS Configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true, // Allow cookies
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body Parser & Cookie Parser
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Serve static files (HTML, CSS, JS, images, etc.)
app.use(express.static(__dirname));

// Rate Limiting for public endpoints
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX || 100,
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/auth', limiter); // Apply to auth routes

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Import Routes
const authRoutes = require('./routes/auth');
const downloadRoutes = require('./routes/downloads');
const adminRoutes = require('./routes/admin');
const recoveryRoutes = require('./routes/recovery');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recovery', recoveryRoutes);

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Serve admin login at /admin
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/admin-dashboard/login.html');
});

// API info endpoint
app.get('/api/info', (req, res) => {
    res.json({
        status: 'success',
        message: 'Reel Downloader SaaS API is running',
        version: '2.0.0',
        endpoints: {
            auth: {
                signup: 'POST /api/auth/signup',
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout',
                me: 'GET /api/auth/me'
            },
            downloads: {
                download: 'POST /api/downloads',
                history: 'GET /api/downloads/history',
                stats: 'GET /api/downloads/stats'
            },
            admin: {
                users: 'GET /api/admin/users',
                analytics: 'GET /api/admin/analytics',
                updateUser: 'PUT /api/admin/users/:id',
                deleteUser: 'DELETE /api/admin/users/:id'
            }
        }
    });
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        status: 'success',
        message: 'Reel Downloader SaaS API v2.0',
        documentation: {
            authentication: 'All protected routes require JWT token in Authorization header or cookie',
            plans: {
                free: {
                    downloads: '10 per day',
                    price: '$0/month'
                },
                premium: {
                    downloads: 'Unlimited',
                    price: '$9.99/month'
                }
            }
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    const errorResponse = {
        status: 'error',
        message: 'Internal server error'
    };

    if (NODE_ENV === 'development') {
        errorResponse.error = err.message;
        errorResponse.stack = err.stack;
    }

    res.status(500).json(errorResponse);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Reel Downloader SaaS API v2.0`);
    console.log(`📦 Environment: ${NODE_ENV}`);
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`🔒 Rate limit: ${process.env.RATE_LIMIT_MAX || 100} requests per 15 minutes`);
    console.log(`\n📥 Endpoints:`);
    console.log(`   Auth: http://localhost:${PORT}/api/auth`);
    console.log(`   Downloads: http://localhost:${PORT}/api/downloads`);
    console.log(`   Admin: http://localhost:${PORT}/api/admin`);
    console.log(`\n⚠️  Make sure yt-dlp is installed and MongoDB is running!`);
});
