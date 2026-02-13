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

async function createCorrectAdminUser() {
    try {
        // Check if admin user already exists with correct email
        const existingAdmin = await User.findOne({ email: 'jaykuma809254@gmail.com' });

        if (existingAdmin) {
            console.log('⚠️  User already exists. Updating to admin...');
            existingAdmin.plan = 'admin';
            existingAdmin.downloadsLimit = 999999;
            existingAdmin.name = 'Jay Prajapati';
            await existingAdmin.save();
            console.log('✅ User updated to admin successfully!');
        } else {
            // Create new admin user with correct email
            const adminUser = await User.create({
                name: 'Jay Prajapati',
                email: 'jaykuma809254@gmail.com',
                password: 'Jay@734170',
                plan: 'admin',
                downloadsLimit: 999999
            });

            console.log('✅ Admin user created successfully!');
        }

        console.log('\n🎉 Admin account ready!');
        console.log('   Name: Jay Prajapati');
        console.log('   Email: jaykuma809254@gmail.com');
        console.log('   Password: Jay@734170');
        console.log('   Plan: admin');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createCorrectAdminUser();
