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

async function checkUserStatus() {
    try {
        const email = 'jaykuma809254@gmail.com';
        const user = await User.findOne({ email: email });

        if (user) {
            console.log('\n📋 User Account Status:');
            console.log('   Name:', user.name);
            console.log('   Email:', user.email);
            console.log('   Role:', user.role);
            console.log('   Plan:', user.plan);
            console.log('   Is Active:', user.isActive);
            console.log('   Downloads Used:', user.downloadsUsed);
            console.log('   Downloads Limit:', user.downloadsLimit);
            console.log('   Created At:', user.createdAt);

            if (!user.isActive) {
                console.log('\n⚠️  ACCOUNT IS DISABLED!');
                console.log('   Enabling account...');
                user.isActive = true;
                await user.save();
                console.log('✅ Account enabled successfully!');
            } else {
                console.log('\n✅ Account is active and ready to use!');
            }

            if (!user.role || user.role === 'user') {
                console.log('\n⚠️  User role needs to be set to superadmin');
                user.role = 'superadmin';
                await user.save();
                console.log('✅ Role updated to superadmin!');
            }
        } else {
            console.log(`❌ User not found with email: ${email}`);
            console.log('\nSearching for all users...');
            const allUsers = await User.find({}).select('name email role isActive');
            console.log('\n📋 All Users in Database:');
            allUsers.forEach((u, index) => {
                console.log(`   ${index + 1}. ${u.name} (${u.email}) - Role: ${u.role}, Active: ${u.isActive}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Add timeout to prevent hanging
setTimeout(() => {
    console.error('❌ Operation timed out');
    process.exit(1);
}, 15000);

checkUserStatus();
