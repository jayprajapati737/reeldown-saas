require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

async function migrateToRoles() {
    try {
        console.log('\n🔄 Starting migration to role-based system...\n');

        // Get all users
        const users = await User.find({});
        console.log(`📊 Found ${users.length} users to migrate\n`);

        let migrated = 0;
        let skipped = 0;

        for (const user of users) {
            // Skip if user already has a role set
            if (user.role && user.role !== 'user') {
                console.log(`⏭️  Skipping ${user.email} - already has role: ${user.role}`);
                skipped++;
                continue;
            }

            // Determine new role based on old plan
            let newRole = 'user';

            // Check if user has admin email from env
            if (user.email === process.env.ADMIN_EMAIL) {
                newRole = 'superadmin';
            } else if (user.plan === 'admin') {
                // Convert old admin plan to superadmin role
                newRole = 'superadmin';
            }

            // Set role and ensure isActive is true
            user.role = newRole;
            if (user.isActive === undefined) {
                user.isActive = true;
            }

            // If plan was 'admin', change it to 'free' or 'premium' based on downloads limit
            if (user.plan === 'admin') {
                user.plan = user.downloadsLimit > 100 ? 'premium' : 'free';
            }

            await user.save();

            console.log(`✅ Migrated ${user.email}:`);
            console.log(`   Role: ${newRole}`);
            console.log(`   Plan: ${user.plan}`);
            console.log(`   Active: ${user.isActive}\n`);

            migrated++;
        }

        console.log('\n📈 Migration Summary:');
        console.log(`   ✅ Migrated: ${migrated} users`);
        console.log(`   ⏭️  Skipped: ${skipped} users`);
        console.log(`   📊 Total: ${users.length} users\n`);

        // Show role distribution
        const superadmins = await User.countDocuments({ role: 'superadmin' });
        const admins = await User.countDocuments({ role: 'admin' });
        const moderators = await User.countDocuments({ role: 'moderator' });
        const regularUsers = await User.countDocuments({ role: 'user' });

        console.log('👥 Role Distribution:');
        console.log(`   Superadmins: ${superadmins}`);
        console.log(`   Admins: ${admins}`);
        console.log(`   Moderators: ${moderators}`);
        console.log(`   Users: ${regularUsers}\n`);

        console.log('✅ Migration completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
}

// Run migration
migrateToRoles();
