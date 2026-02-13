const nodemailer = require('nodemailer');

console.log('Type of nodemailer:', typeof nodemailer);
console.log('nodemailer keys:', Object.keys(nodemailer));
try {
    console.log('Type of createTransporter:', typeof nodemailer.createTransporter);
} catch (e) {
    console.log('Error accessing createTransporter:', e.message);
}
