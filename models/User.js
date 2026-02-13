const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default
    },
    role: {
        type: String,
        enum: ['superadmin', 'admin', 'moderator', 'user'],
        default: 'user'
    },
    plan: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    passwordResetToken: {
        type: String,
        default: null
    },
    passwordResetExpires: {
        type: Date,
        default: null
    },
    recoveryToken: {
        type: String,
        default: null
    },
    recoveryTokenExpiry: {
        type: Date,
        default: null
    },
    downloadsUsed: {
        type: Number,
        default: 0
    },
    downloadsLimit: {
        type: Number,
        default: 10 // Free plan limit
    },
    resetDate: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    },
    stripeCustomerId: {
        type: String,
        default: null
    },
    subscriptionId: {
        type: String,
        default: null
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'canceled', 'past_due', 'none'],
        default: 'none'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user can download
userSchema.methods.canDownload = function () {
    // Admin roles and premium users have unlimited downloads
    if (this.plan === 'premium' || ['superadmin', 'admin', 'moderator'].includes(this.role)) {
        return true;
    }

    // Check if reset date has passed
    if (new Date() > this.resetDate) {
        // Reset downloads
        this.downloadsUsed = 0;
        this.resetDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    // Check if user has downloads remaining
    return this.downloadsUsed < this.downloadsLimit;
};

// Method to increment download count
userSchema.methods.incrementDownloads = async function () {
    this.downloadsUsed += 1;
    await this.save();
};

// Method to get user info without sensitive data
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

module.exports = mongoose.model('User', userSchema);
