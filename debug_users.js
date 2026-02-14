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

async function checkUsers() {
    try {
        const fs = require('fs');
        let logOutput = '';
        const log = (msg) => {
            console.log(msg);
            logOutput += msg + '\n';
        };

        const email = 'jaykuma809254@gmail.com';
        const name = 'Jay Prajapati';

        log(`\n--- Searching by EMAIL: '${email}' ---`);
        const usersByEmail = await User.find({ email: new RegExp(`^${email.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') });
        // Using regex for case-insensitive exact match to be sure

        log(`Found ${usersByEmail.length} user(s) by email.`);
        usersByEmail.forEach((user, index) => {
            log(`\n[By Email] User ${index + 1}:`);
            log(`   ID: ${user._id}`);
            log(`   Name: '${user.name}'`);
            log(`   Email: '${user.email}' (Length: ${user.email.length})`);
            log(`   Role: ${user.role}`);
            log(`   Plan: ${user.plan}`);
        });

        log(`\n--- Searching by NAME: '${name}' ---`);
        const usersByName = await User.find({ name: new RegExp(name, 'i') });

        log(`Found ${usersByName.length} user(s) by name.`);
        usersByName.forEach((user, index) => {
            log(`\n[By Name] User ${index + 1}:`);
            log(`   ID: ${user._id}`);
            log(`   Name: '${user.name}'`);
            log(`   Email: '${user.email}'`);
            log(`   Role: ${user.role}`);
        });

        log('\n--- Checking for potential duplicates ---');
        // Check if there are multiple users with similar emails
        const allUsers = await User.find({});
        const similarUsers = allUsers.filter(u => u.email.includes('jaykuma'));

        if (similarUsers.length > 0) {
            log(`Found ${similarUsers.length} users with 'jaykuma' in email:`);
            similarUsers.forEach(u => log(` - ${u.email} (${u.role}) ID: ${u._id}`));
        }

        fs.writeFileSync('debug_output.txt', logOutput);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkUsers();
