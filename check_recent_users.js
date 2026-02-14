require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        checkRecentUsers();
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

async function checkRecentUsers() {
    try {
        console.log(`\n🔎 Checking database: ${mongoose.connection.name}`);
        console.log(`📡 Host: ${mongoose.connection.host}`);

        // Find last 5 users sorted by creation time
        const users = await User.find().sort({ createdAt: -1 }).limit(5);

        console.log(`\n📊 Found ${users.length} recent users:`);

        users.forEach(user => {
            console.log(`\n👤 Name: ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   ID: ${user._id}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Created: ${user.createdAt}`);
        });

        console.log('\n✅ check completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking users:', error);
        process.exit(1);
    }
}
