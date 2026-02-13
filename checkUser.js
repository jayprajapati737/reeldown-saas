require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

async function checkUser() {
    try {
        const user = await User.findOne({ email: 'jaykuma809254@email.com' });

        if (user) {
            console.log('\n📋 User Details:');
            console.log('   Name:', user.name);
            console.log('   Email:', user.email);
            console.log('   Plan:', user.plan);
            console.log('   Downloads Limit:', user.downloadsLimit);
            console.log('   Downloads Used:', user.downloadsUsed);
            console.log('   Created At:', user.createdAt);

            if (user.plan !== 'admin') {
                console.log('\n⚠️  User is NOT an admin. Updating...');
                user.plan = 'admin';
                user.downloadsLimit = 999999;
                await user.save();
                console.log('✅ User updated to admin successfully!');
            } else {
                console.log('\n✅ User is already an admin!');
            }
        } else {
            console.log('❌ User not found with email: jaykuma809254@email.com');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkUser();
