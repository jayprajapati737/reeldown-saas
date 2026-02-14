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

async function updatePassword() {
    try {
        const email = 'jaykuma809254@gmail.com';
        const newPassword = process.env.ADMIN_PASSWORD;

        if (!newPassword) {
            console.error('❌ ADMIN_PASSWORD environment variable is not set!');
            process.exit(1);
        }

        console.log(`\n🔐 Updating password for: ${email}`);

        const user = await User.findOne({ email: email });

        if (!user) {
            console.log('❌ User not found!');
            process.exit(1);
        }

        console.log(`✅ User found: ${user.name} (${user.role})`);

        // Update password
        user.password = newPassword;

        // Ensure role is superadmin
        if (user.role !== 'superadmin') {
            console.log('   Also fixing role to superadmin...');
            user.role = 'superadmin';
        }

        // Save (triggers pre-save hook for hashing)
        await user.save();

        console.log('✅ Password updated successfully!');
        console.log('✅ Account is ready for login.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

updatePassword();
