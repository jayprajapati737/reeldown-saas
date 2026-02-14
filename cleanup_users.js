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

async function cleanupUsers() {
    try {
        const targetEmail = 'jaykuma809254@gmail.com';
        const nameToClean = 'Jay Prajapati';

        console.log(`\n🧹 Starting cleanup for users with name '${nameToClean}'...`);
        console.log(`   Target (Keep): ${targetEmail}`);

        // 1. Find the main user we want to KEEP
        let mainUser = await User.findOne({ email: targetEmail });

        if (!mainUser) {
            console.log(`⚠️ Main user ${targetEmail} not found! Cleaning up others first...`);
        } else {
            console.log(`✅ Main user found: ${mainUser._id} (${mainUser.email})`);

            // Ensure main user has correct role
            if (mainUser.role !== 'superadmin') {
                console.log('   Updating role to superadmin...');
                mainUser.role = 'superadmin';
                await mainUser.save();
                console.log('   Role updated.');
            }
        }

        // 2. Find all users with the name "Jay Prajapati" OR the specific typo email
        const usersToClean = await User.find({
            $or: [
                { name: new RegExp(nameToClean, 'i') },
                { email: 'jaykuma809254@email.com' },
                { email: 'jay30122006@gmail.com' }
            ],
            email: { $ne: targetEmail } // Exclude the main user
        });

        console.log(`\nFound ${usersToClean.length} other users to delete.`);

        // 3. Delete them
        for (const user of usersToClean) {
            console.log(`Deleting: ${user.email} (ID: ${user._id}, Role: ${user.role})`);
            await User.deleteOne({ _id: user._id });
        }

        console.log('\n✅ Cleanup complete!');

        // Final verification
        const remainingUsers = await User.find({ email: { $regex: 'jay', $options: 'i' } });
        console.log(`\nRemaining users with 'jay' in email:`);
        remainingUsers.forEach(u => console.log(` - ${u.email} (${u.role})`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cleanupUsers();
